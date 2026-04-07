import './assets/main.css'
import './i18n'
import PageSkeleton from '@renderer/components/common/SkeletonLoader'
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<PageSkeleton />}>
      <App />
    </Suspense>
  </StrictMode>
)
