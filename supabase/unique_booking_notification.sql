-- Run once in the Supabase SQL editor.
-- One accept/decline notification per booking.

-- 1) remove duplicates that already exist (keep the oldest per booking)
DELETE FROM public.notifications n
WHERE n.booking_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.notifications o
    WHERE o.booking_id = n.booking_id AND o.id < n.id
  );

-- 2) make a second one impossible, even if the webhook and the payment page race
CREATE UNIQUE INDEX IF NOT EXISTS notifications_booking_id_key
  ON public.notifications (booking_id)
  WHERE booking_id IS NOT NULL;
