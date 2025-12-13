'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function StudentDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectToUserDashboard = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          // User is not logged in, redirect to login
          router.push('/auth/log-in');
          return;
        }

        // Check if user is a client/student
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          console.error('Error fetching user data:', userError);
          router.push('/auth/log-in');
          return;
        }

        if (userData.role === 'client') {
          // Redirect to student dashboard with user ID
          router.push(`/student_dashboard/${user.id}`);
        } else if (userData.role === 'tutor') {
          // Redirect to tutor dashboard instead
          router.push(`/tutor_dashboard/${user.id}`);
        } else {
          // Unknown role, redirect to home
          router.push('/');
        }
      } catch (error) {
        console.error('Error in redirect:', error);
        router.push('/auth/log-in');
      }
    };

    redirectToUserDashboard();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
} 