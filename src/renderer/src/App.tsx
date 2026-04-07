import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { LayoutView, ConfigView } from '@renderer/views'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

function App(): React.JSX.Element {
  return (
    <>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LayoutView />}>
              <Route path="templates" element={<div>Szablony</div>} />
              <Route path="config" element={<ConfigView />} />
            </Route>
            <Route path="*" element={<div>Nie znaleziono strony</div>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  )
}

export default App
