'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div>
      <Navbar />
      <main style={{ paddingBottom: 40 }}>{children}</main>
    </div>
  );
}
