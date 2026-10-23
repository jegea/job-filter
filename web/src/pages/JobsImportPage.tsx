import AppLayout from '@/components/layout/AppLayout'
import { JobFetch } from '@/components/jobs/JobFetch'

export default function JobsImportPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-8 p-5 md:p-8">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Load job offers
          </h1>

          <p className="text-sm text-muted-foreground md:text-base">
            Search for new opportunities in your configured sources.
          </p>

          <JobFetch />
          
        </section>
      </div>
    </AppLayout>
  )
}