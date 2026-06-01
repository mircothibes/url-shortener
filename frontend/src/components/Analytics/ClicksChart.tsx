/**
 * ClicksChart Component
 * 
 * Line chart showing click trends over time.
 * Displays daily clicks for a shortened URL.
 * Uses Recharts library for visualization.
 * 
 * Features:
 * - Line chart with gradient
 * - Responsive design
 * - Tooltip on hover
 * - Custom styling
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
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Chart title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        {title}
      </h3>
      
      {/* Responsive container for chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {/* Grid background */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          {/* X and Y axes */}
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          
          {/* Tooltip on hover */}
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => [`${value} clicks`, 'Clicks']}
          />
          
          {/* Line with gradient */}
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
