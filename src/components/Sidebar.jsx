import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/', icon: 'home', label: '메인' },
  { to: '/gallery', icon: 'image', label: '커미션/이미지 백업' },
  { to: '/sessions', icon: 'menu_book', label: '세션 로그 백업' },
  { to: '/characters', icon: 'cloud', label: '캐릭터 백업' },
  { to: '/narratives', icon: 'bookmark', label: '서사 로그 백업' },
]

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="주 메뉴">
      <ul className="sidebar-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' is-active' : '')}
              title={item.label}
              aria-label={item.label}
            >
              <Icon name={item.icon} size={22} />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
