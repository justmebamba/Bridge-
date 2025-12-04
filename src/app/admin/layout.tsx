import { AdminAuthProvider } from "@/components/auth/admin-auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
        {children}
    </AdminAuthProvider>
  )
}
