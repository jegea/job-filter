import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'

import { fetchSource, updateSource, type JobSourceInput } from '@/api/sources'
import AppLayout from '@/components/layout/AppLayout'
import SourceForm from '@/components/sources/SourceForm'
import { Card, CardContent } from '@/components/ui/card'

function SourceEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: source,
    isPending,
    isError: isQueryError,
    error: queryError,
  } = useQuery({
    queryKey: ['sources', id],
    queryFn: () => fetchSource(id!),
    enabled: Boolean(id),
  })

  const mutation = useMutation({
    mutationFn: (values: JobSourceInput) => updateSource(id!, values),
    onSuccess: async (updatedSource) => {
      queryClient.setQueryData(['sources', id], updatedSource)
      await queryClient.invalidateQueries({ queryKey: ['sources'] })
      navigate('/sources')
    },
  })

  async function handleSubmit(values: JobSourceInput) {
    await mutation.mutateAsync(values)
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-3xl space-y-8 p-5 md:p-8">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Edit RSS Source
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Update the feed configuration.
          </p>
        </section>

        {isPending ? (
          <p className="text-sm text-muted-foreground">
            Loading RSS source...
          </p>
        ) : isQueryError ? (
          <Card>
            <CardContent className="py-6">
              <p role="alert" className="text-sm text-destructive">
                Failed to load RSS source: {queryError.message}
              </p>
              <button
                type="button"
                onClick={() => navigate('/sources')}
                className="mt-4 text-sm underline underline-offset-4"
              >
                Back to RSS Sources
              </button>
            </CardContent>
          </Card>
        ) : source ? (
          <>
            {mutation.isError && (
              <Card>
                <CardContent className="py-4">
                  <p role="alert" className="text-sm text-destructive">
                    Failed to update RSS source: {mutation.error.message}
                  </p>
                </CardContent>
              </Card>
            )}

            <SourceForm
              initialValues={{
                name: source.name,
                url: source.url,
                is_active: source.is_active,
              }}
              submitLabel="Save changes"
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/sources')}
            />
          </>
        ) : null}
      </div>
    </AppLayout>
  )
}

export default SourceEditPage