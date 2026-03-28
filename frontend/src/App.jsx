import { useState } from "react"
import { Activity } from "lucide-react"
import JobFilters from "./components/JobFilters"
import JobTable from "./components/JobTable"
import { useJobs } from "./hooks/useJobs"
import "./index.css"

export default function App() {
  const [filters, setFilters] = useState({
    date:   "",
    type:   "",
    status: "",
  })

  const [currentPage, setCurrentPage]   = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { jobs, totalPages, totalItems, isLoading, error, refetch } = useJobs({
    page:    currentPage,
    perPage: 8,
    filters,
    sort:    '-start_date',
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handlePageChange = (newPage) => setCurrentPage(newPage)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center gap-3 pb-4 border-b border-slate-700">
          <Activity className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Job Monitor</h1>
            <p className="text-sm text-slate-400">Panel de monitoreo de jobs y scrapers</p>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 font-medium">Error al cargar jobs</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        <JobFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
        />

        <JobTable
          jobs={jobs}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
