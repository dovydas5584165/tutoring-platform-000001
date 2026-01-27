'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// UPDATE 1: Interface now allows either bookingId OR returnUrl
interface CheckoutFormProps {
  bookingId?: string; // Made optional ( ? )
  returnUrl?: string; // New optional prop
}

export default function CheckoutForm({ bookingId, returnUrl }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter(); // Kept for consistency, though Stripe handles the redirect

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage('');

    // UPDATE 2: Smart Logic to decide where to send the user
    // If Landing Page passed a 'returnUrl', use it. 
    // Otherwise, fall back to the old booking success page.
    const finalReturnUrl = returnUrl 
      ? returnUrl 
      : `${window.location.origin}/payment-success?booking_id=${bookingId}`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // UPDATE 3: Use the variable we calculated above
        return_url: finalReturnUrl,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || 'An unexpected error occurred.');
      } else {
        setMessage("An unexpected error occurred.");
      }
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{message}</p>
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            // UPDATE 4: Button text changes based on what we are buying
            bookingId ? "Pay Now" : "Pay 30.00 €"
          )}
        </span>
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p className="mt-1">Powered by Stripe</p>
      </div>
    </form>
  );
}
