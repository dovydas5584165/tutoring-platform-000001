'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

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

    console.log('Starting sign-in process');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    console.log('signIn result:', result);

    if (result?.error) {
      setErrorMsg(`Prisijungimo klaida: ${result.error}`);
      return;
    }

    // Wait for session to update with a few retries
    let retries = 5;
    let session = null;

    while (retries > 0) {
      await new Promise((res) => setTimeout(res, 200)); // delay 200ms
      const res = await fetch('/api/auth/session');
      session = await res.json();

      console.log('Fetched session:', session);

      if (session?.user?.id && session?.user?.role) break;

      retries--;
    }

    if (!session?.user?.id || !session?.user?.role) {
      setErrorMsg('Nepavyko nustatyti vartotojo tapatybės');
      console.error('Session missing userId or role:', session);
      return;
    }

    const { id: userId, role } = session.user;

    console.log('Ready to redirect:', { userId, role });

    if (role && userId) {
      if (role === 'tutor') {
        console.log(`Redirecting to tutor dashboard /tutor_dashboard/${userId}`);
        router.replace(`/tutor_dashboard/${userId}`);
      } else if (role === 'client') {
        console.log(`Redirecting to student dashboard /student_dashboard/${userId}`);
        router.replace(`/student_dashboard/${userId}`);
      } else {
        setErrorMsg('Nežinoma vartotojo rolė');
        console.error('Unknown role:', role);
      }
    } else {
      setErrorMsg('Nepavyko nustatyti vartotojo rolės ar ID');
      console.error('Missing role or userId', { role, userId });
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
