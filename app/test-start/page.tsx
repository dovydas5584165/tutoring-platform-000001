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

    // 1. Safety Check: Are cookies enabled?
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
          
          // --- THE FIX: INTELLIGENT REDIRECT ---
          // Instead of a timer, we check if the browser actually HAS the cookie yet.
          const checkAndRedirect = () => {
            // Check if our specific cookie exists in the browser
            if (document.cookie.includes('test_session_token')) {
              // Cookie is ready! Now we can go.
              window.location.href = '/test';
            } else {
              // Not ready yet? Wait 100ms and try again.
              setTimeout(checkAndRedirect, 100);
            }
          };
          
          // Start checking
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

  // --- UI RENDER STATES ---

  if (status === 'CookiesDisabled') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100">
          <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Slapukai išjungti</h1>
          <p className="text-slate-600 mb-6">
            Jūsų naršyklė blokuoja slapukus. Be jų negalime patvirtinti tapatybės.
          </p>
          <p className="text-xs text-slate-400">ID: {paymentIntentId}</p>
        </div>
      </div>
    );
  }

  if (status === 'Error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Nepavyko patvirtinti mokėjimo</h1>
        <p className="text-slate-500 mb-6">Jei pinigai nuskaityti, susisiekite su mumis.</p>
        <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between gap-3 mb-6 max-w-xs mx-auto">
          <code className="text-xs text-slate-600 font-mono truncate">{paymentIntentId || 'No ID'}</code>
          <button onClick={() => navigator.clipboard.writeText(paymentIntentId || '')}>
             <Copy size={14} className="text-blue-600"/>
          </button>
        </div>
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
            <div className="flex items-center justify-center gap-2 text-blue-600 font-bold animate-pulse">
              <Sparkles size={20} />
              Atidaromas testas...
            </div>
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
