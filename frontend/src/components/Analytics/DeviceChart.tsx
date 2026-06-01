/**
 * DeviceChart Component
 * 
 * Bar chart showing click distribution by device type.
 * Displays clicks from Mobile, Desktop, and Tablet.
 * Uses Recharts library for visualization.
 * 
 * Features:
 * - Bar chart with responsive layout
 * - Device type breakdown
 * - Tooltip with detailed info
 * - Color-coded by device
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
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Chart title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        {title}
      </h3>
      
      {/* Responsive container for chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          {/* Grid background */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          
          {/* X and Y axes */}
          <XAxis 
            dataKey="device" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          
          {/* Legend */}
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              if (value === 'clicks') return 'Clicks'
              return value
            }}
          />
          
          {/* Tooltip on hover */}
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
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
            <p className="text-sm text-slate-600 mb-1">
              {device.device}
            </p>
            <p className="text-2xl font-bold" style={{ color: DEVICE_COLORS[device.device] || '#2563eb' }}>
              {device.clicks}
            </p>
            <p className="text-xs text-slate-500">
              {device.percentage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
