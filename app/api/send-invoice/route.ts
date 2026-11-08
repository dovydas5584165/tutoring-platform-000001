/**
 * After a booking payment (non-webhook flow): marks it paid if needed and emails the student and the tutor.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '../../../lib/supabaseAdmin';
import { getServerStripe, isBookingId, paymentCoversBooking } from '../../../lib/stripe';
import { clientIp, rateLimit, tooMany } from '../../../lib/security';
import { sendEmail, generatePaymentSuccessEmail, generateTutorOrderEmail } from '../../../lib/email';
import { ensureBookingNotification } from '../../../lib/bookingNotification';

/** Body: { bookingId }. Sends the payment confirmation to the student and the order email to the tutor. */
export async function POST(request: NextRequest) {
  // Public endpoint that sends email: cap it per IP so it can't be used to spam students/tutors
  if (!rateLimit(`invoice:${clientIp(request)}`, 10, 10 * 60_000)) return tooMany();
  try {
    const { bookingId } = await request.json().catch(() => ({}));

    if (!isBookingId(bookingId)) {
      return NextResponse.json({ error: 'Rezervacijos ID būtinas' }, { status: 400 });
    }

    // Gauti rezervacijos duomenis el. laiškui
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        users:tutor_id (vardas, pavarde, email)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Rezervacija nerasta' }, { status: 404 });
    }

    // Patikrinti / užtikrinti, kad mokėjimas atliktas (fallback, jei DB dar neatnaujintas)
    let isPaid = booking.payment_status === 'paid';
    if (!isPaid) {
      try {
        const stripe = getServerStripe();
        let paymentIntentId: string | null = booking.payment_intent_id || null;
        let paymentStatus: string | null = null;

        // bookingId is validated above, so it can't break out of the search query
        const pi = paymentIntentId
          ? await stripe.paymentIntents.retrieve(paymentIntentId)
          : (await stripe.paymentIntents.search({ query: `metadata['booking_id']:'${bookingId}'`, limit: 1 })).data[0];

        // Only a payment made for this booking, for its full price, counts
        if (pi && paymentCoversBooking(pi, booking)) {
          paymentIntentId = pi.id;
          paymentStatus = 'succeeded';
        }

        if (paymentStatus === 'succeeded') {
          isPaid = true;
          // best-effort persist
          try {
            await supabase
              .from('bookings')
              .update({ payment_status: 'paid', payment_intent_id: paymentIntentId })
              .eq('id', bookingId);
          } catch {}
        }
      } catch (e) {
        // Ignore; we'll continue without forcing paid
      }
    }

    if (!isPaid) {
      return NextResponse.json({ error: 'Mokėjimas dar neįvykdytas' }, { status: 400 });
    }

    // Gauti pamokų laikus
    const { data: slots, error: slotsError } = await supabase
      .from('availability')
      .select('start_time, end_time')
      .in('id', booking.slot_ids);

    if (slotsError) {
      console.error('Klaida gaunant laikus:', slotsError);
      return NextResponse.json({ error: 'Nepavyko gauti rezervacijos detalių' }, { status: 500 });
    }

    // Tutor's accept/decline notification (no-op if the webhook already created it)
    await ensureBookingNotification(booking, slots || []);

    // Siųsti mokėjimo patvirtinimą studentui
    const tutorName = booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'Nežinomas';
    const successHtml = generatePaymentSuccessEmail(
      booking.student_name,
      booking.id,
      booking.lesson_slug,
      tutorName,
      slots || []
    );

    const studentEmail = String(booking.student_email || '').trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail);
    if (!isValidEmail) {
      console.warn('Skipping payment success email - invalid student email:', booking.student_email);
      return NextResponse.json({ error: 'Neteisingas kliento el. paštas' }, { status: 400 });
    }

    console.log('Sending student payment success email to:', studentEmail);
    const emailResult = await sendEmail({
      to: studentEmail, // siųsti klientui
      subject: `Mokėjimas patvirtintas - ${booking.lesson_slug}`,
      html: successHtml,
    });
    console.log('Student email result:', emailResult);

    // Also notify tutor after payment in non-webhook flow
    const tutorEmail = booking.users?.email ? String(booking.users.email).trim() : '';
    const tutorEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutorEmail);
    console.log('Tutor email check:', { tutorEmail, tutorEmailValid, hasUsers: !!booking.users });
    if (tutorEmailValid) {
      console.log('Sending tutor order email to:', tutorEmail);
      const tutorOrderHtml = generateTutorOrderEmail(
        tutorName,
        booking.student_name,
        studentEmail,
        booking.student_phone || null,
        booking.lesson_slug,
        slots || [],
        parseFloat(booking.total_price.toString())
      );
      const tutorEmailResult = await sendEmail({
        to: tutorEmail,
        subject: `🔔 Naujas apmokėtas užsakymas - ${booking.lesson_slug}`,
        html: tutorOrderHtml,
      });
      console.log('Tutor email result:', tutorEmailResult);
    } else {
      console.warn('Skipping tutor email - invalid or missing email:', tutorEmail);
    }

    if (emailResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Mokėjimo patvirtinimas išsiųstas',
        messageId: emailResult.messageId 
      });
    } else {
      console.error('Nepavyko išsiųsti el. laiško:', emailResult.error);
      return NextResponse.json({ 
        error: 'Nepavyko išsiųsti sąskaitos'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Klaida siunčiant sąskaitą:', error);
    return NextResponse.json(
      { error: 'Vidinė serverio klaida' },
      { status: 500 }
    );
  }
}

// --------- generateInvoiceEmail funkcija ---------
function generateInvoiceEmail(
  studentName: string,
  bookingId: string | number,
  totalPrice: number,
  lessonSlug: string,
  tutorName: string,
  slots: any[]
) {
  const slotList = slots.map(
    (s) => `<li>${new Date(s.start_time).toLocaleString()} - ${new Date(s.end_time).toLocaleString()}</li>`
  ).join('');

  const invoiceDate = new Date().toLocaleDateString('lt-LT');
  const invoiceNumber = `INV-${bookingId}-${Date.now()}`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Sąskaita faktūra</h2>
      <p><strong>Sąskaitos numeris:</strong> ${invoiceNumber}</p>
      <p><strong>Data:</strong> ${invoiceDate}</p>
      <hr/>
      <h3>Išrašytojas</h3>
      <p>Dovydas Žilinskas</p>
      <p>Individualios veiklos nr.: 1279916</p>
      <p>Adresas: [jūsų adresas]</p>
      <p>El. paštas: info.tiksliukai@gmail.com</p>
      <hr/>
      <h3>Gavėjas</h3>
      <p>${studentName}</p>
      <p>El. paštas: ${studentName}@example.com</p>
      <hr/>
      <h3>Paslauga</h3>
      <p>Pamoka: ${lessonSlug}</p>
      <ul>${slotList}</ul>
      <p><strong>Bendra suma:</strong> €${totalPrice.toFixed(2)}</p>
      <hr/>
      <p>Ačiū už Jūsų mokėjimą!</p>
    </div>
  `;
}
