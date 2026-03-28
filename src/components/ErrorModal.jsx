import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

export default function ErrorModal({ errors, isOpen, onClose, jobId }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  if (!errors || errors.length === 0) return null

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Errores del Job
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Job ID: {jobId} • Total: {errors.length} errores
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant="destructive" className="shrink-0">
                    #{index + 1}
                  </Badge>
                  <span className="text-sm text-slate-200 truncate">
                    {error.message}
                  </span>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </button>
              
              {expandedIndex === index && error.stackTrace && (
                <div className="px-3 pb-3">
                  <pre className="mt-2 p-3 bg-slate-950 rounded-md text-xs text-slate-400 overflow-x-auto font-mono whitespace-pre-wrap">
                    {error.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
