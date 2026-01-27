'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Sparkles, Lock, Copy } from 'lucide-react';

function TestStartLogic() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent'); 
  const [status, setStatus] = useState<'Verifying' | 'Success' | 'Error' | 'CookiesDisabled'>('Verifying'); 

  useEffect(() => {
    if (!paymentIntentId) {
      setStatus('Error');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.cookieEnabled) {
      setStatus('CookiesDisabled');
      return;
    }

    const authorize = async () => {
      try {
        const res = await fetch('/api/auth-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (res.ok) {
          setStatus('Success');
          
          // --- SMART LOOP FIX ---
          const checkAndRedirect = () => {
            // We look for YOUR variable name: 'test_session_token'
            if (document.cookie.includes('test_session_token')) {
              window.location.href = '/test';
            } else {
              setTimeout(checkAndRedirect, 100);
            }
          };
          
          checkAndRedirect();

        } else {
          setStatus('Error');
        }
      } catch (e) {
        setStatus('Error');
      }
    };

    authorize();
  }, [paymentIntentId]);

  if (status === 'CookiesDisabled') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100">
          <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Slapukai išjungti</h1>
          <p className="text-slate-600 mb-6">Jūsų naršyklė blokuoja slapukus.</p>
        </div>
      </div>
    );
  }

  if (status === 'Error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Nepavyko patvirtinti</h1>
        <p className="text-slate-500 mb-6">Jei pinigai nuskaityti, susisiekite su mumis.</p>
        <p className="text-xs text-slate-400 mb-4">ID: {paymentIntentId}</p>
        <button onClick={() => window.location.href = '/career_test'} className="text-blue-600 font-bold underline">
          Grįžti
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
        {status === 'Verifying' ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-slate-900">Ruošiamas testas...</h2>
            <p className="text-slate-500 mt-2">Prašome palaukti, tikrinamas apmokėjimas.</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="text-green-600 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Sėkmė!</h1>
            <p className="text-slate-600 mb-6">Mokėjimas patvirtintas.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TestStartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Kraunama...</div>}>
      <TestStartLogic />
    </Suspense>
  );
}
