"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { lt } from "date-fns/locale";

declare global {
  interface Window {
    Stripe?: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();

  const [selectedLessons, setSelectedLessons] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    // Load lessons & total from sessionStorage
    const lessonsRaw = sessionStorage.getItem("selectedLessons");
    const totalRaw = sessionStorage.getItem("totalPrice");

    if (!lessonsRaw || !totalRaw) {
      alert("Nepavyko rasti pamokų informacijos. Grįžkite prie pamokų pasirinkimo.");
      router.push("/");
      return;
    }

    setSelectedLessons(JSON.parse(lessonsRaw));
    setTotalPrice(parseFloat(totalRaw));
  }, [router]);

  const handlePay = async () => {
    setPaymentLoading(true);

    try {
      // Call your backend API to create Stripe checkout session
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessons: selectedLessons, total: totalPrice }),
      });

      const { url, error } = await res.json();

      if (error) {
        alert("Nepavyko sukurti mokėjimo sesijos: " + error);
        setPaymentLoading(false);
        return;
      }

      if (!window.Stripe) {
        alert("Stripe biblioteka nerasta");
        setPaymentLoading(false);
        return;
      }

      const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

      await stripe.redirectToCheckout({ sessionId: url });
    } catch (err) {
      console.error(err);
      alert("Įvyko klaida kuriant mokėjimą");
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-center">Apmokėjimas</h1>

      {selectedLessons.length === 0 ? (
        <p className="text-center text-gray-600">Neturite pamokų mokėjimui.</p>
      ) : (
        <>
          <ul className="mb-6 space-y-4">
            {selectedLessons.map((slot) => (
              <li
                key={slot.id}
                className="flex justify-between border rounded p-4 shadow"
              >
                <div>
                  <p className="font-semibold">
                    {format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm", {
                      locale: lt,
                    })}
                  </p>
                  {/* You can add tutor name here if passed from booking */}
                </div>
                <div className="font-bold text-blue-700">
                  €{/* Show full hourly wage if you pass it */}
                  {/* Assuming each slot has hourly_wage passed */}
                  {slot.hourly_wage
                    ? slot.hourly_wage.toFixed(2)
                    : "0.00"}
                </div>
              </li>
            ))}
          </ul>

          <div className="text-right font-bold text-xl mb-8">
            Iš viso: €{totalPrice.toFixed(2)}
          </div>

          <button
            onClick={handlePay}
            disabled={paymentLoading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {paymentLoading ? "Apdorojama..." : "Apmokėti"}
          </button>

          <button
            onClick={() => router.push("/")}
            disabled={paymentLoading}
            className="mt-4 w-full border border-gray-400 rounded py-2 hover:bg-gray-100"
          >
            Grįžti į pamokų pasirinkimą
          </button>
        </>
      )}
    </div>
  );
}
