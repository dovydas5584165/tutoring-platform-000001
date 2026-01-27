import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia', // Or your specific version
});

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();

    // 1. Double check with Stripe: "Did they actually pay?"
    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (payment.status !== 'succeeded') {
      return NextResponse.json({ error: 'Not paid' }, { status: 403 });
    }

    // 2. PRINT THE TICKET (Set the Cookie)
    // This allows them to pass the Middleware Security Guard
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'test_session_token', // MUST match middleware.ts
      value: paymentIntentId,
      httpOnly: true,
      path: '/',
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
