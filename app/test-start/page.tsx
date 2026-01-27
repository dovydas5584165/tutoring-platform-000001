'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TestStartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent'); 

  useEffect(() => {
    if (!paymentIntentId) return;

    // Call the "Ticket Printer" API we just made
    fetch('/api/auth-test', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    }).then((res) => {
      if (res.ok) {
        // Success! We have the ticket. Go to the test.
        router.push('/test');
      }
    });
  }, [paymentIntentId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold">Patvirtinamas mokėjimas...</h1>
        <p className="text-slate-500">Prašome palaukti, generuojamas testas.</p>
      </div>
    </div>
  );
}
