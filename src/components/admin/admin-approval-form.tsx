
'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { approveAdminAction } from './actions';

function FormButton({ isVerified }: { isVerified: boolean }) {
  const { pending } = useFormStatus();

  if (isVerified) {
    return (
      <Button variant="destructive" size="sm" type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <ShieldOff className="h-4 w-4" />}
        <span className="ml-2 hidden sm:inline">Revoke</span>
      </Button>
    );
  }

  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
      <span className="ml-2 hidden sm:inline">Approve</span>
    </Button>
  );
}

export function AdminApprovalForm({ adminId, isVerified }: { adminId: string; isVerified: boolean }) {
  const action = approveAdminAction.bind(null, adminId, !isVerified);

  return (
    <form action={action}>
      <FormButton isVerified={isVerified} />
    </form>
  );
}
