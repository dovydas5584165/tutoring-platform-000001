import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

let serverStripe: Stripe | null = null;

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

export const getStripe = () => {
	return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
}; 