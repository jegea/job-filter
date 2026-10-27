import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { createSource, type JobSourceInput } from '@/api/sources'
import AppLayout from '@/components/layout/AppLayout'
import SourceForm from '@/components/sources/SourceForm'
import { Card, CardContent } from '@/components/ui/card'

function SourceCreatePage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (values: JobSourceInput) => createSource(values),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['sources'] })
                navigate('/sources')
            },
        })

        async function handleSubmit(values: JobSourceInput) {
            await mutation.mutateAsync(values)
        }

        return (
            <AppLayout>
                <div className="mx-auto w-full max-w-[1600px] space-y-8 p-5 md:p-8">
                    <section className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Add RSS Source
                        </h1>
                        <p className="text-sm text-muted-foreground md:text-base">
                            Configure a feed to discover new job opportunities.
                        </p>
                    </section>
                    {mutation.isError && (
                        <Card>
                            <CardContent className="py-4">
                            <p role="alert" className="text-sm text-destructive">
                                Failed to create RSS source: {mutation.error.message}
                            </p>
                            </CardContent>
                        </Card>
                    )}
                    <SourceForm
                        submitLabel="Create source"
                        isSubmitting={mutation.isPending}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/sources')}
                    />
                </div>
            </AppLayout>
        )
}

export default SourceCreatePage