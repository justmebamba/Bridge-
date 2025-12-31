
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signupAction } from '@/app/admin/signup/actions';
import { Label } from '../ui/label';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="animate-spin" /> : 'Create Admin Account'}
        </Button>
    )
}

export function SignupForm({ hasMainAdmin }: { hasMainAdmin: boolean }) {
    const { toast } = useToast();
    const router = useRouter();
    
    // The `signupAction` needs to know if it's creating a main admin or not.
    // We bind the `hasMainAdmin` value to the action.
    const actionWithContext = signupAction.bind(null, hasMainAdmin);
    const [state, formAction] = useFormState(actionWithContext, { type: 'idle' });

    useEffect(() => {
        if (state?.type === 'error') {
            toast({
                variant: 'destructive',
                title: 'Sign-up Failed',
                description: state.message,
            });
        }
        if (state?.type === 'success') {
            toast({
                title: 'Registration Successful',
                description: 'Please log in to continue.',
            });
            router.push('/admin/login');
        }
    }, [state, toast, router]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="grid gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>
            </div>
            <SubmitButton />
        </form>
    );
}
