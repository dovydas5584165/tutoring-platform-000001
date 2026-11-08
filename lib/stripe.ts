/**
 * Stripe clients: a lazily created server client and the browser Stripe.js loader.
 */

import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

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