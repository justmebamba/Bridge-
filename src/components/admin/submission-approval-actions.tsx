
'use client';

import { useTransition } from 'react';
import {
  CheckCircle,
  MoreVertical,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { updateSubmissionStatusAction } from './actions';

type Step = 'tiktokUsername' | 'verificationCode' | 'phoneNumber' | 'finalCode';

export function SubmissionApprovalActions({ id, step }: { id: string; step: Step }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (status: 'approved' | 'rejected') => {
    startTransition(async () => {
      await updateSubmissionStatusAction(id, step, status);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleAction('approved')}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('rejected')}>
          <XCircle className="mr-2 h-4 w-4 text-red-500" />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
