export type JobKeyword = {
  id: string
  term: string
  keyword_type: 'positive' | 'negative'
  weight: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type JobKeywordInput = {
  term: string
  keyword_type: 'positive' | 'negative'
  weight: number
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

export async function fetchKeywords(): Promise<JobKeyword[]> {
  const response = await fetch('/api/keywords/')

  if (!response.ok) {
    throw new Error(`Error getting keywords: ${response.status}`)
  }

  return response.json() as Promise<JobKeyword[]>
}

export async function fetchKeyword(id: string): Promise<JobKeyword> {
  const response = await fetch(`/api/keywords/${id}/`)

  if (!response.ok) {
    throw new Error(`Error getting keyword: ${response.status}`)
  }

  return response.json() as Promise<JobKeyword>
}

export async function createKeyword(
  keyword: JobKeywordInput,
): Promise<JobKeyword> {
  const response = await fetch('/api/keywords/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() ?? '',
    },
    body: JSON.stringify(keyword),
  })

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Error creating keyword: ${response.status}`,
    )

    throw new Error(errorMessage)
  }

  return response.json() as Promise<JobKeyword>
}

export async function updateKeyword(
  id: string,
  keyword: Partial<JobKeywordInput>,
): Promise<JobKeyword> {
  const response = await fetch(`/api/keywords/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() ?? '',
    },
    body: JSON.stringify(keyword),
  })

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Error updating keyword: ${response.status}`,
    )

    throw new Error(errorMessage)
  }

  return response.json() as Promise<JobKeyword>
}

export async function deleteKeyword(id: string): Promise<void> {
  const response = await fetch(`/api/keywords/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': getCsrfToken() ?? '',
    },
  })

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      `Error deleting keyword: ${response.status}`,
    )

    throw new Error(errorMessage)
  }
}