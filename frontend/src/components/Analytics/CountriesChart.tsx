/**
 * CountriesChart Component
 *
 * Pie chart showing click distribution by country.
 * Displays top countries with clicks from users.
 * Uses Recharts library for visualization. Supports dark mode.
 *
 * Features:
 * - Pie chart with custom colors
 * - Legend showing countries
 * - Tooltip with percentages
 * - Responsive design
 * - Dark mode aware legend/tooltip colors
 * - Mock data for demo
 *
 * Props:
 * - data: Array of country data with name and value
 * - title: Chart title
 *
 * Usage:
 * <CountriesChart
 *   data={countriesData}
 *   title="Clicks by Country"
 * />
 */
import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Interface for country data
 */
interface CountryData {
  /**
   * Country name
   */
  name: string
  /**
   * Number of clicks from this country
   */
  value: number
}
/**
 * Props interface for CountriesChart
 */
interface CountriesChartProps {
  /**
   * Array of country data points
   */
  data: CountryData[]
  /**
   * Title to display above chart
   */
  title: string
}
/**
 * Color palette for pie chart segments
 */
const COLORS = [
  '#2563eb', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
]
/**
 * CountriesChart Component
 *
 * Renders a pie chart showing click distribution by country.
 * Includes legend and percentage tooltips.
 *
 * @param {CountriesChartProps} props - Component props
 * @returns {React.ReactElement} Country distribution chart
 */
export const CountriesChart: React.FC<CountriesChartProps> = ({
  data,
  title
}) => {
  /**
   * Determine if dark mode is active to pick legend/tooltip colors.
   */
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const legendColor = isDark ? '#cbd5e1' : '#334155'
  const tooltipBg = isDark ? '#0f172a' : '#1e293b'

  /**
   * Calculate total clicks for percentage calculation
   */
  const totalClicks = data.reduce((sum, country) => sum + country.value, 0)
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
      {/* Chart title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>
      {/* Responsive container for chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          {/* Pie chart */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {/* Color each segment */}
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* Legend */}
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(_value, entry) => {
              const payload = entry?.payload as
                | { name?: string; value?: number }
                | undefined
              const count = payload?.value ?? 0
              const percentage =
                totalClicks > 0
                  ? ((count / totalClicks) * 100).toFixed(1)
                  : '0.0'
              return (
                <span style={{ color: legendColor }}>
                  {payload?.name} ({percentage}%)
                </span>
              )
            }}
          />
          {/* Tooltip on hover */}
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => {
              const percentage = ((value as number / totalClicks) * 100).toFixed(1)
              return [`${value} clicks (${percentage}%)`, 'Clicks']
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
