/**
 * Checks a booking's PaymentIntent with Stripe and updates the booking's payment status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabaseClient';
import { sendEmail, generateInvoiceEmail } from '../../../lib/email';

/** Body: { bookingId, paymentIntentId? }. Returns the current payment status. */
export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentIntentId } = await request.json();
    console.log('🔍 verify-payment called with:', { bookingId, paymentIntentId });

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const stripe = getServerStripe();

    // Use the provided paymentIntentId if available, otherwise fall back to stored one
    let targetPaymentIntentId = paymentIntentId;
    
    if (!targetPaymentIntentId) {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('payment_intent_id')
        .eq('id', bookingId)
        .single();

      if (error || !booking || !booking.payment_intent_id) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      targetPaymentIntentId = booking.payment_intent_id;
    }

    console.log('🔍 Checking PaymentIntent:', targetPaymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(targetPaymentIntentId);
    console.log('🔍 PaymentIntent status:', paymentIntent.status);

    // Update booking with correct payment_intent_id if needed
    if (paymentIntentId && paymentIntent.status === 'succeeded') {
      await supabase
        .from('bookings')
        .update({ payment_intent_id: targetPaymentIntentId })
        .eq('id', bookingId);
    }

    return NextResponse.json({
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
} 