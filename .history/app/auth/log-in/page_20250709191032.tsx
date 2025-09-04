'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Step 1: sign in with Supabase
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setErrorMsg(`Prisijungimo klaida: ${signInError.message}`);
      setLoading(false);
      return;
    }

    // Step 2: get current session (should be active now)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      setErrorMsg('Nepavyko nustatyti vartotojo tapatybės');
      setLoading(false);
      return;
    }

    const userId = sessionData.session.user.id;

    // Step 3: fetch user role from 'users' table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.role) {
      setErrorMsg('Nepavyko gauti vartotojo rolės');
      setLoading(false);
      return;
    }

    setLoading(false);

    // Step 4: redirect based on role
    if (profile.role === 'tutor') {
      router.replace(`/tutor_dashboard/${userId}`);
    } else if (profile.role === 'client') {
      router.replace(`/student_dashboard/${userId}`);
    } else {
      setErrorMsg('Nežinoma vartotojo rolė');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: '#fff',
          padding: 30,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: '#000',
        }}
      >
        <p
          style={{
            fontWeight: 'bold',
            marginBottom: 20,
            fontSize: 18,
            textAlign: 'center',
          }}
        >
          PRISIJUNGIMAS:
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="El. paštas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />

          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <a href="/forgot_pass" style={{ color: '#0070f3', fontSize: 14, textDecoration: 'underline' }}>
              Užmiršau slaptažodį?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 12,
              backgroundColor: loading ? '#999' : '#0070f3',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Kraunasi...' : 'Prisijungti'}
          </button>
        </form>

        {errorMsg && (
          <p style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>
            {errorMsg}
          </p>
        )}

        <p style={{ marginTop: 15, textAlign: 'center', fontSize: 14 }}>
          Neturite paskyros?{' '}
          <a href="/auth/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            Registracija
          </a>
        </p>
      </div>
    </div>
  );
}
