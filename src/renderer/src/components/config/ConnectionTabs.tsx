import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiWifi } from 'react-icons/fi'

type ConnectionType = 'IP'

interface ConnectionTabsProps {
  activeTab: ConnectionType
  onTabChange: (tab: ConnectionType) => void
}

export default function ConnectionTabs({
  activeTab,
  onTabChange
}: ConnectionTabsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="flex items-center border-b border-slate-100 dark:border-slate-700">
      <button
        onClick={() => onTabChange('IP')}
        className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          activeTab === 'IP'
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-600 dark:border-indigo-400'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <FiWifi
          className={`text-xl ${activeTab === 'IP' ? 'text-indigo-500 dark:text-indigo-400' : ''}`}
        />
        <span>{t('config_view.tabs_network')}</span>
      </button>

    </div>
  )
}
