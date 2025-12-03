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

const users = [
  {
    username: "charlidamelio",
    linkedNumber: "+1 (555) 123-4567",
    status: "Active",
    dateJoined: "2024-05-10",
  },
  {
    username: "khaby.lame",
    linkedNumber: "+1 (555) 987-6543",
    status: "Active",
    dateJoined: "2024-05-09",
  },
  {
    username: "bellapoarch",
    linkedNumber: "+1 (555) 246-8135",
    status: "Pending",
    dateJoined: "2024-05-11",
  },
  {
    username: "zachking",
    linkedNumber: "+1 (555) 369-2581",
    status: "Active",
    dateJoined: "2024-05-08",
  },
    {
    username: "therock",
    linkedNumber: "+1 (555) 888-9999",
    status: "Error",
    dateJoined: "2024-05-07",
  },
];


export default function AdminPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Control Panel</CardTitle>
          <CardDescription>
            List of TikTok usernames linked for monetization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of recently linked accounts.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>TikTok Username</TableHead>
                <TableHead>Linked US Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell className="font-medium">@{user.username}</TableCell>
                  <TableCell>{user.linkedNumber}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.status === 'Active' ? 'default'
                      : user.status === 'Pending' ? 'secondary'
                      : 'destructive'
                    }>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{user.dateJoined}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
