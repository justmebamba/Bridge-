
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


type Step = 'tiktokUsername' | 'verificationCode' | 'phoneNumber' | 'finalCode';

export function SubmissionApprovalActions({ id, step }: { id: string; step: Step }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleAction = (status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const result = await updateSubmissionStatusAction(id, step, status);
      if (result.success) {
        toast({ title: "Success", description: `Submission step has been ${status}.` });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
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
