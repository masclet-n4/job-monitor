import { useState, useEffect, useCallback } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { RefreshCw, SlidersHorizontal } from "lucide-react"

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
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
        <SlidersHorizontal className="h-4 w-4 text-blue-400" />
        Filtros
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-end">
      <div className="min-w-0 flex-1">
        <label className="text-xs text-slate-400 mb-1 block">Fecha</label>
        <Input
          type="date"
          value={filters.date}
          onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
          className="bg-slate-900 border-slate-700 text-slate-200"
        />
      </div>

      <div className="min-w-0 flex-1">
        <label className="text-xs text-slate-400 mb-1 block">Tipo de Job</label>
        <Input
          type="text"
          placeholder="Buscar tipo..."
          value={typeInput}
          onChange={handleTypeChange}
          className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
        />
      </div>

      <div className="min-w-0 flex-1">
        <label className="text-xs text-slate-400 mb-1 block">Estado</label>
        <Input
          type="text"
          placeholder="Ej. completed"
          value={statusInput}
          onChange={handleStatusChange}
          className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
        />
      </div>

      <Button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Recargar
      </Button>
      </div>
    </div>
  )
}
