/**
 * Checks a booking's PaymentIntent with Stripe and, if it really paid for this booking, marks the booking paid.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe, isBookingId, paymentCoversBooking } from '../../../lib/stripe';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { clientIp, rateLimit, tooMany } from '../../../lib/security';

/** Body: { bookingId, paymentIntentId? }. Returns the current payment status. */
export async function POST(request: NextRequest) {
  if (!rateLimit(`verify:${clientIp(request)}`, 60, 10 * 60_000)) return tooMany();
  try {
    const { bookingId, paymentIntentId } = await request.json().catch(() => ({}));
    if (!isBookingId(bookingId)) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    if (paymentIntentId !== undefined && paymentIntentId !== null &&
        (typeof paymentIntentId !== 'string' || !/^pi_[A-Za-z0-9]{8,64}$/.test(paymentIntentId))) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('id, total_price, payment_intent_id, payment_status')
      .eq('id', bookingId)
      .single();
    if (error || !booking) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const targetId = paymentIntentId || booking.payment_intent_id;
    if (!targetId) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    const paymentIntent = await getServerStripe().paymentIntents.retrieve(targetId);

    // A PaymentIntent for another booking (or a cheaper one) must never mark this booking as paid
    if (paymentIntent.metadata?.booking_id !== String(booking.id)) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (paymentCoversBooking(paymentIntent, booking) && booking.payment_status !== 'paid') {
      await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'paid', payment_intent_id: paymentIntent.id })
        .eq('id', bookingId);
    }

    return NextResponse.json({
      status: paymentCoversBooking(paymentIntent, booking) ? 'succeeded' : paymentIntent.status === 'succeeded' ? 'amount_mismatch' : paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
