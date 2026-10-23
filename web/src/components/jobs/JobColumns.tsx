import { Badge } from '@/components/ui/badge'
import ReviewToggle from '@/components/jobs/ReviewToggle'
import type { Job } from '@/api/jobs'

export const JobColumns = [
  {
    accessorKey: 'title',
    header: 'Offer',
    enableSorting: true,
    cell: ({ row }: { row: { original: Job } }) => (
      <a
        href={row.original.url}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground transition-colors hover:text-primary"
      >
        {row.original.title}
      </a>
    ),
  },

    {
    accessorKey: 'source_name',
    header: 'Source',
    enableSorting: false,
    cell: ({ getValue }: { getValue: () => unknown }) => (
      <span className="text-muted-foreground">{String(getValue())}</span>
    ),
  },

  {
    accessorKey: 'published_at',
    header: 'Publication Date',
    enableSorting: true,
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const value = getValue()

      if (typeof value !== 'string' || !value) {
        return <span className="text-muted-foreground">Sin fecha</span>
      }

      return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
      }).format(new Date(value))
    },
  },

  {
    accessorFn: (job: Job) => job.filter_result.score,
    id: 'score',
    header: 'Score',
    enableSorting: true,
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const score = Number(getValue())

      return (
        <Badge variant="secondary" className="font-medium tabular-nums">
          {score} points
        </Badge>
      )
    },
  },

 {
    accessorKey: 'is_reviewed',
    header: 'Status',
    enableSorting: true,
    cell: ({ row }: { row: { original: Job } }) => (
      <ReviewToggle job={row.original} />
    ),
  },
]