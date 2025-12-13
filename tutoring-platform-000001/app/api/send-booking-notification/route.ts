import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { sendEmail } from '../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, type } = await request.json();

    if (!bookingId || !type || !['student', 'tutor'].includes(type)) {
      return NextResponse.json(
        { error: 'Booking ID and type (student/tutor) are required' },
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

    // Get slot details
    const { data: slots, error: slotsError } = await supabase
      .from('availability')
      .select('start_time, end_time')
      .in('id', booking.slot_ids);

    if (slotsError) {
      console.error('⚠️ Error fetching slots:', slotsError);
    }

    const tutorName = booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'Unknown';
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    if (type === 'student') {
      const studentEmail = String(booking.student_email || '').trim();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail);
      if (!isValidEmail) {
        console.warn('Skipping student notification - invalid email:', booking.student_email);
        return NextResponse.json({ success: false, error: 'Invalid student email' }, { status: 400 });
      }
      // Send notification to student about new booking
      const studentHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Created - Payment Required</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .warning { background-color: #fef3c7; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Booking Created!</h1>
            </div>
            <div class="content">
              <p>Sveiki, <strong>${booking.student_name}</strong>!</p>
              
              <p>Your lesson booking has been created successfully. Please complete the payment to confirm your booking.</p>
              
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
              
              <div class="warning">
                <h3>⚠️ Payment Required</h3>
                <p><strong>Please complete your payment to confirm this booking.</strong></p>
                <p>After payment, the tutor will be notified and will contact you directly to arrange the lesson details.</p>
              </div>
              
              <p>Thank you for choosing our platform!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: studentEmail,
        subject: `📚 Booking Created - ${booking.lesson_slug} (Payment Required)`,
        html: studentHtml,
      });

      console.log('✅ Student booking notification sent');
    }

    if (type === 'tutor' && booking.users?.email) {
      // Send notification to tutor about new booking request
      const tutorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .info { background-color: #dbeafe; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Booking Request</h1>
            </div>
            <div class="content">
              <p>Sveiki, <strong>${tutorName}</strong>!</p>
              
              <p>You have received a new booking request from a student.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Student:</strong> ${booking.student_name}</p>
                <p><strong>Student Email:</strong> ${booking.student_email}</p>
                <p><strong>Student Phone:</strong> ${booking.student_phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${booking.lesson_slug}</p>
                ${booking.topic ? `<p><strong>Topic:</strong> ${booking.topic}</p>` : ''}
                
                <h4>Requested Sessions:</h4>
                <ul>
                  ${(slots || []).map(slot => `
                    <li>${formatDate(slot.start_time)} - ${formatDate(slot.end_time)}</li>
                  `).join('')}
                </ul>
                
                <p><strong>Total Amount:</strong> €${parseFloat(booking.total_price.toString()).toFixed(2)}</p>
              </div>
              
              <div class="info">
                <h3>📋 Next Steps</h3>
                <p><strong>The student is completing payment.</strong></p>
                <p>Once payment is confirmed, you will receive a notification in your dashboard to accept or decline this booking.</p>
                <p>If you accept, you'll be able to contact the student directly to arrange lesson details.</p>
              </div>
              
              <p>Please check your tutor dashboard for updates!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: booking.users.email,
        subject: `🔔 New Booking Request - ${booking.lesson_slug} from ${booking.student_name}`,
        html: tutorHtml,
      });

      console.log('✅ Tutor booking notification sent');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error sending booking notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
} 