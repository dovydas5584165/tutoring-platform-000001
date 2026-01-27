import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabaseClient'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // 1. Verify with Stripe
    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (payment.status !== 'succeeded') {
      return NextResponse.json({ error: 'Mokėjimas nebaigtas' }, { status: 403 });
    }

    // 2. Save to Database (FIXED to match your table)
    // We removed 'currency' because your table doesn't have it.
    const { error: dbError } = await supabase
      .from('purchases')
      .upsert({ 
        payment_intent_id: paymentIntentId,
        amount: payment.amount, // Matches your 'amount' integer column
        status: 'paid'          // Matches your 'status' text column
      }, { onConflict: 'payment_intent_id' });

    if (dbError) {
      console.error("Supabase Error:", dbError.message);
      // We log the error but don't stop the user, so they still get their test
    }

    // 3. Issue the Cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'test_session_token',
      value: paymentIntentId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 4,
      path: '/',
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
