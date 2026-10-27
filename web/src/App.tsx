import { Navigate, Route, Routes } from 'react-router'
import JobsImportPage from '@/pages/JobsImportPage'
import JobsListPage from '@/pages/JobsListPage'
import SourcesListPage from '@/pages/SourcesListPage'
import SourceCreatePage from '@/pages/SourceCreatePage'
import SourceEditPage from '@/pages/SourceEditPage'
import KeywordsListPage from '@/pages/KeywordsListPage'
import KeywordCreatePage from '@/pages/KeywordCreatePage'
import KeywordEditPage from '@/pages/KeywordEditPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/jobs-list" replace />} />
      <Route path="/jobs-list" element={<JobsListPage />} />
      <Route path="/jobs-import" element={<JobsImportPage />} />
      <Route path="/sources" element={<SourcesListPage />} />
      <Route path="/sources/new" element={<SourceCreatePage />} />
      <Route path="/sources/:id/edit" element={<SourceEditPage />} />
      <Route path="/keywords" element={<KeywordsListPage />} />
      <Route path="/keywords/new" element={<KeywordCreatePage />} />
      <Route path="/keywords/:id/edit" element={<KeywordEditPage />} />
    </Routes>
  )
}

export default App