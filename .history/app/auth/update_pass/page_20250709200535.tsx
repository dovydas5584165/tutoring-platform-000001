import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function UpdatePasswordPage() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      setStatus('Tokenas nepasiekiamas arba neteisingas.');
    }
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');

    if (!newPassword || newPassword.length < 6) {
      setStatus('Slaptažodis turi būti bent 6 simbolių.');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      // Pass the access_token as the session (to authenticate the update)
      // Supabase client uses current session automatically, so you need to sign in using access token before updating:
    });

    // Since the user is not signed in, you have to sign in with the access_token first:
    const { error: signInError } = await supabase.auth.setSession(accessToken);

    if (signInError) {
      setStatus('Neteisingas arba pasibaigęs tokenas.');
      return;
    }

    // Now update the password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setStatus('Nepavyko atnaujinti slaptažodžio.');
      return;
    }

    setStatus('Slaptažodis sėkmingai atnaujintas. Galite prisijungti.');
    setTimeout(() => router.push('/auth/log-in'), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f2f5' }}>
      <div style={{ maxWidth: 400, width: '100%', backgroundColor: '#fff', padding: 30, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Atnaujinkite slaptažodį</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="Naujas slaptažodis"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{ padding: 12, backgroundColor: '#0070f3', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Atnaujinti slaptažodį
          </button>
        </form>

        {status && (
          <p style={{ marginTop: 12, textAlign: 'center', color: status.includes('sėkmingai') ? 'green' : 'red' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
