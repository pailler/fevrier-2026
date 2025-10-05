'use client';

import { useCustomAuth } from '@/hooks/useCustomAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminLoading from '@/components/admin/AdminLoading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, loading } = useCustomAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin');
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return <AdminLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}