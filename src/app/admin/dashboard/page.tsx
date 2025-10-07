
"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="loader">Redirecting...</div>
        </div>
    );
}
