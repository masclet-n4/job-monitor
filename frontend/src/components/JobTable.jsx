import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import ErrorModal from "./ErrorModal"
import { formatDuration, formatDate } from "@/lib/utils"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, Code, CheckCircle, Loader2, Clock3, Package, Gauge } from "lucide-react"

const statusConfig = {
  completed: { variant: "success", label: "Completado" },
  completed_with_errors: { variant: "warning", label: "Completado con errores" },
  failed: { variant: "destructive", label: "Fallido" },
  running: { variant: "warning", label: "Ejecutando" },
  cancelled: { variant: "secondary", label: "Cancelado" },
}

const metricLabels = {
  products_total: "Productos totales",
  products_processed: "Productos procesados",
  products_saved: "Productos guardados",
  products_failed: "Productos fallidos",
  prices_loaded: "Precios cargados",
  worker_count: "Workers",
  throughput_items_per_second: "Elementos/segundo",
  supermarket_id: "Supermercado",
}

function formatMetric(key, value) {
  if (typeof value === "number") {
    return key.includes("throughput") ? value.toLocaleString("es-ES", { maximumFractionDigits: 2 }) : value.toLocaleString("es-ES")
  }
  return String(value)
}

export default function JobTable({ jobs, isLoading, currentPage, totalPages, totalItems, onPageChange }) {
  const [sortField, setSortField] = useState("start_date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [expandedJobId, setExpandedJobId] = useState(null)
  const [selectedJobErrors, setSelectedJobErrors] = useState({ isOpen: false, errors: [], jobId: "" })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (sortField === "start_date" || sortField === "end_date") {
      aValue = new Date(aValue || 0).getTime()
      bValue = new Date(bValue || 0).getTime()
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  const openErrorModal = (job) => {
    setSelectedJobErrors({
      isOpen: true,
      errors: job.errors || [],
      jobId: job.id
    })
  }

  const closeErrorModal = () => {
    setSelectedJobErrors({ isOpen: false, errors: [], jobId: "" })
  }

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  const getDuration = (job) => {
    if (typeof job.details?.duration_ms === "number") return formatDuration(job.details.duration_ms / 1000)
    if (job.start_date && job.end_date) return formatDuration((new Date(job.end_date) - new Date(job.start_date)) / 1000)
    return "En curso"
  }

  const getErrors = (job) => Array.isArray(job.errors)
    ? job.errors.filter((error) => error?.code !== "job_completed")
    : []
  const getErrorCount = (job) => {
    const errors = getErrors(job)
    return errors.length || (Number.isInteger(job.details?.error_count) ? job.details.error_count : 0)
  }

  const JobSummary = ({ job }) => {
    const errorCount = getErrorCount(job)
    const metrics = job.details || {}
    return (
      <>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-100">{job.type || "Job sin tipo"}</p>
            <p className="mt-1 text-xs text-slate-500">{job.start_date ? formatDate(job.start_date) : "Sin fecha"}</p>
          </div>
          <Badge variant={statusConfig[job.status]?.variant || "secondary"}>
            {statusConfig[job.status]?.label || job.status || "Desconocido"}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-300"><Clock3 className="h-4 w-4 text-slate-500" />{getDuration(job)}</div>
          <div className={`flex items-center gap-2 ${errorCount ? "text-red-400" : "text-emerald-400"}`}>
            {errorCount ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {errorCount} {errorCount === 1 ? "error" : "errores"}
          </div>
          {metrics.products_processed != null && <div className="flex items-center gap-2 text-slate-300"><Package className="h-4 w-4 text-slate-500" />{formatMetric("products_processed", metrics.products_processed)} procesados</div>}
          {metrics.throughput_items_per_second != null && <div className="flex items-center gap-2 text-slate-300"><Gauge className="h-4 w-4 text-slate-500" />{formatMetric("throughput_items_per_second", metrics.throughput_items_per_second)}/s</div>}
        </div>
      </>
    )
  }

  const JobDetails = ({ job }) => {
    const errors = getErrors(job)
    const errorCount = getErrorCount(job)
    const metrics = Object.entries(job.details || {})
    return (
      <div className="mt-4 border-t border-slate-700 pt-4 text-sm">
        <div className="grid gap-2 text-slate-400 sm:grid-cols-2">
          <p><span className="text-slate-500">ID:</span> <span className="font-mono text-xs">{job.id}</span></p>
          <p><span className="text-slate-500">Fin:</span> {job.end_date ? formatDate(job.end_date) : "En curso"}</p>
        </div>
        {metrics.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{metrics.map(([key, value]) => <div key={key} className="flex justify-between gap-3 rounded-lg bg-slate-950/50 px-3 py-2"><span className="text-slate-500">{metricLabels[key] || key.replace(/_/g, " ")}</span><span className="text-right text-slate-200">{formatMetric(key, value)}</span></div>)}</div>}
        {errors.length > 0 && <div className="mt-4 space-y-2"><p className="font-medium text-red-300">Errores ({errorCount})</p>{errors.map((error, index) => <div key={index} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3"><p className="text-slate-200">{error.message || "Error sin mensaje"}</p>{error.entity_id && <p className="mt-1 text-xs text-slate-500">Entidad: {error.entity_id}</p>}{error.stack_trace && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-500">{error.stack_trace}</pre>}</div>)}</div>}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-slate-400">Cargando jobs...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {sortedJobs.length === 0 ? <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-500">No hay jobs para mostrar</div> : sortedJobs.map((job) => <article key={job.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"><button className="w-full text-left" onClick={() => toggleExpand(job.id)} aria-expanded={expandedJobId === job.id}><JobSummary job={job} /></button>{expandedJobId === job.id && <JobDetails job={job} />}</article>)}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/50 md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("type")}>
                Type <SortIcon field="type" />
              </TableHead>
              <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("id")}>
                ID <SortIcon field="id" />
              </TableHead>
              <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("status")}>
                Status <SortIcon field="status" />
              </TableHead>
              <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("start_date")}>
                Inicio <SortIcon field="start_date" />
              </TableHead>
              <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("end_date")}>
                Fin <SortIcon field="end_date" />
              </TableHead>
              <TableHead className="text-slate-400 cursor-pointer" onClick={() => handleSort("details.duracion_segundos")}>
                Duración <SortIcon field="details.duracion_segundos" />
              </TableHead>
              <TableHead className="text-slate-400">Errores</TableHead>
              <TableHead className="text-slate-400 w-[80px]">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No hay jobs para mostrar
                </TableCell>
              </TableRow>
            ) : (
              sortedJobs.map((job) => (
                <>
                  <TableRow key={job.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="text-slate-200 font-medium">
                      {job.type?.replace(/_/g, ' ') || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400 max-w-[120px] truncate">
                      {job.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[job.status]?.variant || "secondary"}>
                        {statusConfig[job.status]?.label || job.status || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                      {job.start_date ? formatDate(job.start_date) : '-'}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                      {job.end_date ? formatDate(job.end_date) : '-'}
                    </TableCell>
                    <TableCell className="text-slate-300 whitespace-nowrap">
                      {job.details?.duracion_segundos ? formatDuration(job.details.duracion_segundos) : '-'}
                    </TableCell>
                    <TableCell>
                      {getErrorCount(job) > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 -ml-2"
                          onClick={() => openErrorModal(job)}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {getErrorCount(job)}
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle className="h-4 w-4" />
                          0
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`hover:bg-slate-700 ${expandedJobId === job.id ? 'text-blue-400' : 'text-slate-400'}`}
                        onClick={() => toggleExpand(job.id)}
                      >
                        <Code className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedJobId === job.id && (
                    <TableRow key={`${job.id}-details`} className="bg-slate-800/30">
                      <TableCell colSpan={8} className="p-0">
                        <div className="p-4 border-t border-slate-700">
                          <p className="text-xs text-slate-500 mb-2 font-mono">details:</p>
                          <pre className="bg-slate-950 rounded-md p-4 text-xs text-slate-300 overflow-x-auto font-mono max-h-[300px]">
                            {JSON.stringify(job.details, null, 2)}
                          </pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
            Página {currentPage} de {totalPages} · {totalItems} jobs
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ErrorModal
        isOpen={selectedJobErrors.isOpen}
        onClose={closeErrorModal}
        errors={selectedJobErrors.errors}
        jobId={selectedJobErrors.jobId}
      />
    </div>
  )
}
