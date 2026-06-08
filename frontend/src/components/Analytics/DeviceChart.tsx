/**
 * DeviceChart Component
 *
 * Bar chart showing click distribution by device type.
 * Displays clicks from Mobile, Desktop, and Tablet.
 * Uses Recharts library for visualization. Supports dark mode.
 *
 * Features:
 * - Bar chart with responsive layout
 * - Device type breakdown
 * - Tooltip with detailed info
 * - Color-coded by device
 * - Dark mode aware axis/grid/tooltip colors
 * - Mock data for demo
 *
 * Props:
 * - data: Array of device data with type and clicks
 * - title: Chart title
 *
 * Usage:
 * <DeviceChart
 *   data={deviceData}
 *   title="Clicks by Device"
 * />
 */

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Interface for device data
 */
interface DeviceData {
  /**
   * Device type (Mobile, Desktop, Tablet)
   */
  device: string

  /**
   * Number of clicks from this device
   */
  clicks: number

  /**
   * Percentage of total clicks
   */
  percentage: number
}

/**
 * Props interface for DeviceChart
 */
interface DeviceChartProps {
  /**
   * Array of device data points
   */
  data: DeviceData[]

  /**
   * Title to display above chart
   */
  title: string
}

/**
 * Color mapping for device types
 */
const DEVICE_COLORS: { [key: string]: string } = {
  'Mobile': '#2563eb',    // blue
  'Desktop': '#10b981',   // green
  'Tablet': '#f59e0b',    // amber
}

/**
 * DeviceChart Component
 *
 * Renders a bar chart showing click distribution by device type.
 * Displays Mobile, Desktop, and Tablet breakdown.
 *
 * @param {DeviceChartProps} props - Component props
 * @returns {React.ReactElement} Device distribution chart
 */
export const DeviceChart: React.FC<DeviceChartProps> = ({
  data,
  title
}) => {
  /**
   * Determine if dark mode is active to pick chart colors.
   */
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#0f172a' : '#1e293b'
  const legendColor = isDark ? '#cbd5e1' : '#334155'

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
      {/* Chart title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>

      {/* Responsive container for chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          {/* Grid background */}
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          {/* X and Y axes */}
          <XAxis
            dataKey="device"
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={axisColor}
            style={{ fontSize: '12px' }}
          />

          {/* Legend */}
          <Legend
            wrapperStyle={{ paddingTop: '20px', color: legendColor }}
            formatter={(value) => {
              if (value === 'clicks') return <span style={{ color: legendColor }}>Clicks</span>
              return <span style={{ color: legendColor }}>{value}</span>
            }}
          />

          {/* Tooltip on hover */}
          <Tooltip
            cursor={{ fill: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)' }}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value, name) => {
              if (name === 'clicks') {
                return [value, 'Clicks']
              }
              return [value, name]
            }}
            labelFormatter={(label) => `${label}`}
          />

          {/* Bar with dynamic color */}
          <Bar
            dataKey="clicks"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {data.map((device, idx) => (
          <div key={idx} className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {device.device}
            </p>
            <p className="text-2xl font-bold" style={{ color: DEVICE_COLORS[device.device] || '#2563eb' }}>
              {device.clicks}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {device.percentage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
