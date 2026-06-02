/**
 * SearchBar Component
 * 
 * Search and filter bar for URL Management page.
 * Allows users to search URLs by short code or original URL.
 * Includes filter options for sorting and status.
 * 
 * Features:
 * - Search input for URLs
 * - Sort options (newest, oldest, most clicks)
 * - Filter by status (all, active, inactive)
 * - Clear search button
 * - Responsive design
 * 
 * Props:
 * - searchTerm: Current search value
 * - onSearchChange: Callback when search changes
 * - sortBy: Current sort option
 * - onSortChange: Callback when sort changes
 * - filterStatus: Current filter status
 * - onFilterChange: Callback when filter changes
 * 
 * Usage:
 * <SearchBar
 *   searchTerm={search}
 *   onSearchChange={setSearch}
 *   sortBy="newest"
 *   onSortChange={setSortBy}
 *   filterStatus="all"
 *   onFilterChange={setFilterStatus}
 * />
 */

import React from 'react'
import { Search, X } from 'lucide-react'

/**
 * Props interface for SearchBar component
 */
interface SearchBarProps {
  /**
   * Current search term value
   */
  searchTerm: string
  
  /**
   * Callback when search input changes
   * @param value - New search term
   */
  onSearchChange: (value: string) => void
  
  /**
   * Current sort option value
   */
  sortBy: string
  
  /**
   * Callback when sort option changes
   * @param value - New sort option
   */
  onSortChange: (value: string) => void
  
  /**
   * Current filter status value
   */
  filterStatus: string
  
  /**
   * Callback when filter status changes
   * @param value - New filter status
   */
  onFilterChange: (value: string) => void
}

/**
 * SearchBar Component
 * 
 * Provides search, sort, and filter functionality for URLs.
 * Helps users find and organize their shortened URLs.
 * 
 * @param {SearchBarProps} props - Component props
 * @returns {React.ReactElement} Search bar with filters
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterStatus,
  onFilterChange,
}) => {
  /**
   * Handle clear search button click
   */
  const handleClear = () => {
    onSearchChange('')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      
      {/* Search input row */}
      <div className="mb-4">
        <div className="relative">
          {/* Search icon */}
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by short code or URL..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and sort row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Sort dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-clicks">Most Clicks</option>
            <option value="least-clicks">Least Clicks</option>
          </select>
        </div>

        {/* Filter status dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All URLs</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  )
}
