/**
 * Creates Stripe PaymentIntents for a tutoring booking or for the career test.
 * Amounts always come from the server (database / constant), never from the browser.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe, TEST_PRICE_CENTS } from '../../../lib/stripe';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { clientIp, rateLimit, tooMany } from '../../../lib/security';

const BOOKING_ID_RE = /^[A-Za-z0-9-]{1,64}$/;

/** Body: { bookingId } for a lesson booking, or { product_type: 'career_test', phone } for the career test. Returns { clientSecret }. */
export async function POST(request: NextRequest) {
  if (!rateLimit(`pi:${clientIp(request)}`, 20, 10 * 60_000)) return tooMany();
  try {
    const body = await request.json().catch(() => ({}));
    const { bookingId, product_type } = body;

    const stripe = getServerStripe();

    // ==========================================
    // SCENARIO 1: Tutoring Booking
    // ==========================================
    if (bookingId) {
      if (typeof bookingId !== 'string' || !BOOKING_ID_RE.test(bookingId)) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      const { data: booking, error } = await supabaseAdmin
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
      if (booking.payment_status === 'paid') {
        return NextResponse.json({ error: 'Booking already paid' }, { status: 409 });
      }

      const amount = Math.round(parseFloat(String(booking.total_price)) * 100);
      if (!Number.isFinite(amount) || amount < 100) {
        console.error(`Refusing payment for booking ${bookingId}: bad total_price`, booking.total_price);
        return NextResponse.json({ error: 'Neteisinga kaina' }, { status: 400 });
      }

      // Reuse the existing intent (idempotency), but only if it still charges the booking's price
      if (booking.payment_intent_id) {
        const existing = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
        if (existing.amount === amount && existing.currency === 'eur' && existing.status !== 'canceled') {
          return NextResponse.json({ clientSecret: existing.client_secret, paymentIntentId: existing.id });
        }
      }

      const email = typeof booking.student_email === 'string' ? booking.student_email.trim() : '';
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
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

      await supabaseAdmin
        .from('bookings')
        .update({ payment_intent_id: paymentIntent.id })
        .eq('id', bookingId);

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // ==========================================
    // SCENARIO 2: Career Test (Pašaukimas + consultation)
    // ==========================================
    if (product_type === 'career_test') {
      const phone = String(body.phone ?? '').trim();
      if (!/^[+\d\s()-]{6,30}$/.test(phone)) {
        return NextResponse.json({ error: 'Neteisingas telefono numeris' }, { status: 400 });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: TEST_PRICE_CENTS,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          product_type: 'career_test',
          product_name: 'Pašaukimas',
          type: 'digital_good',
        },
      });

      // Recorded here (service role) instead of from the browser, so `purchases` can stay closed to anon
      const { error: insertError } = await supabaseAdmin.from('purchases').insert({
        number: phone,
        payment_intent_id: paymentIntent.id,
        status: 'pending',
        amount: TEST_PRICE_CENTS / 100,
      });
      if (insertError) console.error('purchases insert failed:', insertError);

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    return NextResponse.json({ error: 'Missing bookingId or product_type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
