import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { sendEmail, generateInvoiceEmail } from '../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get booking details for email
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        users:tutor_id (vardas, pavarde)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only send email if payment is completed
    if (booking.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed yet' }, { status: 400 });
    }

    // Get slot details
    const { data: slots, error: slotsError } = await supabase
      .from('availability')
      .select('start_time, end_time')
      .in('id', booking.slot_ids);

    if (slotsError) {
      console.error('Error fetching slots:', slotsError);
      return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
    }

    // Send invoice email
    const tutorName = booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'Unknown';
    const invoiceHtml = generateInvoiceEmail(
      booking.student_name,
      booking.id,
      parseFloat(booking.total_price.toString()),
      booking.lesson_slug,
      tutorName,
      slots || []
    );

    const emailResult = await sendEmail({
      to: booking.student_email,
      subject: `Mokėjimo sąskaita - ${booking.lesson_slug}`,
      html: invoiceHtml,
    });

    if (emailResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Invoice email sent successfully',
        messageId: emailResult.messageId 
      });
    } else {
      console.error('Failed to send email:', emailResult.error);
      return NextResponse.json({ 
        error: 'Failed to send email', 
        details: emailResult.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 