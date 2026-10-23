import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
} from 'lucide-react'

import {
  flexRender,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

import { fetchJobs } from '@/api/jobs'
import { JobColumns } from '@/components/jobs/JobColumns'
import AppLayout from '@/components/layout/AppLayout'
import SummaryCard from '@/components/shared/SummaryCard'
import Pagination from '@/components/shared/Pagination'

import { Card, CardContent } from '@/components/ui/card'

const features = tableFeatures({ rowSortingFeature })

function JobsListPage() {
  const [isReviewed, setIsReviewed] = useState<boolean | null>(false)
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('published_at')

  const sorting = [
    {
      id: ordering.replace(/^-/, ''),
      desc: ordering.startsWith('-'),
    },
  ]

  const { data, isError, error, isPending } = useQuery({
    queryKey: ['jobs', { isReviewed, ordering, page }],
    queryFn: () => fetchJobs({ isReviewed, ordering, page }),
  })

  const jobs = data?.results ?? []
  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const table = useTable({
    features,
    data: jobs,
    columns: JobColumns,
    manualSorting: true,
    state: { sorting },
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater

      const next = nextSorting[0]

      if (!next) {
        setOrdering('published_at')
        setPage(1)
        return
      }

      const field = next.id

      if (!['title', 'published_at', 'score'].includes(field)) {
        return
      }

      setOrdering(next.desc ? `-${field}` : field)
      setPage(1)
    },
  })

  const totalCount = data?.summary.total ?? 0
  const pendingCount = data?.summary.pending ?? 0
  const reviewedCount = data?.summary.reviewed ?? 0

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-8 p-5 md:p-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Offers
          </h1>

          <p className="text-sm text-muted-foreground md:text-base">
            Discover and organize the opportunities that fit your preferences.
          </p>
        </section>

        {isError ? (
          <Card>
            <CardContent className="py-6">
              <p role="alert" className="text-sm text-destructive">
                Failed to load offers: {error.message}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section
              aria-label="Resumen de ofertas"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <SummaryCard
                title="Total of offers"
                value={isPending ? '—' : totalCount}
                description="Offers that have passed the filters"
                icon={<BriefcaseBusiness className="size-4" />}
              />

              <SummaryCard
                title="Pending review"
                value={isPending ? '—' : pendingCount}
                description="Offers that you haven't reviewed yet"
                icon={<Clock3 className="size-4" />}
              />

              <SummaryCard
                title="Reviewed"
                value={isPending ? '—' : reviewedCount}
                description="Offers that you have already reviewed"
                icon={<CheckCircle2 className="size-4" />}
              />
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Found offers
                </h2>

                <p className="text-sm text-muted-foreground">
                  The most recent opportunities found by your sources.
                </p>
              </div>

              <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="review-filter" className="text-sm font-medium">
                    Filter by status
                  </label>

                  <select
                    id="review-filter"
                    value={isReviewed === null ? 'all' : String(isReviewed)}
                    onChange={(event) => {
                      const value = event.target.value
                      setIsReviewed(value === 'all' ? null : value === 'true')
                      setPage(1)
                    }}
                    className="h-9 min-w-44 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">All offers</option>
                    <option value="false">Pending</option>
                    <option value="true">Reviewed</option>
                  </select>
                </div>
              </section>

              <div className="overflow-hidden rounded-xl border bg-card">
                {isPending ? (
                  <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Loading offers...
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <BriefcaseBusiness className="mx-auto mb-3 size-8 text-muted-foreground" />

                    <p className="font-medium">There are no offers yet</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      When new opportunities are found, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b bg-muted/40">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                scope="col"
                                className="whitespace-nowrap px-5 py-3.5 font-medium text-muted-foreground"
                              >
                                {header.isPlaceholder ? null : (
                                  <button
                                    type="button"
                                    onClick={header.column.getToggleSortingHandler()}
                                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                                    aria-label={`Ordenar por ${header.column.id}`}
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}

                                    {{
                                      asc: <ArrowUp className="size-3.5" />,
                                      desc: <ArrowDown className="size-3.5" />,
                                    }[header.column.getIsSorted() as string] ?? null}
                                  </button>
                                )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>

                      <tbody className="divide-y">
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="transition-colors hover:bg-muted/30"
                          >
                            {row.getAllCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-5 py-4 align-middle"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!isPending && data && data.count > 0 && (
                  <div className="flex flex-col gap-3 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      {data.count === 1
                        ? '1 offer found'
                        : `${data.count} offers found`}
                    </p>

                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </p>

                      <Pagination
                        page={page}
                        totalPages={totalPages}
                        isPending={isPending}
                        onPageChange={setPage}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default JobsListPage