import { useState } from 'react'
import { getCharacters, getPairs } from '../lib/content.js'
import EditorTabs from '../components/EditorTabs.jsx'
import './Editor.css'
import './CharacterEditor.css'

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function PairEditor() {
  const characters = getCharacters()
  const pairs = getPairs()
  const [name, setName] = useState('')
  const [members, setMembers] = useState(['', ''])
  const [filename, setFilename] = useState('meta.json')
  const [copied, setCopied] = useState(false)
  const [loadSlug, setLoadSlug] = useState('')

  const handleLoad = (slug) => {
    setLoadSlug(slug)
    if (!slug) return
    const p = pairs.find((pr) => pr.slug === slug)
    if (!p) return
    setName(p.name || '')
    setMembers(p.characters?.length ? p.characters : ['', ''])
    setFilename('meta.json')
  }

  const updateMember = (i, slug) => {
    const next = members.slice()
    next[i] = slug
    setMembers(next)
  }
  const addMember = () => setMembers([...members, ''])
  const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i))

  const buildJson = () => {
    const data = {}
    if (name) data.name = name
    data.characters = members.filter(Boolean)
    return data
  }

  const handleDownload = () => downloadJson(buildJson(), filename || 'meta.json')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(buildJson(), null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="page">
      <div className="panel editor-page">
        <EditorTabs />
        <p className="editor-help">
          두 캐릭터를 묶은 페어를 만듭니다. 여기서 채우고 다운로드/복사한 <code>meta.json</code>을{' '}
          <code>src/content/pairs/&lt;폴더명&gt;/meta.json</code>에 넣으면 됩니다. 배너로 쓸{' '}
          <code>background.*</code> 이미지는 같은 폴더에 직접 넣어주세요. 캐릭터 목록에 없는
          슬러그를 쓰고 싶으면 직접 타이핑해도 됩니다.
        </p>

        <div className="ce-load">
          <label className="ce-label">기존 페어 불러와서 수정</label>
          <select className="ce-input" value={loadSlug} onChange={(e) => handleLoad(e.target.value)}>
            <option value="">새로 만들기</option>
            {pairs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name || p.slug}
              </option>
            ))}
          </select>
        </div>

        <div className="ce-grid">
          <div className="ce-field ce-field-wide">
            <label className="ce-label">페어 이름</label>
            <input className="ce-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Wildfire" />
          </div>

          <div className="ce-field ce-field-wide">
            <label className="ce-label">캐릭터</label>
            {members.map((slug, i) => (
              <div key={i} className="ce-row">
                <input
                  className="ce-input ce-row-input"
                  list="pair-editor-character-slugs"
                  value={slug}
                  onChange={(e) => updateMember(i, e.target.value)}
                  placeholder="캐릭터 슬러그 (예: beomtaejeong)"
                />
                <button type="button" className="ce-row-remove" onClick={() => removeMember(i)}>
                  ×
                </button>
              </div>
            ))}
            <datalist id="pair-editor-character-slugs">
              {characters.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </datalist>
            <button type="button" className="ce-add" onClick={addMember}>
              + 캐릭터 추가
            </button>
          </div>
        </div>

        <div className="editor-export">
          <input
            className="editor-filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            spellCheck={false}
          />
          <button type="button" className="editor-btn" onClick={handleDownload}>
            다운로드
          </button>
          <button type="button" className="editor-btn" onClick={handleCopy}>
            {copied ? '복사됨!' : 'JSON 복사'}
          </button>
        </div>
      </div>
    </div>
  )
}
