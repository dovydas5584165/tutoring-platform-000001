/**
 * Stripe clients: a lazily created server client and the browser Stripe.js loader.
 */

import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

/** Career test (Pašaukimas: test + consultation) price, set only on the server. */
export const TEST_PRICE_CENTS = 11900;

let serverStripe: Stripe | null = null;

/** Server-side Stripe client (created once). Throws if STRIPE_SECRET_KEY is missing. */
export function getServerStripe(): Stripe {
	if (!serverStripe) {
		const apiKey = process.env.STRIPE_SECRET_KEY;
		if (!apiKey) {
			throw new Error('STRIPE_SECRET_KEY is not set');
		}
		serverStripe = new Stripe(apiKey, {
			apiVersion: '2025-07-30.basil',
		});
	}
	return serverStripe;
}

/** Browser Stripe.js instance for Stripe Elements. */
export const getStripe = () => {
	return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
}; 

/**
 * True only if this PaymentIntent really paid for this booking: succeeded, created for this booking id,
 * in EUR, and for at least the booking's price. Stops someone attaching a cheap or foreign payment
 * to a booking to get it marked as paid.
 */
export function paymentCoversBooking(
	pi: Stripe.PaymentIntent,
	booking: { id: string | number; total_price: number | string }
) {
	const priceCents = Math.round(parseFloat(String(booking.total_price)) * 100);
	return (
		pi.status === 'succeeded' &&
		pi.metadata?.booking_id === String(booking.id) &&
		pi.currency === 'eur' &&
		Number.isFinite(priceCents) &&
		pi.amount_received >= priceCents
	);
}

/** Booking ids are UUIDs or numbers; anything else is rejected before it reaches a query. */
export const isBookingId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9-]{1,64}$/.test(v);
