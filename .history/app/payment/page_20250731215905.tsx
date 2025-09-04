"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { lt } from "date-fns/locale";

const MOCK_SELECTED_LESSONS = [
  {
    id: 1,
    start_time: new Date().toISOString(),
    hourly_wage: 12.0,
    teacher_name: "Jonas Jonaitis",
  },
  {
    id: 2,
    start_time: new Date(Date.now() + 3600 * 1000).toISOString(),
    hourly_wage: 15.5,
    teacher_name: "Petras Petraitis",
  },
];

export default function PaymentPageMock() {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const totalPrice = MOCK_SELECTED_LESSONS.reduce(
    (total, lesson) => total + lesson.hourly_wage * 0.75,
    0
  );

  const handlePay = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      alert("Mokėjimas sėkmingai atliktas! Ačiū.");
      setPaymentLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-center">Apmokėjimas</h1>

      {MOCK_SELECTED_LESSONS.length === 0 ? (
        <p className="text-center text-gray-600">Neturite pamokų mokėjimui.</p>
      ) : (
        <>
          <ul className="mb-6 space-y-4">
            {MOCK_SELECTED_LESSONS.map((lesson) => (
              <li
                key={lesson.id}
                className="flex justify-between border rounded p-4 shadow"
              >
                <div>
                  <p className="font-semibold">
                    {format(parseISO(lesson.start_time), "yyyy-MM-dd HH:mm", {
                      locale: lt,
                    })}
                  </p>
                  <p className="text-gray-600">{lesson.teacher_name}</p>
                </div>
                <div className="font-bold text-blue-700">
                  €{(lesson.hourly_wage * 0.75).toFixed(2)}
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
            onClick={() => alert("Grįžtama į pamokų pasirinkimą")}
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
