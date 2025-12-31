
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <LogIn className="mx-auto h-10 w-10 text-primary" />
                <h1 className="text-2xl mt-4 font-bold">Admin Access</h1>
                <p className="text-muted-foreground">Enter your admin credentials to log in.</p>
            </div>

            <LoginForm />
            
            <p className="text-sm text-center text-muted-foreground mt-6">
                Need an admin account?{' '}
                <Link href="/admin/signup" className="font-semibold text-primary hover:underline">
                    Register here
                </Link>
            </p>
        </div>
    </main>
  );
}
