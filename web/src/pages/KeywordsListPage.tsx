import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import {
    Activity,
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    CircleOff,
    KeyRound,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import {
    deleteKeyword,
    fetchKeywords,
} from '@/api/keywords'
import Pagination from '@/components/shared/Pagination'
import SummaryCard from '@/components/shared/SummaryCard'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'


function KeywordsListPage() {
    const [page, setPage] = useState(1)
    const pageSize = 20
    const [typeFilter, setTypeFilter] = useState<'all' | 'positive' | 'negative'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [ordering, setOrdering] = useState<{
        field: 'term' | 'keyword_type' | 'weight' | 'is_active'
        direction: 'asc' | 'desc'
    }>({
        field: 'term',
        direction: 'asc',
    })
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['keywords'],
        queryFn: fetchKeywords,
    })

    const keywords = data ?? []

    const totalCount = keywords.length
    const activeCount = keywords.filter((keyword) => keyword.is_active).length
    const inactiveCount = totalCount - activeCount

    const filteredKeywords = keywords.filter((keyword) => {
        const matchesType =
        typeFilter === 'all' || keyword.keyword_type === typeFilter

        const matchesStatus =
            statusFilter === 'all' ||
            keyword.is_active === (statusFilter === 'active')

        return matchesType && matchesStatus
    })

    const sortedKeywords = [...filteredKeywords].sort((a, b) => {
        let comparison = 0

        switch (ordering.field) {
            case 'term':
                comparison = a.term.localeCompare(b.term)
                break

            case 'keyword_type':
                comparison = a.keyword_type.localeCompare(b.keyword_type)
                break

            case 'weight':
                comparison = a.weight - b.weight
                break

            case 'is_active':
                comparison = Number(a.is_active) - Number(b.is_active)
                break
        }

        return ordering.direction === 'asc' ? comparison : -comparison
    })

    const totalPages = Math.max(1, Math.ceil(sortedKeywords.length / pageSize))
    const currentPage = Math.min(page, totalPages)

    const paginatedKeywords = sortedKeywords.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    )

    const deleteMutation = useMutation({
        mutationFn: deleteKeyword,
        onSuccess: async () => {
            const result = await queryClient.fetchQuery({
                queryKey: ['keywords'],
                queryFn: fetchKeywords,
            })

            const updatedTotalPages = Math.max(
                1,
                Math.ceil(result.length / pageSize),
            )

            setPage((currentPage) =>
                Math.min(currentPage, updatedTotalPages),
            )
        },
    })

    function handleDelete(id: string, term: string) {
        const confirmed = window.confirm(
        `Are you sure you want to delete the keyword "${term}"?`,
        )

        if (confirmed) {
        deleteMutation.mutate(id)
        }
    }

    function handleSort(
        field: 'term' | 'keyword_type' | 'weight' | 'is_active',
    ) {
        setOrdering((current) => ({
            field,
            direction:
                current.field === field && current.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        }))

        setPage(1)
    }

    return (
        <AppLayout>
            <div className="mx-auto w-full max-w-[1600px] space-y-8 p-5 md:p-8">
                <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                Keywords
                            </h1>
                            <p className="text-sm text-muted-foreground md:text-base">
                                Manage the keywords used to filter job offers.
                            </p>
                        </div>

                        <Button onClick={() => navigate('/keywords/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Keyword
                        </Button>
                </section>            

                <section
                    aria-label="Keyword summary"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <SummaryCard
                        title="Total keywords"
                        value={isLoading ? '—' : totalCount}
                        description="All configured keywords"
                        icon={<KeyRound className="size-4" />}
                    />

                    <SummaryCard
                        title="Active keywords"
                        value={isLoading ? '—' : activeCount}
                        description="Keywords currently enabled"
                        icon={<CheckCircle2 className="size-4" />}
                    />

                    <SummaryCard
                        title="Inactive keywords"
                        value={isLoading ? '—' : inactiveCount}
                        description="Keywords currently disabled"
                        icon={<CircleOff className="size-4" />}
                    />
                </section>


                {isLoading && (
                    <Card>
                        <CardContent className="py-6 text-center text-muted-foreground">
                        Loading keywords...
                        </CardContent>
                    </Card>
                )}

                {isError && (
                    <Card>
                        <CardContent className="py-6 text-center text-destructive">
                        {error instanceof Error
                            ? error.message
                            : 'An error occurred while loading keywords.'}
                        </CardContent>
                    </Card>
                )}

                {deleteMutation.isError && (
                    <Card>
                        <CardContent className="py-4 text-destructive">
                        {deleteMutation.error instanceof Error
                            ? deleteMutation.error.message
                            : 'An error occurred while deleting the keyword.'}
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !isError && keywords.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No keywords found. Add your first keyword to get started.
                        </CardContent>
                    </Card>
                )}

                {!isLoading &&
                    !isError &&
                    keywords.length > 0 &&
                    filteredKeywords.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="font-medium">No matching keywords</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try changing the selected filters to see more keywords.
                                </p>
                            </CardContent>
                        </Card>
                    )
                }

                {!isLoading && !isError && keywords && keywords.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-semibold tracking-tight">
                                Configured keywords
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {keywords.length}{' '}
                                {keywords.length === 1 ? 'keyword' : 'keywords'} configured
                            </p>
                        </div>

                        <div className="flex flex-wrap items-end gap-4">
                            <div className="w-full sm:w-48">
                                <label className="mb-2 block text-sm font-medium" htmlFor="type-filter">
                                    Type
                                </label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={(value) => {
                                        setTypeFilter(value as typeof typeFilter)
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger id="type-filter" className="w-full">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="positive">Positive</SelectItem>
                                        <SelectItem value="negative">Negative</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-48">
                                <label className="mb-2 block text-sm font-medium" htmlFor="status-filter">
                                    Status
                                </label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => {
                                        setStatusFilter(value as typeof statusFilter)
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger id="status-filter" className="w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40">
                                        <tr>
                                            {(
                                                [
                                                    { field: 'term', label: 'Term' },
                                                    { field: 'keyword_type', label: 'Type' },
                                                    { field: 'weight', label: 'Weight' },
                                                    { field: 'is_active', label: 'Status' },
                                                ] as const
                                            ).map(({ field, label }) => (
                                                <th
                                                    key={field}
                                                    scope="col"
                                                    className="whitespace-nowrap px-5 py-3.5 font-medium text-muted-foreground"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSort(field)}
                                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                                                        aria-label={`Sort by ${label}`}
                                                        aria-sort={
                                                            ordering.field === field
                                                                ? ordering.direction === 'asc'
                                                                    ? 'ascending'
                                                                    : 'descending'
                                                                : 'none'
                                                        }
                                                    >
                                                        {label}

                                                        {ordering.field === field &&
                                                            (ordering.direction === 'asc' ? (
                                                                <ArrowUp className="size-3.5" />
                                                            ) : (
                                                                <ArrowDown className="size-3.5" />
                                                            ))}
                                                    </button>
                                                </th>
                                            ))}

                                            <th
                                                scope="col"
                                                className="px-5 py-3.5 text-right font-medium text-muted-foreground"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {paginatedKeywords.map((keyword) => (
                                        <tr
                                            key={keyword.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4 align-middle font-medium">
                                            {keyword.term}
                                            </td>

                                            <td className="px-5 py-4 align-middle">
                                                <Badge
                                                    className={
                                                        keyword.keyword_type === 'positive'
                                                            ? 'border-transparent bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400'
                                                            : 'border-transparent bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400'
                                                    }
                                                >
                                                    {keyword.keyword_type === 'positive' ? 'Positive' : 'Negative'}
                                                </Badge>
                                            </td>

                                            <td className="px-5 py-4 align-middle">
                                            {keyword.weight}
                                            </td>

                                            <td className="px-5 py-4 align-middle">
                                            <span
                                                className={
                                                keyword.is_active
                                                    ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                                                    : 'inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'
                                                }
                                            >
                                                <Activity className="size-3.5" />
                                                {keyword.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            </td>

                                            <td className="px-5 py-4 text-right align-middle">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(`/keywords/${keyword.id}/edit`)
                                                }
                                                >
                                                <Pencil className="mr-2 size-4" />
                                                Edit
                                                </Button>

                                                <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={deleteMutation.isPending}
                                                onClick={() =>
                                                    handleDelete(keyword.id, keyword.term)
                                                }
                                                >
                                                <Trash2 className="mr-2 size-4" />
                                                Delete
                                                </Button>
                                            </div>
                                            </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing{' '}
                                {keywords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                                {'–'}
                                {Math.min(currentPage * pageSize, keywords.length)}
                                {' of '}
                                {keywords.length} keywords
                            </p>

                            <Pagination
                                page={currentPage}
                                totalPages={totalPages}
                                isPending={isLoading}
                                onPageChange={setPage}
                            />
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    )
}

export default KeywordsListPage