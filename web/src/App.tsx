import { Navigate, Route, Routes } from 'react-router'
import JobsImportPage from '@/pages/JobsImportPage'
import JobsListPage from '@/pages/JobsListPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/jobs-list" replace />} />
      <Route path="/jobs-list" element={<JobsListPage />} />
      <Route path="/jobs-import" element={<JobsImportPage />} />
    </Routes>
  )
}

export default App