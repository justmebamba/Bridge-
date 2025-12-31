
'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import { FormEvent, useState } from 'react';

export function SignupForm({ hasMainAdmin }: { hasMainAdmin: boolean }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const response = await fetch('/api/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create account.');
            }

            toast({
                title: 'Registration Successful',
                description: 'Please log in to continue.',
            });
            router.push('/management-portal-a7b3c9d2e1f0/login');

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Sign-up Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="admin@example.com" required disabled={isLoading}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={8} disabled={isLoading}/>
                </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Admin Account'}
            </Button>
        </form>
    );
}
