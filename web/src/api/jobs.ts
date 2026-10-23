export type Job = {
  id: string
  title: string
  url: string
  source_name: string
  published_at: string | null
  is_reviewed: boolean
  filter_result: {
    score: number
    matches: {
      term: string
      type: string
      weight: number
      score: number
      fields: string[]
    }[]
  }
}

export type JobSummary = {
  total: number
  pending: number
  reviewed: number
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
  summary: JobSummary
}

export type JobFilters = {
  isReviewed?: boolean | null
  ordering?: string
  page?: number
}

export async function fetchJobs(
  filters: JobFilters = {},
): Promise<PaginatedResponse<Job>> {
  const params = new URLSearchParams()

  if (filters.isReviewed !== null && filters.isReviewed !== undefined) {
    params.set('is_reviewed', String(filters.isReviewed))
  }

  if (filters.ordering) params.set('ordering', filters.ordering)
  if (filters.page) params.set('page', String(filters.page))

  const query = params.toString()
  const url = query ? `/api/jobs/?${query}` : '/api/jobs/'

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error getting job offers: ${response.status}`)
  }

  return response.json() as Promise<PaginatedResponse<Job>>
}

function getCsrfToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('csrftoken='))
    ?.split('=')[1]
}

export async function updateJobReview(
  id: string,
  isReviewed: boolean,
): Promise<Job> {
  const response = await fetch(`/api/jobs/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() ?? '',
    },
    body: JSON.stringify({
      is_reviewed: isReviewed,
    }),
  })

  if (!response.ok) {
    throw new Error(`Error updating job offer: ${response.status}`)
  }

  return response.json() as Promise<Job>
}

export type JobFetchStatus =
  | 'saved'
  | 'duplicate'
  | 'rejected'
  | 'invalid'

export type JobFetchResult = {
  title: string
  url: string
  source: string
  score: number | null
  status: JobFetchStatus
}

export type JobFetchSummary = {
  sources_processed: number
  entries_found: number
  accepted_entries: number
  saved_jobs: number
  duplicates: number
  rejected_entries: number
  errors: number
  source_errors: {
    source: string
    error: string
  }[]
  results: JobFetchResult[]
  message?: string
}


export async function fetchNewJobs(): Promise<JobFetchSummary> {
  const response = await fetch('/api/jobs/fetch/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCsrfToken() ?? '',
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching new jobs: ${response.status}`)
  }

  return response.json() as Promise<JobFetchSummary>
}