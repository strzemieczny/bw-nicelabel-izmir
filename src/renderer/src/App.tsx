import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import {
  LayoutView,
  ConfigView,
  LabelsFormatsView,
  LabelEditView,
  PrintView
} from '@renderer/views'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

function App(): React.JSX.Element {
  return (
    <>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LayoutView />}>
              <Route path="/" element={<PrintView />} />
              <Route path="config" element={<ConfigView />} />
              <Route path="templates" element={<LabelsFormatsView />} />
            </Route>
            <Route path="/preview" element={<LabelEditView />} />
            <Route path="*" element={<div>Nie znaleziono strony</div>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  )
}

export default App
