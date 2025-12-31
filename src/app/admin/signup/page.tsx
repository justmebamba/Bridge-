
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SignupForm } from '@/components/admin/signup-form';
import { JsonStore } from '@/lib/json-store';
import type { AdminUser } from '@/lib/types';


// This function is now co-located with the Server Component
async function hasMainAdminCheck() {
    const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);
    const admins = await store.read();
    return admins.some(admin => admin.isMainAdmin);
}


export default async function AdminSignupPage() {
  const hasMainAdmin = await hasMainAdminCheck();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-2xl mt-4 font-bold">Admin Registration</h1>
          <p className="text-muted-foreground">
            {hasMainAdmin 
              ? 'Create a new sub-administrator account.' 
              : 'Create the first main administrator account.'}
          </p>
        </div>
        
        <div className="grid gap-4 mb-6">
            {!hasMainAdmin && (
            <Alert>
                <AlertTitle>Main Admin Registration</AlertTitle>
                <AlertDescription>
                You are about to create the first administrator account. This account will have full privileges, including the ability to approve other admins.
                </AlertDescription>
            </Alert>
            )}
            {hasMainAdmin && (
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200 [&>svg]:text-blue-600">
                <AlertTitle>Sub-Admin Registration</AlertTitle>
                <AlertDescription>
                Your account will be created in a pending state. A main administrator must approve your account before you can log in.
                </AlertDescription>
            </Alert>
            )}
        </div>

        <SignupForm hasMainAdmin={hasMainAdmin} />

        <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an admin account?{' '}
            <Link href="/admin/login" className="font-semibold text-primary hover:underline">
                Log In
            </Link>
        </p>

      </div>
    </main>
  );
}
