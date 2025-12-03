import { AdminAuthProvider } from "@/components/auth/admin-auth-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </AdminAuthProvider>
  )
}
