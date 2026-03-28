async function api(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

async function getJobs({ page = 1, perPage = 10, sort = '-start_date', filter = '' } = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    sort,
  })
  if (filter) params.append('filter', filter)

  const data = await api(`/api/jobs?${params}`)
  return {
    items:      data.items      || [],
    totalPages: data.totalPages || 1,
    totalItems: data.totalItems || 0,
    page:       data.page       || 1,
  }
}

async function getJob(id) {
  return api(`/api/jobs/${id}`)
}

export const pocketbase = { getJobs, getJob, api }
