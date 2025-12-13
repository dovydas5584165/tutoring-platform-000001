import { NextRequest, NextResponse } from "next/server";
import { getServerStripe } from "../../../../lib/stripe";
import { supabase } from "../../../../lib/supabaseClient";
import {
  sendEmail,
  generatePaymentSuccessEmail,
  generateTutorOrderEmail,
} from "../../../../lib/email";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  const stripe = getServerStripe();

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  const bookingId = paymentIntent.metadata.booking_id;

  // Update booking status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({ payment_status: "paid" })
    .eq("id", bookingId);

  if (bookingError) {
    console.error("Error updating booking status:", bookingError);
    return;
  }

  // Avoid duplicate payment records (Stripe retries)
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_payment_id", paymentIntent.id)
    .maybeSingle();

  if (existingPayment) {
    console.log(`Payment ${paymentIntent.id} already recorded`);
    return;
  }

  // Create payment record
  const { error: paymentError } = await supabase.from("payments").insert({
    booking_id: bookingId,
    stripe_payment_id: paymentIntent.id,
    amount: paymentIntent.amount / 100, // convert cents → euros
    currency: paymentIntent.currency,
    status: "succeeded",
    payment_method: paymentIntent.payment_method?.type || "card",
  });

  if (paymentError) {
    console.error("Error creating payment record:", paymentError);
    return;
  }

  // Fetch booking with tutor info
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      users:tutor_id (vardas, pavarde, email)
    `
    )
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    console.error("Error fetching booking for email:", fetchError);
    return;
  }

  // Fetch slots
  const { data: slots, error: slotsError } = await supabase
    .from("availability")
    .select("start_time, end_time")
    .in("id", booking.slot_ids);

  if (slotsError) {
    console.error("Error fetching slots:", slotsError);
    return;
  }

  // --- Student email ---
  const tutorName = booking.users
    ? `${booking.users.vardas} ${booking.users.pavarde}`
    : "Unknown";

  const successHtml = generatePaymentSuccessEmail(
    booking.student_name,
    booking.id,
    booking.lesson_slug,
    tutorName,
    slots || []
  );

  const studentEmail = String(booking.student_email || "").trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail);

  if (isValidEmail) {
    await sendEmail({
      to: studentEmail,
      subject: `Mokėjimas patvirtintas - ${booking.lesson_slug}`,
      html: successHtml,
    });
  } else {
    console.warn(
      "Skipping payment success email - invalid student email:",
      booking.student_email
    );
  }

  // --- Tutor email ---
  const tutorEmail = booking.users?.email
    ? String(booking.users.email).trim()
    : "";
  const tutorEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutorEmail);

  if (tutorEmailValid) {
    const tutorOrderHtml = generateTutorOrderEmail(
      tutorName,
      booking.student_name,
      studentEmail,
      booking.student_phone || null,
      booking.lesson_slug,
      slots || [],
      parseFloat(booking.total_price.toString())
    );

    await sendEmail({
      to: tutorEmail,
      subject: `🔔 Naujas apmokėtas užsakymas - ${booking.lesson_slug}`,
      html: tutorOrderHtml,
    });
  } else {
    console.warn(
      "Skipping tutor order email - invalid tutor email:",
      booking.users?.email
    );
  }

  // --- Tutor notification ---
  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: booking.tutor_id,
    booking_id: booking.id,
    is_read: false,
    message: `Ar sutinki vesti pamoką? ${booking.lesson_slug} ${
      slots?.[0]?.start_time || ""
    }`,
  });

  if (notifError) {
    console.error("Error creating tutor notification:", notifError);
  }

  console.log(`Payment succeeded for booking ${bookingId}`);
}

async function handlePaymentFailed(paymentIntent: any) {
  const bookingId = paymentIntent.metadata.booking_id;

  // Update booking status
  await supabase
    .from("bookings")
    .update({ payment_status: "failed" })
    .eq("id", bookingId);

  // Create payment record
  await supabase.from("payments").insert({
    booking_id: bookingId,
    stripe_payment_id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: "failed",
  });

  console.log(`Payment failed for booking ${bookingId}`);
}
