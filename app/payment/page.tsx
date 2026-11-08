'use client';

/**
 * Online payments are turned off: lessons are now arranged through lesson requests.
 */

import { useRouter } from 'next/navigation';

/** Notice page with a link back home. */
export default function PaymentPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Mokėjimai internetu laikinai išjungti</h1>
        <p className="text-gray-600 mb-6">Pasirinkite jums tinkamus laikus pamokos puslapyje, o mokytojas su jumis susisieks.</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Grįžti į pradžią
        </button>
      </div>
    </div>
  );
}

