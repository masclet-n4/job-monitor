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
    <div className="min-h-screen px-4 py-5 sm:px-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5 md:space-y-6">
        <header className="flex items-center gap-3 border-b border-slate-700 pb-4">
          <div className="rounded-xl bg-blue-500/10 p-2">
            <Activity className="h-6 w-6 text-blue-400 md:h-8 md:w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white md:text-2xl">Job Monitor</h1>
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
