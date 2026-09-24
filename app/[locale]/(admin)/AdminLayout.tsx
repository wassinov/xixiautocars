import { Metadata } from 'next';
import AdminSidebar from './AdminSidebar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard - Xixi Autocars Admin',
  description: "Vue d'ensemble de l'activité du garage",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 flex">
      <AdminSidebar />
      <main className="lg:pl-72 rtl:lg:pl-0 rtl:lg:pr-72 flex-1">
        <div className="p-6 lg:p-4">
          {children}
        </div>
      </main>
    </div>
  );
}