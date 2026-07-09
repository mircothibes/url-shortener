/**
 * Pricing Component
 *
 * Displays the pricing plans for the application.
 * Shows 3 tiers: Free, Pro (highlighted), and Enterprise.
 * Each plan displays features and a call-to-action button.
 * Supports dark mode.
 *
 * Plans:
 * - Free: € 0/month - 100 URLs/month
 * - Pro: € 9/month - 10,000 URLs/month (most popular)
 * - Enterprise: Custom - Unlimited URLs
 *
 * Only the Free plan has a working CTA (it links to registration, which is
 * real and free). Pro and Enterprise are illustrative for this portfolio
 * project, so their buttons are decorative.
 *
 * Props: None
 *
 * Usage:
 * <Pricing />
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../UI/Button'
import { Check } from 'lucide-react'

/**
 * Props interface for PricingCard component
 */
interface PlanProps {
  /**
   * Plan name (e.g., "Free", "Pro", "Enterprise")
   */
  name: string

  /**
   * Price display text (e.g., "€ 0", "€ 9", "Custom")
   */
  price: string

  /**
   * Plan tagline/description (e.g., "For getting started")
   */
  description: string

  /**
   * Array of feature strings included in this plan
   */
  features: string[]

  /**
   * Optional flag to highlight this plan as most popular
   * When true, plan gets blue background and larger scale
   */
  highlighted?: boolean

  /**
   * Label for the call-to-action button
   */
  ctaLabel: string

  /**
   * Optional route the CTA navigates to. When omitted, the button is
   * decorative (disabled), used for illustrative plans in this portfolio.
   */
  ctaTo?: string
}

/**
 * PricingCard Component
 *
 * Individual pricing plan card with features and CTA button.
 * Can be highlighted to show the recommended/most popular plan.
 *
 * @param {PlanProps} props - Pricing card props
 * @returns {React.ReactElement} Pricing card element
 */
const PricingCard: React.FC<PlanProps> = ({
  name,
  price,
  description,
  features,
  highlighted,
  ctaLabel,
  ctaTo,
}) => {
  const navigate = useNavigate()

  return (
    /**
     * Pricing card container with conditional styling
     * - highlighted plan: blue background, white text, shadow, scale up
     * - normal plan: white background, dark text, subtle shadow (dark: slate-800)
     */
    <div
      className={`rounded-lg p-8 transition-all ${
        highlighted
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow-md'
      }`}
    >

      {/* Plan name/title */}
      <h3 className="text-2xl font-bold mb-2">
        {name}
      </h3>

      {/* Plan tagline/description */}
      <p className={`text-sm mb-6 ${highlighted ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
        {description}
      </p>

      {/* Price display section */}
      <div className="mb-6">
        <span className="text-4xl font-bold">
          {price}
        </span>
        {price !== 'Custom' && (
          <span className={highlighted ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}>
            /month
          </span>
        )}
      </div>

      {/* Call-to-action button. Only plans with a ctaTo navigate; others are
          decorative and disabled. */}
      <Button
        variant={highlighted ? 'secondary' : 'primary'}
        size="lg"
        className="w-full mb-8"
        disabled={!ctaTo}
        onClick={ctaTo ? () => navigate(ctaTo) : undefined}
      >
        {ctaLabel}
      </Button>

      {/* Features list with check icons */}
      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3">
            {/* Check icon - always visible */}
            <Check className={`w-5 h-5 flex-shrink-0 ${highlighted ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
            {/* Feature text */}
            <span className="text-sm">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Pricing Component
 *
 * Renders the pricing section with 3 plan options.
 * Pro plan is highlighted as the most popular choice.
 *
 * The 3 plans are:
 * 1. Free - For getting started with basic features
 * 2. Pro - Most popular with comprehensive features (highlighted)
 * 3. Enterprise - For large-scale deployments with custom needs
 *
 * @returns {React.ReactElement} Pricing section with 3 plans
 */
export const Pricing: React.FC = () => {
  /**
   * Array of pricing plans with details
   * Each plan includes name, price, description, and features list
   */
  const plans = [
    {
      name: 'Free',
      price: '€ 0',
      description: 'For getting started',
      features: [
        '100 URLs/month',
        'Basic analytics',
        'Email support',
        'No custom branding',
      ],
      ctaLabel: 'Get Started Free',
      ctaTo: '/register',
    },
    {
      name: 'Pro',
      price: '€ 9',
      description: 'Most popular',
      features: [
        '10,000 URLs/month',
        'Complete analytics',
        'Custom domains',
        'API access',
        'Priority support',
        'Webhooks',
      ],
      highlighted: true,
      ctaLabel: 'Choose Plan',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large volumes',
      features: [
        'Unlimited URLs',
        'White-label solution',
        'SLA guaranteed',
        'Dedicated support',
        'Custom integrations',
      ],
      ctaLabel: 'Contact Sales',
    },
  ]

  return (
    /**
     * Pricing section container
     * id="pricing": Anchor link target from navigation
     */
    <section id="pricing" className="py-20 md:py-32 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header with title and description */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Simple Pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Pay only for what you use. No surprises.
          </p>
        </div>

        {/* Pricing cards grid - responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <PricingCard
              key={idx}
              {...plan}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
