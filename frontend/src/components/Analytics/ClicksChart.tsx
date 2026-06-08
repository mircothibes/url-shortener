/**
 * ClicksChart Component
 *
 * Line chart showing click trends over time.
 * Displays daily clicks for a shortened URL.
 * Uses Recharts library for visualization. Supports dark mode.
 *
 * Features:
 * - Line chart with gradient
 * - Responsive design
 * - Tooltip on hover
 * - Custom styling
 * - Dark mode aware axis/grid colors
 * - Mock data for demo
 *
 * Props:
 * - data: Array of click data with date and count
 * - title: Chart title
 *
 * Usage:
 * <ClicksChart
 *   data={clicksData}
 *   title="Clicks Over Time"
 * />
 */
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Interface for click data point
 */
interface ClickData {
  /**
   * Date label (e.g., "May 20")
   */
  date: string
  /**
   * Number of clicks on that date
   */
  clicks: number
}
/**
 * Props interface for ClicksChart
 */
interface ClicksChartProps {
  /**
   * Array of click data points
   */
  data: ClickData[]
  /**
   * Title to display above chart
   */
  title: string
}
/**
 * ClicksChart Component
 *
 * Renders a line chart showing click trends over time.
 * Responsive and works on mobile and desktop.
 *
 * @param {ClicksChartProps} props - Component props
 * @returns {React.ReactElement} Click trend chart
 */
export const ClicksChart: React.FC<ClicksChartProps> = ({
  data,
  title
}) => {
  /**
   * Determine if dark mode is active to pick chart colors.
   * Recharts colors are props (not CSS classes), so we switch them in JS.
   */
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#0f172a' : '#1e293b'

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
      {/* Chart title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>
      {/* Responsive container for chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {/* Grid background */}
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          {/* X and Y axes */}
          <XAxis
            dataKey="date"
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />
          {/* Tooltip on hover */}
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => [`${value} clicks`, 'Clicks']}
          />
          {/* Line */}
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
