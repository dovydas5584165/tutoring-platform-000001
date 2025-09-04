import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient'; // Tavo Supabase klientas

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { vardas, pavarde, pamokos, role, email, slaptazodis, vaikoVardas } = req.body;

  if (!vardas || !pavarde || !pamokos || !role || !email || !slaptazodis) {
    return res.status(400).json({ message: 'Trūksta laukų' });
  }

  try {
    const { data: userExists } = await supabase.from('users').select('id').eq('email', email).single();

    if (userExists) {
      return res.status(409).json({ message: 'Vartotojas jau egzistuoja' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          vardas,
          pavarde,
          pamokos,
          role,
          email,
          slaptazodis,
          vaikoVardas: role !== 'tutor' ? vaikoVardas : null,
        },
      ])
      .select()
      .single();

    if (error || !data?.id) {
      console.error(error);
      return res.status(500).json({ message: 'Nepavyko sukurti vartotojo' });
    }

    return res.status(200).json({ userId: data.id });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ message: 'Serverio klaida' });
  }
}
