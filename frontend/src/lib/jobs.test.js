import test from "node:test"
import assert from "node:assert/strict"
import { getJobErrors, getJobErrorCount, statusConfig } from "./jobs.js"

test("normalizes object-shaped errors emitted by OCR and interpretation jobs", () => {
  const job = { status: "error", errors: { message: "OpenRouter failed" } }
  assert.deepEqual(getJobErrors(job), [{ message: "OpenRouter failed" }])
  assert.equal(getJobErrorCount(job), 1)
})

test("does not treat an empty errors object on a successful job as an error", () => {
  const job = { status: "done", errors: { message: null } }
  assert.deepEqual(getJobErrors(job), [])
  assert.equal(getJobErrorCount(job), 0)
})

test("signals failed statuses even when the producer omitted error details", () => {
  const job = { status: "error" }
  assert.equal(getJobErrorCount(job), 1)
  assert.equal(getJobErrors(job)[0].message, "El job reportó errores, pero no incluyó detalles.")
  assert.deepEqual(statusConfig.error, { variant: "destructive", label: "Fallido" })
  assert.equal(statusConfig.done.label, "Completado")
})
