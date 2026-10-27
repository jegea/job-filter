import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { createKeyword, type JobKeywordInput } from '@/api/keywords'
import AppLayout from '@/components/layout/AppLayout'
import KeywordForm from '@/components/keywords/KeywordForm'
import { Card, CardContent } from '@/components/ui/card'

function KeywordCreatePage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (values: JobKeywordInput) => createKeyword(values),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['keywords'] })
            navigate('/keywords')
        },
    })

    async function handleSubmit(values: JobKeywordInput) {
        await mutation.mutateAsync(values)
    }

    return (
        <AppLayout>
            <div className="mx-auto w-full max-w-[1600px] space-y-8 p-5 md:p-8">
                <section className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Add Keyword
                    </h1>

                    <p className="text-sm text-muted-foreground md:text-base">
                        Configure a keyword to help filter job offers.
                    </p>
                </section>

                {mutation.isError && (
                    <Card>
                        <CardContent className="py-4">
                            <p role="alert" className="text-sm text-destructive">
                                Failed to create keyword: {mutation.error.message}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <KeywordForm
                    submitLabel="Create keyword"
                    isSubmitting={mutation.isPending}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/keywords')}
                />
            </div>
        </AppLayout>
    )
}

export default KeywordCreatePage