import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Home from './pages/Home.jsx'
import SessionList from './pages/SessionList.jsx'
import SessionDetail from './pages/SessionDetail.jsx'
import NarrativeList from './pages/NarrativeList.jsx'
import NarrativeDetail from './pages/NarrativeDetail.jsx'
import Gallery from './pages/Gallery.jsx'
import Characters from './pages/Characters.jsx'
import CharacterDetail from './pages/CharacterDetail.jsx'
import PairDetail from './pages/PairDetail.jsx'
import LogList from './pages/LogList.jsx'
import LogDetail from './pages/LogDetail.jsx'
import Editor from './pages/Editor.jsx'
import CharacterEditor from './pages/CharacterEditor.jsx'
import PairEditor from './pages/PairEditor.jsx'

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<SessionList />} />
          <Route path="/sessions/:slug" element={<SessionDetail />} />
          <Route path="/narratives" element={<NarrativeList />} />
          <Route path="/narratives/:slug" element={<NarrativeDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/characters/pair/:pairSlug" element={<PairDetail />} />
          <Route path="/characters/pair/:pairSlug/:slug" element={<CharacterDetail />} />
          <Route path="/characters/:slug" element={<CharacterDetail />} />
          <Route path="/log" element={<LogList />} />
          <Route path="/log/:slug" element={<LogDetail />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/character-editor" element={<CharacterEditor />} />
          <Route path="/pair-editor" element={<PairEditor />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
