import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
}

export async function sendEmail({ to, subject, html, replyTo, attachments }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      ...(attachments?.length ? { attachments } : {}),
    });

    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateInvoiceEmail(
  studentName: string,
  bookingId: string,
  totalPrice: number,
  lessonSlug: string,
  tutorName: string,
  slots: Array<{ start_time: string; end_time: string }>
) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mokėjimo sąskaita</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .total { font-size: 18px; font-weight: bold; color: #2563eb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .status-pending { color: #f59e0b; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mokėjimo sąskaita</h1>
        </div>
        <div class="content">
          <p>Sveiki, <strong>${studentName}</strong>!</p>
          
          <p>Ačiū, kad pasirinkote mūsų paslaugas. Čia yra jūsų mokėjimo sąskaita:</p>
          
          <div class="booking-details">
            <h3>Užsakymo informacija</h3>
            <p><strong>Užsakymo numeris:</strong> ${bookingId}</p>
            <p><strong>Dalykas:</strong> ${lessonSlug}</p>
            <p><strong>Dėstytojas:</strong> ${tutorName}</p>
            
            <h4>Pamokų laikas:</h4>
            <ul>
              ${slots.map(slot => `
                <li>${formatDate(slot.start_time)} - ${formatDate(slot.end_time)}</li>
              `).join('')}
            </ul>
            
            <p class="total">Suma: €${totalPrice.toFixed(2)}</p>
          </div>
          
          <div class="booking-details">
            <h3>Mokėjimo būsena</h3>
            <p class="status-pending">⏳ Laukiama dėstytojo patvirtinimo</p>
            <p>Dėstytojas susisieks su jumis tiesiogiai po to, kai patvirtins pamokas.</p>
          </div>
          
          <p>Jei turite klausimų, nedvejodami susisiekite su mumis.</p>
        </div>
        <div class="footer">
          <p>Ši sąskaita buvo sugeneruota automatiškai.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateCancellationEmail(
  studentName: string,
  bookingId: string,
  totalPrice: number,
  lessonSlug: string,
  refundAmount: number
) {
  const hasRefund = refundAmount > 0;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pamokos atšaukimas ir grąžinimas</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .refund-details { background-color: #dcfce7; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #16a34a; }
        .no-refund { background-color: #fff7ed; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
        .amount { font-size: 18px; font-weight: bold; color: #16a34a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pamokos atšaukimas</h1>
        </div>
        <div class="content">
          <p>Sveiki, <strong>${studentName}</strong>!</p>
          
          <p>Deja, jūsų užsakymas <strong>${bookingId}</strong> (${lessonSlug}) buvo atšauktas dėstytojo.</p>
          
          ${hasRefund ? `
            <div class="refund-details">
              <h3>💰 Grąžinimo informacija</h3>
              <p>Jūsų mokėjimas buvo automatiškai grąžintas:</p>
              <p class="amount">Grąžinta suma: €${refundAmount.toFixed(2)}</p>
              <p>Pinigai bus grąžinti į jūsų banko sąskaitą per 3-5 darbo dienas.</p>
            </div>
          ` : `
            <div class="no-refund">
              <h3>ℹ️ Mokėjimo informacija</h3>
              <p>Mokėjimas nebuvo atliktas, todėl grąžinimas netaikomas.</p>
            </div>
          `}
          
          <p><strong>Galite iš karto pasirinkti kitą dėstytoją!</strong></p>
          <p>Apsilankykite mūsų platformoje ir pasirinkite kitą tinkamą laiką ir dėstytoją.</p>
          
          <p>Atsiprašome už nepatogumus.</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 

export function generatePaymentSuccessEmail(
  studentName: string,
  bookingId: string,
  lessonSlug: string,
  tutorName: string,
  slots: Array<{ start_time: string; end_time: string }>
) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mokėjimas patvirtintas</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Mokėjimas patvirtintas</h1>
        </div>
        <div class="content">
          <p>Sveiki, <strong>${studentName}</strong>!</p>
          <p>Jūsų mokėjimas buvo sėkmingai atliktas ir užsakymas pradėtas.</p>

          <div class="booking-details">
            <h3>Užsakymo informacija</h3>
            <p><strong>Užsakymo numeris:</strong> ${bookingId}</p>
            <p><strong>Dalykas:</strong> ${lessonSlug}</p>
            <p><strong>Korepetitorius:</strong> ${tutorName}</p>

            <h4>Numatytos pamokos:</h4>
            <ul>
              ${(slots || []).map(slot => `
                <li>${formatDate(slot.start_time)} - ${formatDate(slot.end_time)}</li>
              `).join('')}
            </ul>
          </div>

          <p>Korepetitorius netrukus su jumis susisieks dėl detalių.</p>
        </div>
        <div class="footer">
          <p>Dėkojame, kad naudojatės mūsų platforma!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateTutorOrderEmail(
  tutorName: string,
  studentName: string,
  studentEmail: string,
  studentPhone: string | null,
  lessonSlug: string,
  slots: Array<{ start_time: string; end_time: string }>,
  totalPrice: number
) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Naujas apmokėtas užsakymas</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Gavote naują apmokėtą užsakymą</h1>
        </div>
        <div class="content">
          <p>Sveiki, <strong>${tutorName}</strong>!</p>
          <p>Studentas apmokėjo užsakymą. Žemiau pateikiama užsakymo informacija.</p>
          <div class="booking-details">
            <p><strong>Studentas:</strong> ${studentName}</p>
            <p><strong>El. paštas:</strong> ${studentEmail}</p>
            <p><strong>Telefonas:</strong> ${studentPhone || 'Nepateikta'}</p>
            <p><strong>Dalykas:</strong> ${lessonSlug}</p>
            <h4>Numatytos pamokos:</h4>
            <ul>
              ${(slots || []).map(slot => `
                <li>${formatDate(slot.start_time)} - ${formatDate(slot.end_time)}</li>
              `).join('')}
            </ul>
            <p><strong>Suma:</strong> €${totalPrice.toFixed(2)}</p>
          </div>
          <p>Prašome susisiekti su studentu ir patvirtinti detales.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}