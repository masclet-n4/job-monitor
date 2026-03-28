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
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, Code, CheckCircle, Loader2 } from "lucide-react"

const statusConfig = {
  completed: { variant: "success", label: "Completado" },
  failed: { variant: "destructive", label: "Fallido" },
  running: { variant: "warning", label: "Ejecutando" },
  pending: { variant: "secondary", label: "Pendiente" },
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
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 overflow-hidden">
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
                      {(job.details?.errores_count || 0) > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 -ml-2"
                          onClick={() => openErrorModal(job)}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {job.details.errores_count}
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
            Página {currentPage} de {totalPages} • Total: {totalItems} jobs
          </p>
          <div className="flex gap-2">
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
