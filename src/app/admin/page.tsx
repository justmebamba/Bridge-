
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Submission } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.replace('/login');
        }
    }, [user, isAuthLoading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetcher('/api/submissions');
            setSubmissions(data);
        } catch (e: any) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const mutate = () => fetchData();

    const handleApprove = async (id: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isVerified: true }),
            });

            if (!res.ok) {
                throw new Error('Failed to update submission.');
            }
            mutate();
        } catch (error) {
            console.error('Failed to approve submission', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatus = (submission: Submission) => {
        if (submission.isVerified) {
            return <Badge variant="default" className="bg-green-100 border-green-200 text-green-800">Approved</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    };

    if (isAuthLoading || !user) {
        return (
             <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verifying access...</p>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-muted/40">
            <div className="w-full max-w-6xl">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Admin Dashboard</CardTitle>
                        <Button onClick={mutate} variant="outline" size="icon" disabled={isLoading}>
                           <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                           <span className="sr-only">Refresh</span>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="ml-4 text-muted-foreground">Loading submissions...</p>
                            </div>
                        )}
                        {error && (
                             <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                  Failed to load submissions. Please try again.
                                </AlertDescription>
                            </Alert>
                        )}
                        {!isLoading && !error && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>TikTok Username</TableHead>
                                        <TableHead>Phone Number</TableHead>
                                        <TableHead>Final Code</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions && submissions.length > 0 ? (
                                        submissions.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium">@{sub.tiktokUsername}</TableCell>
                                                <TableCell>{sub.phoneNumber || 'N/A'}</TableCell>
                                                <TableCell>{sub.finalCode || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{format(new Date(sub.createdAt), "PPP")}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatus(sub)}</TableCell>
                                                <TableCell className="text-right">
                                                    {!sub.isVerified && (
                                                        <Button
                                                            onClick={() => handleApprove(sub.id)}
                                                            size="sm"
                                                            disabled={updatingId === sub.id}
                                                        >
                                                            {updatingId === sub.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                            <span className="ml-2">Approve</span>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No submissions found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
