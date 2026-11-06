/**
 * Old flow: pick a tutor's availability slot → pay with Stripe → tutor accepts.
 * Switched off in favour of lesson requests (client picks 5+ times, a tutor claims one).
 * Set to true to bring the old booking table, payment form and orders list back.
 */
export const BOOKING_PAYMENTS_ENABLED = false;
