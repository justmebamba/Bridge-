
'use client';

import { useEffect, useState, useMemo } from 'react';
import { CheckCircle, Clock, Loader2, RefreshCw, XCircle, ShieldCheck, ShieldOff } from 'lucide-react';
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
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type AdminUser = {
  id: string;
  email: string;
  isVerified: boolean;
  isMainAdmin: boolean;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return res.json()
});

export default function AdminPage() {
    const { user, isAdmin, isMainAdmin, isLoading: isAuthLoading } = useAdminAuth();
    const router = useRouter();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthLoading) {
            if (!user || !isAdmin) {
                router.replace('/admin/login');
            }
        }
    }, [user, isAdmin, isAuthLoading, router]);

    const fetchData = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
            const [submissionsData, adminsData] = await Promise.all([
                fetcher('/api/submissions'),
                fetcher('/api/admins')
            ]);
            setSubmissions(submissionsData);
            setAdmins(adminsData);
        } catch (e: any) {
            setError(e);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user && isAdmin) {
            fetchData();
        }
    }, [user, isAdmin]);

    const mutate = () => fetchData();

    const handleApproval = async (id: string, isVerified: boolean, type: 'submission' | 'admin') => {
        setUpdatingId(id);
        const endpoint = type === 'submission' ? '/api/submissions' : '/api/admins';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isVerified }),
            });

            if (!res.ok) {
                throw new Error(`Failed to update ${type}.`);
            }
            mutate();
        } catch (error) {
            console.error(`Failed to update ${type}`, error);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (isVerified: boolean) => {
        if (isVerified) {
            return <Badge variant="default" className="bg-green-100 border-green-200 text-green-800">Approved</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    };
    
    const getAdminRoleBadge = (isMainAdmin: boolean) => {
        if (isMainAdmin) {
            return <Badge variant="default">Main Admin</Badge>;
        }
        return <Badge variant="secondary" className="border-blue-200 bg-blue-100 text-blue-800">Sub-Admin</Badge>;
    }


    if (isAuthLoading || !user || !isAdmin) {
        return (
             <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </main>
        )
    }

    const isLoading = isAuthLoading || isLoadingData;

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
                        <Tabs defaultValue="submissions">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="submissions">User Submissions</TabsTrigger>
                                <TabsTrigger value="admins">Admin Management</TabsTrigger>
                            </TabsList>
                            <TabsContent value="submissions">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : error ? (
                                    <Alert variant="destructive">
                                        <XCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>Failed to load data. Please try again.</AlertDescription>
                                    </Alert>
                                ) : (
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
                                                        <TableCell>{getStatusBadge(sub.isVerified)}</TableCell>
                                                        <TableCell className="text-right">
                                                            {!sub.isVerified && (
                                                                <Button onClick={() => handleApproval(sub.id, true, 'submission')} size="sm" disabled={updatingId === sub.id}>
                                                                    {updatingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                                    <span className="ml-2">Approve</span>
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center">No submissions found.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                             <TabsContent value="admins">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                ) : error ? (
                                     <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load admins.</AlertDescription></Alert>
                                ) : (
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Registered</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {admins && admins.length > 0 ? (
                                                admins.map((admin) => (
                                                    <TableRow key={admin.id}>
                                                        <TableCell className="font-medium">{admin.email}</TableCell>
                                                        <TableCell>{getAdminRoleBadge(admin.isMainAdmin)}</TableCell>
                                                        <TableCell>{format(new Date(admin.createdAt), "PPP")}</TableCell>
                                                        <TableCell>{getStatusBadge(admin.isVerified)}</TableCell>
                                                        <TableCell className="text-right">
                                                            {isMainAdmin && user && admin.id !== user.uid && (
                                                                <div className="flex gap-2 justify-end">
                                                                    {admin.isVerified ? (
                                                                         <Button variant="destructive" size="sm" onClick={() => handleApproval(admin.id, false, 'admin')} disabled={updatingId === admin.id}>
                                                                            {updatingId === admin.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                                                                            <span className="ml-2">Revoke</span>
                                                                        </Button>
                                                                    ) : (
                                                                        <Button size="sm" onClick={() => handleApproval(admin.id, true, 'admin')} disabled={updatingId === admin.id}>
                                                                            {updatingId === admin.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                                                            <span className="ml-2">Approve</span>
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No admins found.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
