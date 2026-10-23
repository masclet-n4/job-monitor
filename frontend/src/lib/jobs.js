export const statusConfig = {
  completed: { variant: "success", label: "Completado" },
  done: { variant: "success", label: "Completado" },
  completed_with_errors: { variant: "warning", label: "Completado con errores" },
  failed: { variant: "destructive", label: "Fallido" },
  error: { variant: "destructive", label: "Fallido" },
  running: { variant: "warning", label: "Ejecutando" },
  processing: { variant: "warning", label: "Procesando" },
  starting: { variant: "warning", label: "Iniciando" },
  cancelled: { variant: "secondary", label: "Cancelado" },
  stopped: { variant: "secondary", label: "Detenido" },
}

export function getJobErrors(job) {
  const raw = job.errors
  let errors = []
  if (Array.isArray(raw)) errors = raw
  else if (typeof raw === "string" && raw.trim()) errors = [{ message: raw }]
  else if (raw && typeof raw === "object" && Object.values(raw).some((value) => value != null && value !== "")) errors = [raw]

  const visibleErrors = errors.filter((error) => error?.code !== "job_completed")
  const hasErrorStatus = job.status === "error" || job.status === "failed"
  const hasErrorCount = Number.isInteger(job.details?.error_count) && job.details.error_count > 0
  if (visibleErrors.length || (!hasErrorStatus && !hasErrorCount)) return visibleErrors
  return [{ message: "El job reportó errores, pero no incluyó detalles." }]
}

export function getJobErrorCount(job) {
  const errors = getJobErrors(job)
  const detailCount = Number.isInteger(job.details?.error_count) ? job.details.error_count : 0
  return Math.max(errors.length, detailCount)
}
