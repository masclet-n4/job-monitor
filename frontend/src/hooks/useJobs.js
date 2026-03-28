import { useState, useEffect, useCallback } from 'react'
import { pocketbase } from '@/lib/pocketbase'

export function useJobs({ page = 1, perPage = 8, filters = {}, sort = '-start_date' } = {}) {
  const [jobs, setJobs]             = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState(null)

  const buildFilter = useCallback(() => {
    const conditions = []
    if (filters.status?.trim()) conditions.push(`status ~ "${filters.status}"`)
    if (filters.type?.trim())   conditions.push(`type ~ "${filters.type}"`)
    if (filters.date)           conditions.push(`start_date ~ "${filters.date}"`)
    return conditions.join(' && ')
  }, [filters])

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filter = buildFilter()
      const result = await pocketbase.getJobs({ page, perPage, sort, filter })
      setJobs(result.items || [])
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [page, perPage, sort, buildFilter])

  const refetch = useCallback(() => fetchJobs(), [fetchJobs])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return { jobs, totalPages, totalItems, isLoading, error, refetch }
}
