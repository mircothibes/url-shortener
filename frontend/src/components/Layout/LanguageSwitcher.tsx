/**
 * LanguageSwitcher
 *
 * A small dropdown to switch the app language between English and French.
 * The choice is persisted by i18next (localStorage) so it survives reloads.
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const current = i18n.language?.startsWith('fr') ? 'fr' : 'en'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
      <Globe className="w-4 h-4" />
      <select
        aria-label="Language"
        value={current}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer dark:bg-slate-800"
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </div>
  )
}
