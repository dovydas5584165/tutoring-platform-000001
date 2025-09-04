import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { sendEmail, generateInvoiceEmail } from '../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Rezervacijos ID būtinas' }, { status: 400 });
    }

    // Gauti rezervacijos duomenis el. laiškui
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        users:tutor_id (vardas, pavarde)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Rezervacija nerasta' }, { status: 404 });
    }

    // Siųsti tik jei mokėjimas atliktas
    if (booking.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Mokėjimas dar neįvykdytas' }, { status: 400 });
    }

    // Gauti pamokų laikus
    const { data: slots, error: slotsError } = await supabase
      .from('availability')
      .select('start_time, end_time')
      .in('id', booking.slot_ids);

    if (slotsError) {
      console.error('Klaida gaunant laikus:', slotsError);
      return NextResponse.json({ error: 'Nepavyko gauti rezervacijos detalių' }, { status: 500 });
    }

    // Siųsti sąskaitą studentui
    const tutorName = booking.users ? `${booking.users.vardas} ${booking.users.pavarde}` : 'Nežinomas';
    const invoiceHtml = generateInvoiceEmail(
      booking.student_name,
      booking.id,
      parseFloat(booking.total_price.toString()),
      booking.lesson_slug,
      tutorName,
      slots || []
    );

    const emailResult = await sendEmail({
      to: booking.student_email, // siųsti klientui
      subject: `Sąskaita faktūra - ${booking.lesson_slug}`,
      html: invoiceHtml,
    });

    if (emailResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sąskaita sėkmingai išsiųsta',
        messageId: emailResult.messageId 
      });
    } else {
      console.error('Nepavyko išsiųsti el. laiško:', emailResult.error);
      return NextResponse.json({ 
        error: 'Nepavyko išsiųsti sąskaitos', 
        details: emailResult.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Klaida siunčiant sąskaitą:', error);
    return NextResponse.json(
      { error: 'Vidinė serverio klaida' },
      { status: 500 }
    );
  }
}

// --------- generateInvoiceEmail funkcija ---------
export function generateInvoiceEmail(
  studentName: string,
  bookingId: string | number,
  totalPrice: number,
  lessonSlug: string,
  tutorName: string,
  slots: any[]
) {
  const slotList = slots.map(
    (s) => `<li>${new Date(s.start_time).toLocaleString()} - ${new Date(s.end_time).toLocaleString()}</li>`
  ).join('');

  const invoiceDate = new Date().toLocaleDateString('lt-LT');
  const invoiceNumber = `INV-${bookingId}-${Date.now()}`;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Sąskaita faktūra</h2>
      <p><strong>Sąskaitos numeris:</strong> ${invoiceNumber}</p>
      <p><strong>Data:</strong> ${invoiceDate}</p>
      <hr/>
      <h3>Išrašytojas</h3>
      <p>Dovydas Žilinskas</p>
      <p>Individualios veiklos nr.: 1279916</p>
      <p>Adresas: [jūsų adresas]</p>
      <p>El. paštas: info.tiksliukai@gmail.com</p>
      <hr/>
      <h3>Gavėjas</h3>
      <p>${studentName}</p>
      <p>El. paštas: ${studentName}@example.com</p>
      <hr/>
      <h3>Paslauga</h3>
      <p>Pamoka: ${lessonSlug}</p>
      <ul>${slotList}</ul>
      <p><strong>Bendra suma:</strong> €${totalPrice.toFixed(2)}</p>
      <hr/>
      <p>Ačiū už Jūsų mokėjimą!</p>
    </div>
  `;
}
