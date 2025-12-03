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
import { collection, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function AdminPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const usersQuery = useMemoFirebase(() => query(collection(firestore, 'tiktok_users')), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const phoneNumbersQuery = useMemoFirebase(() => query(collection(firestore, 'phone_numbers')), [firestore]);
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useCollection(phoneNumbersQuery);

  const getPhoneNumber = (phoneNumberId: string) => {
    return phoneNumbers?.find(p => p.id === phoneNumberId)?.phoneNumber || 'N/A';
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const isLoading = usersLoading || phoneNumbersLoading;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Control Panel</CardTitle>
            <CardDescription>
              List of TikTok usernames linked for monetization.
            </CardDescription>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
          <Table>
            <TableCaption>A list of recently linked accounts.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>TikTok Username</TableHead>
                <TableHead>Linked US Number</TableHead>
                <TableHead>Verification Code</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">@{user.tiktokUsername}</TableCell>
                  <TableCell>{getPhoneNumber(user.phoneNumberId)}</TableCell>
                  <TableCell>{user.verificationCode}</TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                      {user.isVerified ? 'Active' : 'Pending'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
