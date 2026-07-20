/**
 * Hero Component
 *
 * Main hero section of the landing page.
 * Displays the primary value proposition with a large headline,
 * supporting text, call-to-action buttons, and brand mentions.
 * Supports dark mode.
 *
 * Features:
 * - Gradient background for visual appeal
 * - Responsive typography (larger on desktop)
 * - Two CTA buttons (primary and secondary)
 * - Brand trust indicators (used by companies)
 * - Smooth transitions and hover effects
 * - Dark mode support
 *
 * Props: None
 *
 * Usage:
 * <Hero />
 */
import React from 'react'
import { Button } from '../UI/Button'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
/**
 * Hero Component
 *
 * Renders the hero section with:
 * - Main headline with colored accents
 * - Supporting description text
 * - Primary and secondary call-to-action buttons
 * - Trust indicators showing common use cases
 *
 * @returns {React.ReactElement} Hero section element
 */
export const Hero: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    /**
     * Hero section container with gradient background
     * - bg-gradient-to-br: Creates diagonal gradient from top-left to bottom-right
     * - from-blue-50 to-indigo-100: Light blue to indigo gradient (dark: slate tones)
     * - py-20 md:py-32: Vertical padding, larger on desktop
     */
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-20 md:py-32 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Main headline with color-coded words */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100">
            {t('hero.title1')}
            <span className="text-blue-600 dark:text-blue-400">{t('hero.title2')}</span>
            <br />
            <span className="text-blue-600 dark:text-blue-400">{t('hero.title3')}</span>
          </h1>
          {/* Supporting description text */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
{t('hero.subtitle')}
          </p>
          {/* Call-to-action buttons section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Primary button with arrow icon */}
            <Button
              size="lg"
              className="flex items-center justify-center gap-2"
              onClick={() => navigate('/register')}
            >
              {t('hero.getStarted')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            {/* Secondary button for demo */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => console.log('View demo clicked')}
            >
              {t('hero.viewDemo')}
            </Button>
          </div>
          {/* Trust indicators - companies/use cases */}
          <div className="pt-8 border-t border-blue-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-4">
{t('hero.trustedBy')}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-slate-400 dark:text-slate-500 text-sm">
              <span>{t('hero.ecommerce')}</span>
              <span>{t('hero.marketing')}</span>
              <span>{t('hero.influencers')}</span>
              <span>{t('hero.journalism')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
