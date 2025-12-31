'use client';

import type { AdminUser, Submission } from '@/lib/types';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';


export default function AdminPage() {
    const [data, setData] = useState<{ submissions: Submission[], admins: Omit<AdminUser, 'passwordHash'>[], currentUser: Omit<AdminUser, 'passwordHash'>, isMainAdmin: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // We can fetch submissions and admins in parallel
                const [submissionsRes, adminsRes] = await Promise.all([
                    fetch('/api/submissions'),
                    fetch('/api/admins') 
                ]);

                if (!submissionsRes.ok || !adminsRes.ok) {
                    throw new Error('Failed to fetch admin data');
                }

                const submissions = await submissionsRes.json();
                const { admins, currentUser, isMainAdmin } = await adminsRes.json();
                
                setData({ submissions, admins, currentUser, isMainAdmin });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center text-destructive">
                <p>Error: {error}</p>
            </div>
        );
    }
    
    if (!data) {
        return null;
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <AdminDashboard 
            submissions={data.submissions}
            admins={data.admins}
            currentUser={data.currentUser}
            isMainAdmin={data.isMainAdmin}
        />
    </main>
  );
}
