import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock3 } from 'lucide-react'

import {
    updateJobReview,
    type Job,
} from '@/api/jobs'
import { Button } from '@/components/ui/button'

type ReviewToggleProps = {
    job: Job
}

export default function ReviewToggle({ job }: ReviewToggleProps) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (isReviewed: boolean) =>
        updateJobReview(job.id, isReviewed),

        onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['jobs'] }),

    })

    const isReviewed = job.is_reviewed

    return (
        <Button
        variant="outline"
        size="sm"
        className={
            isReviewed
            ? 'gap-1.5 border-gray-300! bg-gray-700! font-normal text-gray-100! hover:bg-gray-600!'
            : 'gap-1.5 border-gray-300! bg-gray-100! font-normal text-gray-700! hover:bg-gray-200!'
        }
        disabled={mutation.isPending}
        aria-label={
            isReviewed
            ? 'Mark offer as pending'
            : 'Mark offer as reviewed'
        }
        title={
            isReviewed
            ? 'Mark as pending'
            : 'Mark as reviewed'
        }
        onClick={() => mutation.mutate(!isReviewed)}
        >
        {mutation.isPending ? (
            'Saving...'
        ) : isReviewed ? (
            <>
            <CheckCircle2 className="size-3.5" />
            Reviewed
            </>
        ) : (
            <>
            <Clock3 className="size-3.5" />
            Pending
            </>
        )}
        </Button>
    )
}