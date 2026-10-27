import { useQuery } from '@tanstack/react-query'
import { Activity, Pencil, Plus, Rss } from 'lucide-react'
import { useNavigate } from 'react-router'

import { fetchSources } from '@/api/sources'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function SourcesListPage() {
    const navigate = useNavigate()

    const { data, isError, error, isPending } = useQuery({
        queryKey: ['sources'],
        queryFn: fetchSources,
    })

    const sources = data ?? []

    return (
        <AppLayout>
        <div className="mx-auto w-full max-w-[1600px] space-y-8 p-5 md:p-8">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    RSS Sources
                    </h1>

                    <p className="text-sm text-muted-foreground md:text-base">
                    Manage the feeds used to discover new job opportunities.
                    </p>
                </div>

                <Button onClick={() => navigate('/sources/new')}>
                    <Plus className="mr-2 size-4" />
                    Add RSS Source
                </Button>
            </section>

            {isError ? (
            <Card>
                <CardContent className="py-6">
                <p role="alert" className="text-sm text-destructive">
                    Failed to load RSS sources: {error.message}
                </p>
                </CardContent>
            </Card>
            ) : (
            <section className="space-y-4">
                <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight">
                    Configured sources
                </h2>

                <p className="text-sm text-muted-foreground">
                    {isPending
                    ? 'Loading RSS sources...'
                    : `${sources.length} ${sources.length === 1 ? 'source' : 'sources'} configured`}
                </p>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card">
                {isPending ? (
                    <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Loading RSS sources...
                    </div>
                ) : sources.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                    <Rss className="mx-auto mb-3 size-8 text-muted-foreground" />

                    <p className="font-medium">No RSS sources configured</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        RSS feeds will appear here once you add your first source.
                    </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th
                                scope="col"
                                className="px-5 py-3.5 font-medium text-muted-foreground"
                                >
                                    Name
                                </th>
                                <th
                                scope="col"
                                className="px-5 py-3.5 font-medium text-muted-foreground"
                                >
                                    Feed URL
                                </th>
                                <th
                                scope="col"
                                className="px-5 py-3.5 font-medium text-muted-foreground"
                                >
                                    Status
                                </th>
                                <th
                                scope="col"
                                className="px-5 py-3.5 text-right font-medium text-muted-foreground"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                        {sources.map((source) => (
                            <tr
                            key={source.id}
                            className="transition-colors hover:bg-muted/30"
                            >
                                <td className="px-5 py-4 align-middle font-medium">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/sources/${source.id}/edit`)}
                                        className="text-left text-primary underline-offset-4 hover:underline"
                                        aria-label={`Edit ${source.name}`}
                                    >
                                        {source.name}
                                    </button>
                                </td>

                                <td className="max-w-[400px] px-5 py-4 align-middle">
                                    <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all text-primary underline-offset-4 hover:underline"
                                    >
                                    {source.url}
                                    </a>
                                </td>

                                <td className="px-5 py-4 align-middle">
                                    <span
                                    className={
                                        source.is_active
                                        ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                                        : 'inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'
                                    }
                                    >
                                    <Activity className="size-3.5" />
                                    {source.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right align-middle">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/sources/${source.id}/edit`)}
                                        aria-label={`Edit ${source.name}`}
                                    >
                                        <Pencil className="mr-2 size-4" />
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
                </div>
            </section>
            )}
        </div>
        </AppLayout>
    )
}

export default SourcesListPage