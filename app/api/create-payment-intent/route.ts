import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

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

    const stripe = getServerStripe();

    // Check if payment intent already exists
    if (booking.payment_intent_id) {
      // Retrieve existing payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
      
      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // Create new payment intent (omit invalid receipt_email)
    const email = typeof booking.student_email === 'string' ? booking.student_email.trim() : '';
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      console.warn(`Omitting invalid receipt_email for booking ${bookingId}:`, booking.student_email);
    }

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

    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', bookingId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 