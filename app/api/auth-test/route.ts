import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabaseClient'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia', // Use your version
});

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (payment.status !== 'succeeded') {
      return NextResponse.json({ error: 'Mokėjimas nebaigtas' }, { status: 403 });
    }

    // --- FIX: REMOVE CURRENCY TO PREVENT DB ERRORS ---
    await supabase.from('purchases').upsert({ 
      payment_intent_id: paymentIntentId,
      amount: payment.amount,
      status: 'paid'
    }, { onConflict: 'payment_intent_id' });

    // --- COOKIE NAME: test_session_token (Your Choice) ---
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'test_session_token',
      value: paymentIntentId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/',
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
