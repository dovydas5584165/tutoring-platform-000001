'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../components/CheckoutForm';
import { supabase } from '../../lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { lt } from 'date-fns/locale';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingDetails {
  id: string;
  student_name: string;
  student_email: string;
  total_price: number;
  lesson_slug: string;
  payment_status: string;
  slot_ids: number[];
  users: {
    vardas: string;
    pavarde: string;
  } | null;
}

interface SlotDetails {
  id: number;
  start_time: string;
  end_time: string;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [slots, setSlots] = useState<SlotDetails[]>([]);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!bookingId) {
      setError('Rezervacijos ID yra būtinas');
      setLoading(false);
      return;
    }

    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          users:tutor_id (vardas, pavarde)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError || !bookingData) {
        setError('Rezervacija nerasta');
        setLoading(false);
        return;
      }

      if (bookingData.payment_status === 'paid') {
        router.push(`/payment-success?booking_id=${bookingId}`);
        return;
      }

      setBooking(bookingData);

      const { data: slotsData, error: slotsError } = await supabase
        .from('availability')
        .select('id, start_time, end_time')
        .in('id', bookingData.slot_ids);

      if (!slotsError && slotsData) {
        setSlots(slotsData);
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setClientSecret(data.clientSecret);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Nepavyko įkelti mokėjimo informacijos');
      setLoading(false);
    }
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: { colorPrimary: '#2563eb' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Kraunama mokėjimo informacija...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Grįžti į pradžią
          </button>
        </div>
      </div>
    );
  }

  if (!booking || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Negalima įkelti mokėjimo informacijos</p>
      </div>
    );
  }

  const options = { clientSecret, appearance };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Saugus mokėjimas</h1>
            <p className="mt-2 opacity-90">Užbaikite savo rezervacijos mokėjimą</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Rezervacijos santrauka</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="space-y-3">
                    <div><span className="font-medium">Studentas:</span> {booking.student_name}</div>
                    <div><span className="font-medium">El. paštas:</span> {booking.student_email}</div>
                    <div><span className="font-medium">Pamoka:</span> {booking.lesson_slug}</div>
                    <div><span className="font-medium">Korepetitorius:</span> {booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'TBD'}</div>
                  </div>
                </div>

                <h3 className="font-semibold mb-3">Pasirinkti laiko intervalai:</h3>
                <div className="space-y-2 mb-6">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <span>{format(parseISO(slot.start_time), 'PPP p', { locale: lt })}</span>
                      <span className="text-sm text-gray-600">
                        {format(parseISO(slot.start_time), 'p', { locale: lt })} - 
                        {format(parseISO(slot.end_time), 'p', { locale: lt })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Bendra suma:</span>
                    <span className="text-blue-600">€{booking.total_price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Informacija apie mokėjimą
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Jūsų mokėjimas bus apdorotas dabar, tačiau korepetitorius turi patvirtinti rezervaciją. 
                        Korepetitorius atsiųs pamokos nuorodą į nurodytą el. paštą apie 30 min prieš pamoką.
                        Jei korepetitorius negalėtų nei pamokos pravesti nei perkelti, Stripe automatiškai grąžins Jūsų pinigus ne ilgiau nei per 3 darbo dienas.
                        Vėlavimo atveju, nepranešus iš anksto, korepetitorius gali atsijungti po 10 min laukimo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Mokėjimo informacija</h2>
                
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm bookingId={booking.id} />
                </Elements>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Kraunama...</p></div>}>
      <PaymentContent />
    </Suspense>
  );
}
