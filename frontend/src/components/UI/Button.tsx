/**
 * Button Component
 * 
 * A reusable, accessible button component with multiple variants and sizes.
 * Provides consistent styling across the application using Tailwind CSS.
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' (default: 'primary')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - children: React.ReactNode (required)
 * - All standard HTML button attributes are supported
 * 
 * Examples:
 * <Button>Click me</Button>
 * <Button variant="outline" size="lg">Large outline button</Button>
 * <Button variant="secondary" onClick={handleClick}>Secondary</Button>
 */

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * - primary: Blue background, white text (main CTA)
   * - secondary: Dark gray background, white text
   * - outline: Transparent background, blue border and text
   */
  variant?: 'primary' | 'secondary' | 'outline'
  
  /**
   * Button size/padding
   * - sm: Small padding, 12px font
   * - md: Medium padding, 16px font (default)
   * - lg: Large padding, 18px font
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Button content (text, icons, etc)
   */
  children: React.ReactNode
}

/**
 * Button Component
 * 
 * @param {ButtonProps} props - Component props
 * @returns {React.ReactElement} Rendered button element
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  /**
   * Base styles applied to all button variants
   * Includes: font weight, border radius, transitions, and cursor
   */
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  
  /**
   * Variant-specific styles
   * Each variant defines background, text color, and hover states
   */
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-950',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
  }
  
  /**
   * Size-specific padding and font sizes
   * Allows flexible button sizing for different contexts
   */
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  /**
   * Combine all style classes and render button
   * Allows custom className to override or extend default styles
   */
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
