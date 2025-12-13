'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { lt } from 'date-fns/locale';

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

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const paymentIntent = searchParams.get('payment_intent');
  const useWebhooks = process.env.NEXT_PUBLIC_USE_STRIPE_WEBHOOKS === 'true';

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [slots, setSlots] = useState<SlotDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent' | 'failed' | 'idle'>('idle');

  const sendInvoiceEmail = async (bookingId: string) => {
    setEmailStatus('sending');
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEmailStatus('sent');
        console.log('Invoice email sent successfully:', result.messageId);
      } else {
        setEmailStatus('failed');
        console.error('Failed to send invoice email:', result.error);
      }
    } catch (error) {
      setEmailStatus('failed');
      console.error('Error sending invoice email:', error);
    }
  };

  useEffect(() => {
    if (!bookingId) {
      router.push('/');
      return;
    }

    fetchBookingDetailsAndProcessPayment();
  }, [bookingId, router]);

  const fetchBookingDetailsAndProcessPayment = async () => {
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
        console.error('Booking not found');
        router.push('/');
        return;
      }

      // If webhooks are enabled, rely on them; else, verify server-side
      if (!useWebhooks) {
        try {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, paymentIntentId: paymentIntent }),
          });

          const verifyResult = await verifyResponse.json();
          if (!verifyResponse.ok) {
            console.warn('Payment verification failed:', verifyResult.error);
          } else {
            console.log('Payment verified via server:', verifyResult.paymentIntentId);
            bookingData.payment_status = 'paid';
          }
        } catch (e) {
          console.warn('Payment verification error:', e);
        }
      } else {
        // Poll for webhook update for up to ~30 seconds
        let attempts = 0;
        while (attempts < 15 && bookingData.payment_status !== 'paid') {
          await new Promise((r) => setTimeout(r, 2000));
          const { data: refreshed } = await supabase
            .from('bookings')
            .select('payment_status')
            .eq('id', bookingId)
            .single();
          if (refreshed?.payment_status) bookingData.payment_status = refreshed.payment_status;
          attempts += 1;
        }
      }

      setBooking(bookingData);

      // Get slot details
      const { data: slotsData, error: slotsError } = await supabase
        .from('availability')
        .select('id, start_time, end_time')
        .in('id', bookingData.slot_ids);

      if (!slotsError && slotsData) {
        setSlots(slotsData);
      }

      // Send invoice email only when not using webhooks (webhook handler already sends)
      if (!useWebhooks) {
        if (bookingData.payment_status === 'paid' && bookingId) {
          await sendInvoiceEmail(bookingId);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Unable to load booking details</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-600 text-white p-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="mt-2 opacity-90">Your booking has been confirmed and payment processed</p>
          </div>

          <div className="p-6">
            {/* Email Status */}
            <div className="mb-6">
              {emailStatus === 'sending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <p className="text-blue-700">Sending invoice email...</p>
                  </div>
                </div>
              )}
              
              {emailStatus === 'sent' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700">✅ Invoice email sent successfully to {booking.student_email}</p>
                  </div>
                </div>
              )}

              {emailStatus === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700">❌ Failed to send invoice email. Please check your email configuration.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Confirmation */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Booking Confirmation</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                    <p><span className="font-medium">Student:</span> {booking.student_name}</p>
                    <p><span className="font-medium">Email:</span> {booking.student_email}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Subject:</span> {booking.lesson_slug}</p>
                    <p><span className="font-medium">Tutor:</span> {booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'TBD'}</p>
                    <p><span className="font-medium">Amount Paid:</span> <span className="text-green-600 font-bold">€{booking.total_price.toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduled Sessions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Scheduled Sessions</h3>
              <div className="space-y-3">
                {slots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium">{format(parseISO(slot.start_time), 'PPPP', { locale: lt })}</p>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(slot.start_time), 'p', { locale: lt })} - {format(parseISO(slot.end_time), 'p', { locale: lt })}
                      </p>
                    </div>
                    <div className="text-blue-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Email Invoice Sent</h4>
                    <p className="text-sm text-gray-600">You should receive a detailed invoice via email with all booking information.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Tutor Confirmation Pending</h4>
                    <p className="text-sm text-gray-600">The tutor will review and confirm your booking request.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Direct Contact</h4>
                    <p className="text-sm text-gray-600">Once confirmed, the tutor will contact you directly to coordinate the sessions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-red-800 mb-2">Cancellation Policy</h4>
              <p className="text-sm text-red-700">
                If the tutor needs to cancel your booking, you will receive an instant refund to your original payment method. 
                Refunds typically appear in your account within 3-5 business days.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Book More Lessons
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Print Confirmation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
} 