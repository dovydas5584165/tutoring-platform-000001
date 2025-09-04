import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { sendEmail } from '../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, confirmedBy } = await request.json();

    console.log('✅ Confirm booking request:', { bookingId, confirmedBy });

    if (!bookingId || !confirmedBy) {
      return NextResponse.json(
        { error: 'Booking ID and confirmed_by are required' },
        { status: 400 }
      );
    }

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
      confirmed_by_tutor: booking.confirmed_by_tutor,
    });

    // Check if booking is already confirmed
    if (booking.confirmed_by_tutor) {
      return NextResponse.json({ error: 'Booking is already confirmed' }, { status: 400 });
    }

    // Update booking to confirmed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ confirmed_by_tutor: true })
      .eq('id', bookingId);

    if (updateError) {
      console.error('❌ Error updating booking:', updateError);
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    console.log('✅ Booking confirmed');

    // Get slot details for email
    const { data: slots, error: slotsError } = await supabase
      .from('availability')
      .select('start_time, end_time')
      .in('id', booking.slot_ids);

    if (slotsError) {
      console.error('⚠️ Error fetching slots:', slotsError);
    }

    // Send confirmation email to student
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log('📧 Sending confirmation email to student');
    }
    
    const tutorName = booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'Your tutor';
    const tutorEmail = booking.users?.email || 'Not provided';

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmed!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .contact-info { background-color: #dcfce7; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #16a34a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Sveiki, <strong>${booking.student_name}</strong>!</p>
            
            <p>Great news! Your tutor has confirmed your booking request.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Subject:</strong> ${booking.lesson_slug}</p>
              <p><strong>Tutor:</strong> ${tutorName}</p>
              
              <h4>Scheduled Sessions:</h4>
              <ul>
                ${(slots || []).map(slot => `
                  <li>${formatDate(slot.start_time)} - ${formatDate(slot.end_time)}</li>
                `).join('')}
              </ul>
              
              <p><strong>Total Amount:</strong> €${parseFloat(booking.total_price.toString()).toFixed(2)}</p>
            </div>
            
            <div class="contact-info">
              <h3>📞 Next Steps</h3>
              <p><strong>Your tutor will contact you directly!</strong></p>
              <p><strong>Tutor:</strong> ${tutorName}</p>
              <p><strong>Email:</strong> ${tutorEmail}</p>
              <p>Please wait for your tutor to reach out to coordinate the lesson details, location, and any materials needed.</p>
            </div>
            
            <p>Thank you for choosing our platform!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const emailResult = await sendEmail({
        to: booking.student_email,
        subject: `✅ Booking Confirmed - ${booking.lesson_slug}`,
        html: confirmationHtml,
      });

      if (emailResult.success) {
        console.log('✅ Confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
    }

    console.log('✅ Booking confirmation completed successfully');

    // Stop sending confirmation email to tutor to avoid duplicates/irrelevant emails

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
    });

  } catch (error) {
    console.error('❌ Error confirming booking:', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
} 