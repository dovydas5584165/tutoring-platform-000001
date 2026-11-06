import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabaseClient';
import { sendEmail, generateCancellationEmail } from '../../../lib/email';
import { closeBookingNotifications } from '../../../lib/bookingNotification';

const isProduction = process.env.NODE_ENV === 'production';
const allowDevRefundSimulation = process.env.ALLOW_DEV_REFUND_SIMULATION === 'true';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, cancelledBy, reason } = await request.json();

    console.log('🔄 Cancel booking request:', { bookingId, cancelledBy, reason });

    if (!bookingId || !cancelledBy) {
      return NextResponse.json(
        { error: 'Booking ID and cancelled_by are required' },
        { status: 400 }
      );
    }

    const stripe = getServerStripe();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        users:tutor_id (vardas, pavarde, email)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('❌ Booking not found:', bookingError);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    console.log('📋 Found booking:', {
      id: booking.id,
      payment_status: booking.payment_status,
      has_payment_intent: Boolean(booking.payment_intent_id),
    });

    // Check if booking is already cancelled
    if (booking.payment_status === 'cancelled' || booking.payment_status === 'refunded') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // Attempt to find and refund a successful payment regardless of stored payment_status
    let refundAmount = 0;
    try {
      let targetPaymentIntentId: string | null = null;
      let targetPaymentIntent: any = null;

      if (booking.payment_intent_id) {
        console.log('🔎 Checking stored PaymentIntent:', booking.payment_intent_id);
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id);
        if (paymentIntent.status === 'succeeded') {
          targetPaymentIntentId = paymentIntent.id;
          targetPaymentIntent = paymentIntent;
        }
      }

      if (!targetPaymentIntentId) {
        console.log("🔎 Searching for succeeded PaymentIntent by metadata 'booking_id'");
        const results = await stripe.paymentIntents.search({
          query: `metadata['booking_id']:'${bookingId}' AND status:'succeeded'`,
          limit: 1,
        });
        if (results.data && results.data.length > 0) {
          const found = results.data[0];
          targetPaymentIntentId = found.id;
          targetPaymentIntent = found as any;
          // Persist for future operations
          await supabase
            .from('bookings')
            .update({ payment_intent_id: found.id })
            .eq('id', bookingId);
          console.log('✅ Found and persisted succeeded PaymentIntent:', found.id);
        }
      }

      if (targetPaymentIntentId && targetPaymentIntent?.status === 'succeeded' && targetPaymentIntent.latest_charge) {
        console.log('💰 Processing refund for PaymentIntent:', targetPaymentIntentId);
        const refund = await stripe.refunds.create({
          payment_intent: targetPaymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            booking_id: bookingId,
            cancelled_by: cancelledBy,
            reason: reason || 'Tutor cancellation',
          },
        });
        refundAmount = refund.amount / 100;
        console.log('✅ Stripe refund created:', { refund_id: refund.id, amount: refundAmount });

        await supabase.from('payments').insert({
          booking_id: bookingId,
          stripe_payment_id: refund.id,
          amount: refundAmount,
          currency: refund.currency,
          status: 'refunded',
          stripe_refund_id: refund.id,
          refunded_at: new Date().toISOString(),
        });
      } else {
        console.log('⚠️ No succeeded PaymentIntent found. No refund processed.');
      }
    } catch (stripeError: any) {
      console.error('❌ Stripe refund error:', stripeError?.message || stripeError);
      if (allowDevRefundSimulation) {
        console.log('⚠️ Simulating refund (development mode)');
        refundAmount = parseFloat(booking.total_price.toString());
        await supabase.from('payments').insert({
          booking_id: bookingId,
          stripe_payment_id: `dev_refund_${Date.now()}`,
          amount: refundAmount,
          currency: 'eur',
          status: 'refunded',
          stripe_refund_id: `dev_refund_${Date.now()}`,
          refunded_at: new Date().toISOString(),
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to process refund', details: stripeError?.message || stripeError },
          { status: 500 }
        );
      }
    }

    // Update booking status (based on whether we refunded)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: refundAmount > 0 ? 'refunded' : 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('❌ Error updating booking:', updateError);
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    console.log('✅ Booking status updated');

    // Remove any other open accept/decline prompt for this booking
    await closeBookingNotifications(bookingId);

    // Free up the availability slots
    const { error: slotsError } = await supabase
      .from('availability')
      .update({ is_booked: false })
      .in('id', booking.slot_ids);

    if (slotsError) {
      console.error('⚠️ Error freeing slots:', slotsError);
    } else {
      console.log('✅ Availability slots freed');
    }

    // Always send cancellation email to student. Include refund details only when applicable.
    {
      if (!isProduction) {
        console.log('📧 Sending cancellation email to student');
      }
      
      const cancellationHtml = generateCancellationEmail(
        booking.student_name,
        booking.id,
        parseFloat(booking.total_price.toString()),
        booking.lesson_slug,
        refundAmount
      );

      const studentEmail = String(booking.student_email || '').trim();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail);
      if (!isValidEmail) {
        console.warn('Skipping cancellation email - invalid student email:', booking.student_email);
      } else {
        try {
          const emailResult = await sendEmail({
          to: studentEmail,
          subject: `Pamokos atšaukimas - ${booking.lesson_slug}`,
          html: cancellationHtml,
        });

        if (!isProduction) {
          if (emailResult.success) {
            console.log('✅ Cancellation email sent successfully');
          } else {
            console.error('❌ Failed to send cancellation email');
          }
        }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError);
        }
      }
    }

    console.log('✅ Booking cancellation completed successfully');

    // Also send cancellation email to tutor if they have an email
    const tutorEmail = booking.users?.email;
    if (!isProduction) {
      console.log('🔍 Tutor email present:', Boolean(tutorEmail));
    }
    
    if (tutorEmail && cancelledBy === 'tutor') {
      if (!isProduction) {
        console.log('📧 Sending cancellation email to tutor');
      }
      
      const tutorName = booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'Tutor';
      
      const tutorCancellationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Cancelled - Tutor Copy</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .refund-info { background-color: #dcfce7; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #16a34a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Booking Cancelled - Tutor Copy</h1>
            </div>
            <div class="content">
              <p>Sveiki, <strong>${tutorName}</strong>!</p>
              
              <p>You have successfully cancelled a booking. Here are the details:</p>
              
              <div class="booking-details">
                <h3>Cancelled Booking Details</h3>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Student:</strong> ${booking.student_name}</p>
                <p><strong>Student Email:</strong> ${booking.student_email}</p>
                <p><strong>Subject:</strong> ${booking.lesson_slug}</p>
                <p><strong>Original Amount:</strong> €${parseFloat(booking.total_price.toString()).toFixed(2)}</p>
                <p><strong>Cancellation Date:</strong> ${new Date().toLocaleString('lt-LT')}</p>
              </div>
              
              ${refundAmount > 0 ? `
                <div class="refund-info">
                  <h3>💰 Refund Information</h3>
                  <p>The student's payment has been automatically refunded:</p>
                  <p><strong>Refund Amount:</strong> €${refundAmount.toFixed(2)}</p>
                  <p>The student will receive their refund within 3-5 business days.</p>
                </div>
              ` : `
                <div class="booking-details">
                  <h3>ℹ️ Payment Information</h3>
                  <p>No refund was processed as the payment was not completed.</p>
                </div>
              `}
              
              <p><strong>The time slots have been freed up</strong> and are now available for other bookings.</p>
              <p>The student has been automatically notified of the cancellation.</p>
              
              <p>Thank you for using our platform responsibly!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const tutorEmailResult = await sendEmail({
          to: tutorEmail,
          subject: `❌ Booking Cancelled - ${booking.lesson_slug} with ${booking.student_name}`,
          html: tutorCancellationHtml,
        });

        if (!isProduction) {
          if (tutorEmailResult.success) {
            console.log('✅ Tutor cancellation email sent successfully');
          } else {
            console.error('❌ Failed to send tutor cancellation email');
          }
        }
      } catch (emailError) {
        console.error('❌ Tutor email sending error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount: refundAmount,
      refundStatus: refundAmount > 0 ? 'refunded' : 'no_refund_needed',
      paymentIntentId: booking.payment_intent_id,
      isDevelopment: allowDevRefundSimulation,
    });

  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
} 