import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '../../../lib/stripe'; // Keep your existing helper
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, product_type } = body;

    const stripe = getServerStripe();

    const TEST_PRICE_CENTS = 1400; // 14.00 EUR

    // ==========================================
    // SCENARIO 1: Tutoring Booking (Existing Logic)
    // ==========================================
    if (bookingId) {
      // Get booking details from database
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users:tutor_id (vardas, pavarde)
        `)
        .eq('id', bookingId)
        .single();

      if (error || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Check if payment intent already exists (Idempotency)
      if (booking.payment_intent_id) {
        const existingIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
        return NextResponse.json({
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        });
      }

      // Validate Email
      const email = typeof booking.student_email === 'string' ? booking.student_email.trim() : '';
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValidEmail) {
        console.warn(`Omitting invalid receipt_email for booking ${bookingId}:`, booking.student_email);
      }

      // Create new payment intent for Booking
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(booking.total_price.toString()) * 100), // Convert to cents
        currency: 'eur',
        metadata: {
          booking_id: bookingId,
          student_name: booking.student_name,
          student_email: booking.student_email,
          lesson_slug: booking.lesson_slug,
          tutor_name: booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'Unknown',
        },
        ...(isValidEmail ? { receipt_email: email } : {}),
      });

      // Update booking with payment intent ID so we don't create duplicates
      await supabase
        .from('bookings')
        .update({ payment_intent_id: paymentIntent.id })
        .eq('id', bookingId);

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // ==========================================
    // SCENARIO 2: Career Test (New Logic)
    // ==========================================
    else if (product_type === 'career_test') {
      // Fixed price: 30.00 EUR
      const amount = TEST_PRICE_CENTS; 

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          product_type: 'career_test',
          product_name: 'Karjeros analizė 2026',
          type: 'digital_good'
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // ==========================================
    // FALLBACK: Invalid Request
    // ==========================================
    else {
      return NextResponse.json(
        { error: 'Missing bookingId or product_type' }, 
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
