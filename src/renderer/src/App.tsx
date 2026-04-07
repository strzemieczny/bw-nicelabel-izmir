import { ThemeProvider } from './context/ThemeContext'
import { LayoutView } from '@renderer/views/index'

import { HashRouter as Router, Route, Routes } from 'react-router-dom'

function App(): React.JSX.Element {
  return (
    <>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LayoutView />}>
              <Route path="templates" element={<div>Szablony</div>} />
              <Route path="config" element={<div>AAAA</div>} />
            </Route>
            <Route path="*" element={<div>Nie znaleziono strony</div>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  )
}

export default App
