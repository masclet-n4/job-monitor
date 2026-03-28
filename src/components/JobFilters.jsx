import { useState, useEffect, useCallback } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { RefreshCw } from "lucide-react"

export default function JobFilters({ filters, onFilterChange, onRefresh, isLoading }) {
  const [typeInput, setTypeInput] = useState(filters.type || '')
  const [statusInput, setStatusInput] = useState(filters.status || '')

  const debounce = useCallback((fn, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }, [])

  const debouncedTypeFilter = useCallback(
    debounce((value) => {
      onFilterChange({ ...filters, type: value })
    }, 500),
    [filters, onFilterChange]
  )

  const debouncedStatusFilter = useCallback(
    debounce((value) => {
      onFilterChange({ ...filters, status: value })
    }, 500),
    [filters, onFilterChange]
  )

  const handleTypeChange = (e) => {
    const value = e.target.value
    setTypeInput(value)
    debouncedTypeFilter(value)
  }

  const handleStatusChange = (e) => {
    const value = e.target.value
    setStatusInput(value)
    debouncedStatusFilter(value)
  }

  useEffect(() => {
    setTypeInput(filters.type || '')
    setStatusInput(filters.status || '')
  }, [filters.type, filters.status])

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs text-slate-400 mb-1 block">Fecha</label>
        <Input
          type="date"
          value={filters.date}
          onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
          className="bg-slate-900 border-slate-700 text-slate-200"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-xs text-slate-400 mb-1 block">Tipo de Job</label>
        <Input
          type="text"
          placeholder="Buscar tipo..."
          value={typeInput}
          onChange={handleTypeChange}
          className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-xs text-slate-400 mb-1 block">Estado</label>
        <Input
          type="text"
          placeholder="Buscar estado..."
          value={statusInput}
          onChange={handleStatusChange}
          className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
        />
      </div>

      <Button
        onClick={onRefresh}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Recargar
      </Button>
    </div>
  )
}