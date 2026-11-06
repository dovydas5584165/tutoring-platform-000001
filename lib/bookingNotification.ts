import { format, parseISO } from "date-fns";
import { lt } from "date-fns/locale";
import { supabase } from "./supabaseClient";

type BookingForNotification = {
  id: string;
  tutor_id: string | null;
  lesson_slug: string;
  topic?: string | null;
};

/**
 * Creates the tutor's "accept this lesson?" notification for a PAID booking,
 * at most once per booking. Called from the Stripe webhook and from the
 * non-webhook payment flow (send-invoice), so it must be safe to call twice.
 */
export async function ensureBookingNotification(
  booking: BookingForNotification,
  slots: { start_time: string }[]
) {
  if (!booking.tutor_id) return;

  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("booking_id", booking.id)
    .limit(1);

  if (existing && existing.length > 0) return;

  const when = slots[0]
    ? format(parseISO(slots[0].start_time), "PPP 'd.' p", { locale: lt })
    : "nenurodytą datą";

  const { error } = await supabase.from("notifications").insert({
    user_id: booking.tutor_id,
    booking_id: booking.id,
    is_read: false,
    message: `Ar sutinki vesti pamoką "${booking.lesson_slug}" ${when}${
      booking.topic ? `? Tema: "${booking.topic}"` : "?"
    }`,
  });

  // 23505 = unique violation: another request created it first (see unique index migration)
  if (error && error.code !== "23505") {
    console.error("Error creating tutor notification:", error);
  }
}

/** Marks every notification of a booking as handled, so the tutor can't answer it twice. */
export async function closeBookingNotifications(bookingId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("booking_id", bookingId);
  if (error) console.error("Error closing booking notifications:", error);
}
