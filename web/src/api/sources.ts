export type JobSource = {
  id: string
  name: string
  url: string
  is_active: boolean
  created_at: string
}

export type JobSourceInput = {
  name: string
  url: string
  is_active: boolean
}

function getCsrfToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('csrftoken='))
    ?.split('=')[1]
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const errorData: unknown = await response.json().catch(() => null)

  if (errorData && typeof errorData === 'object') {
    const messages = Object.values(errorData)
      .flat()
      .filter((value): value is string => typeof value === 'string')

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  return fallbackMessage
}

export async function fetchSources(): Promise<JobSource[]> {
  const response = await fetch('/api/sources/')

  if (!response.ok) {
    throw new Error(`Error getting RSS sources: ${response.status}`)
  }

  return response.json() as Promise<JobSource[]>
}

export async function fetchSource(id: string): Promise<JobSource> {
  const response = await fetch(`/api/sources/${id}/`)

  if (!response.ok) {
    throw new Error(`Error getting RSS source: ${response.status}`)
  }

  return response.json() as Promise<JobSource>
}

export async function createSource(
  source: JobSourceInput,
): Promise<JobSource> {
  const response = await fetch('/api/sources/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() ?? '',
    },
    body: JSON.stringify(source),
  })

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Error creating RSS source: ${response.status}`,
    )

    throw new Error(errorMessage)
  }

  return response.json() as Promise<JobSource>
}

export async function updateSource(
  id: string,
  source: Partial<JobSourceInput>,
): Promise<JobSource> {
  const response = await fetch(`/api/sources/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() ?? '',
    },
    body: JSON.stringify(source),
  })

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Error updating RSS source: ${response.status}`,
    )

    throw new Error(errorMessage)
  }

  return response.json() as Promise<JobSource>
}