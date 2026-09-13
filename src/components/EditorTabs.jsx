import { NavLink } from 'react-router-dom'
import './EditorTabs.css'

const TABS = [
  { to: '/editor', label: '글 에디터' },
  { to: '/character-editor', label: '캐릭터 에디터' },
  { to: '/pair-editor', label: '페어 에디터' },
]

export default function EditorTabs() {
  return (
    <div className="editor-tabs">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => 'editor-tab' + (isActive ? ' is-active' : '')}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
