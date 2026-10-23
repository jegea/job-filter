import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import {
  fetchNewJobs,
  type JobFetchResult,
  type JobFetchStatus,
  type JobFetchSummary,
} from '@/api/jobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const resultCategories: {
  status: JobFetchStatus
  title: string
  emptyMessage: string
}[] = [
  {
    status: 'saved',
    title: 'Saved offers',
    emptyMessage: 'No new offers were saved.',
  },
  {
    status: 'duplicate',
    title: 'Duplicate offers',
    emptyMessage: 'No duplicate offers found.',
  },
  {
    status: 'rejected',
    title: 'Rejected offers',
    emptyMessage: 'No offers were rejected by the filter.',
  },
  {
    status: 'invalid',
    title: 'Invalid entries',
    emptyMessage: 'No invalid entries found.',
  },
]

function JobResultsTable({ jobs }: { jobs: JobFetchResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Offer</th>
            <th className="px-3 py-2 font-medium">Source</th>
            <th className="px-3 py-2 text-right font-medium">Score</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job, index) => (
            <tr
              key={`${job.url}-${index}`}
              className="border-b last:border-0"
            >
              <td className="px-3 py-3">
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    {job.title || 'Untitled offer'}
                    <ExternalLink
                      aria-hidden="true"
                      className="size-3 shrink-0"
                    />
                  </a>
                ) : (
                  <span>{job.title || 'Untitled offer'}</span>
                )}
              </td>

              <td className="px-3 py-3 text-muted-foreground">
                {job.source}
              </td>

              <td className="px-3 py-3 text-right tabular-nums">
                {job.score ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResultCategory({
  status,
  title,
  emptyMessage,
  jobs,
  defaultOpen = false,
}: {
  status: JobFetchStatus
  title: string
  emptyMessage: string
  jobs: JobFetchResult[]
  defaultOpen?: boolean
}) {
  const categoryJobs = jobs.filter((job) => job.status === status)

  return (
    <details
      className="rounded-md border"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-inside px-4 py-3 font-medium">
        {title}
        <span className="ml-2 text-muted-foreground">
          ({categoryJobs.length})
        </span>
      </summary>

      <div className="border-t">
        {categoryJobs.length > 0 ? (
          <JobResultsTable jobs={categoryJobs} />
        ) : (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        )}
      </div>
    </details>
  )
}

function FetchSummary({ summary }: { summary: JobFetchSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-md border p-3">
        <p className="text-2xl font-semibold">{summary.saved_jobs}</p>
        <p className="text-sm text-muted-foreground">Saved</p>
      </div>

      <div className="rounded-md border p-3">
        <p className="text-2xl font-semibold">{summary.duplicates}</p>
        <p className="text-sm text-muted-foreground">Duplicates</p>
      </div>

      <div className="rounded-md border p-3">
        <p className="text-2xl font-semibold">
          {summary.rejected_entries}
        </p>
        <p className="text-sm text-muted-foreground">Rejected</p>
      </div>

      <div className="rounded-md border p-3">
        <p className="text-2xl font-semibold">
          {summary.results.filter((job) => job.status === 'invalid').length}
        </p>
        <p className="text-sm text-muted-foreground">Invalid</p>
      </div>
    </div>
  )
}

export function JobFetch() {
  const queryClient = useQueryClient()
  const [summary, setSummary] = useState<JobFetchSummary | null>(null)

  const mutation = useMutation({
    mutationFn: fetchNewJobs,

    onSuccess: async (result) => {
      setSummary(result)
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },

    onError: () => {
      setSummary(null)
    },
  })

  function handleFetch() {
    setSummary(null)
    mutation.mutate()
  }

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold">Searching new offers</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Check your sources and add the offers that pass the filters.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleFetch}
          disabled={mutation.isPending}
          className="shrink-0"
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-4 ${mutation.isPending ? 'animate-spin' : ''}`}
          />
          {mutation.isPending ? 'Searching for offers…' : 'Search offers'}
        </Button>

        {mutation.isPending && (
          <p role="status" className="text-sm text-muted-foreground">
            Fetching and processing job offers…
          </p>
        )}

        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'The offers could not be imported.'}
          </p>
        )}

        {summary && (
          <div className="flex w-full flex-col gap-4">
            <div>
              <h4 className="font-semibold">
                {summary.sources_processed === 0
                  ? 'No active sources'
                  : 'Import completed'}
              </h4>

              <p className="mt-1 text-sm text-muted-foreground">
                {summary.message ??
                  `${summary.entries_found} entries found across ${summary.sources_processed} sources.`}
              </p>
            </div>

            <FetchSummary summary={summary} />

            {summary.source_errors.length > 0 && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 p-3"
              >
                <h4 className="font-medium text-destructive">
                  Source errors ({summary.source_errors.length})
                </h4>

                <ul className="mt-2 space-y-2 text-sm">
                  {summary.source_errors.map((error, index) => (
                    <li key={`${error.source}-${index}`}>
                      <span className="font-medium">{error.source}:</span>{' '}
                      {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.errors > 0 && (
              <p className="text-sm text-destructive">
                {summary.errors} processing error(s) occurred. Check the
                application logs for details.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {resultCategories.map((category) => (
                <ResultCategory
                  key={category.status}
                  {...category}
                  jobs={summary.results}
                  defaultOpen={category.status === 'saved'}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}