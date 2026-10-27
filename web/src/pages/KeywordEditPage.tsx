import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'

import { fetchKeyword, updateKeyword, type JobKeywordInput } from '@/api/keywords'
import AppLayout from '@/components/layout/AppLayout'
import KeywordForm from '@/components/keywords/KeywordForm'
import { Card, CardContent } from '@/components/ui/card'

function KeywordEditPage() {
const { id } = useParams<{ id: string }>()
const navigate = useNavigate()
const queryClient = useQueryClient()

const {
    data: keyword,
    isPending,
    isError: isQueryError,
    error: queryError,
} = useQuery({
    queryKey: ['keywords', id],
    queryFn: () => fetchKeyword(id!),
    enabled: Boolean(id),
})
const mutation = useMutation({
    mutationFn: (values: JobKeywordInput) => updateKeyword(id!, values),
    onSuccess: async (updatedKeyword) => {
        queryClient.setQueryData(['keywords', id], updatedKeyword)
        await queryClient.invalidateQueries({ queryKey: ['keywords'] })
        navigate('/keywords')
    },
})
async function handleSubmit(values: JobKeywordInput) {
    await mutation.mutateAsync(values)
}
return (
    <AppLayout>
        <div className="mx-auto w-full max-w-3xl space-y-8 p-5 md:p-8">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Edit Keyword
                </h1>
                <p className="text-sm text-muted-foreground md:text-base">
                    Update the keyword configuration.
                </p>
            </section>
            {isPending ? (
                <p className="text-sm text-muted-foreground">
                    Loading keyword...
                </p>
            ) : isQueryError ? (
                <Card>
                    <CardContent className="py-6">
                        <p role="alert" className="text-sm text-destructive">
                            Failed to load keyword: {queryError.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/keywords')}
                            className="mt-4 text-sm underline underline-offset-4"
                        >
                            Back to Keywords
                        </button>
                    </CardContent>
                </Card>
            ) : keyword ? (
                <>
                    {mutation.isError && (
                        <Card>
                            <CardContent className="py-4">
                                <p role="alert" className="text-sm text-destructive">
                                    Failed to update keyword: {mutation.error.message}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    <KeywordForm
                        initialValues={{
                            term: keyword.term,
                            keyword_type: keyword.keyword_type,
                            weight: keyword.weight,
                            is_active: keyword.is_active,
                        }}
                        submitLabel="Save changes"
                        isSubmitting={mutation.isPending}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/keywords')}
                    />
                </>
            ) : null}
        </div>
    </AppLayout>
)

}

export default KeywordEditPage