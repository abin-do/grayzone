import { useState } from 'react'
import { getCharacters } from '../lib/content.js'
import EditorTabs from '../components/EditorTabs.jsx'
import './Editor.css'
import './CharacterEditor.css'

const EMPTY = {
  name: '',
  nameKo: '',
  quote: '',
  gender: '',
  height: '',
  weight: '',
  age: '',
  bloodType: '',
  tags: '',
  family: '',
  school: '',
  appearance: '',
  personality: '',
  etc: '',
  secret: '',
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function downloadJson(data, filename) {
  downloadBlob(JSON.stringify(data, null, 2), filename, 'application/json')
}

async function fetchText(url) {
  if (!url) return ''
  const res = await fetch(url)
  return res.text()
}

// A small download/copy pair for one long-text field, exported as its own
// .md file (appearance.md, personality.md, ...) instead of living in the
// JSON - matches what the content pages read.
function MdFieldExport({ text, defaultFilename }) {
  const [copied, setCopied] = useState(false)
  if (!text) return null

  const handleDownload = () => downloadBlob(text, defaultFilename, 'text/markdown')
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="ce-md-export">
      <button type="button" className="ce-md-btn" onClick={handleDownload}>
        {defaultFilename} 다운로드
      </button>
      <button type="button" className="ce-md-btn" onClick={handleCopy}>
        {copied ? '복사됨!' : '복사'}
      </button>
    </div>
  )
}

function ListEditor({ title, rows, fields, onChange, addLabel }) {
  const update = (i, key, value) => {
    const next = rows.slice()
    next[i] = { ...next[i], [key]: value }
    onChange(next)
  }
  const add = () => onChange([...rows, Object.fromEntries(fields.map((f) => [f.key, '']))])
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i))

  return (
    <div className="ce-field">
      <label className="ce-label">{title}</label>
      {rows.map((row, i) => (
        <div key={i} className="ce-row">
          {fields.map((f) => (
            <input
              key={f.key}
              className="ce-input ce-row-input"
              placeholder={f.placeholder}
              value={row[f.key] || ''}
              onChange={(e) => update(i, f.key, e.target.value)}
            />
          ))}
          <button type="button" className="ce-row-remove" onClick={() => remove(i)}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="ce-add" onClick={add}>
        + {addLabel}
      </button>
    </div>
  )
}

export default function CharacterEditor() {
  const characters = getCharacters()
  const [form, setForm] = useState(EMPTY)
  const [stats, setStats] = useState([])
  const [questions, setQuestions] = useState([])
  const [skills, setSkills] = useState([])
  const [filename, setFilename] = useState('meta.json')
  const [copied, setCopied] = useState(false)
  const [loadSlug, setLoadSlug] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleLoad = async (slug) => {
    setLoadSlug(slug)
    if (!slug) return
    const c = characters.find((ch) => ch.slug === slug)
    if (!c) return
    setLoading(true)
    const [appearance, personality, etc, secret] = await Promise.all([
      c.appearanceMdUrl ? fetchText(c.appearanceMdUrl) : c.appearance || '',
      c.personalityMdUrl ? fetchText(c.personalityMdUrl) : c.personality || '',
      c.etcMdUrl ? fetchText(c.etcMdUrl) : c.etc || c.secrets || '',
      c.secretMdUrl ? fetchText(c.secretMdUrl) : c.secret || '',
    ])
    setForm({
      name: c.name || '',
      nameKo: c.nameKo || '',
      quote: c.quote || '',
      gender: c.gender || '',
      height: c.height || '',
      weight: c.weight || '',
      age: c.age || '',
      bloodType: c.bloodType || '',
      tags: (c.tags || []).join(', '),
      family: c.family || '',
      school: c.school || '',
      appearance,
      personality,
      etc,
      secret,
    })
    setStats(c.stats || [])
    setQuestions(c.questions || [])
    setSkills(c.skills || [])
    setFilename('meta.json')
    setLoading(false)
  }

  const buildJson = () => {
    const data = {}
    if (form.name) data.name = form.name
    if (form.nameKo) data.nameKo = form.nameKo
    if (form.quote) data.quote = form.quote
    if (form.gender) data.gender = form.gender
    if (form.height) data.height = form.height
    if (form.weight) data.weight = form.weight
    if (form.age) data.age = form.age
    if (form.bloodType) data.bloodType = form.bloodType
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (tags.length) data.tags = tags
    if (form.family) data.family = form.family
    if (form.school) data.school = form.school
    const cleanStats = stats.filter((s) => s.label || s.value)
    if (cleanStats.length) data.stats = cleanStats
    const cleanQuestions = questions.filter((q) => q.q || q.a)
    if (cleanQuestions.length) data.questions = cleanQuestions
    const cleanSkills = skills.filter((s) => s.name || s.desc)
    if (cleanSkills.length) data.skills = cleanSkills
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
          짧은 정보(이름/프로필/태그/스탯 등)는 아래에서 채우고 맨 아래 "다운로드"로{' '}
          <code>meta.json</code>을 받으세요. 외관 서술/성격/기타사항/비밀설정처럼 긴 글은 각 칸
          아래 버튼으로 <code>.md</code> 파일을 따로 받으세요(마크다운 문법 그대로 씁니다 — 굵게{' '}
          <code>**이렇게**</code>, 목록은 <code>-</code>). 전부 같은 캐릭터
          폴더(<code>src/content/characters/&lt;폴더명&gt;/</code>)에 넣으면 됩니다. 이미지(전신{' '}
          <code>standing.*</code>, SD <code>sd.*</code>, 얼굴 <code>head.*</code>, 목록용{' '}
          <code>portrait.*</code>)도 같은 폴더에 직접 넣어주세요. 두 캐릭터를 한 페어로 묶고
          싶으면 사이드바의 "페어 에디터" 탭을 이용하세요.
        </p>

        <div className="ce-load">
          <label className="ce-label">기존 캐릭터 불러와서 수정</label>
          <select className="ce-input" value={loadSlug} onChange={(e) => handleLoad(e.target.value)}>
            <option value="">새로 만들기</option>
            {characters.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} {c.nameKo ? `(${c.nameKo})` : ''}
              </option>
            ))}
          </select>
          {loading && <span className="ce-load-status">불러오는 중...</span>}
        </div>

        <div className="ce-grid">
          <div className="ce-field">
            <label className="ce-label">이름</label>
            <input className="ce-input" value={form.name} onChange={set('name')} placeholder="Arabella Ashbone" />
          </div>
          <div className="ce-field">
            <label className="ce-label">한글 이름</label>
            <input className="ce-input" value={form.nameKo} onChange={set('nameKo')} placeholder='아라벨라 "벨라" 에이본' />
          </div>
          <div className="ce-field ce-field-wide">
            <label className="ce-label">한마디</label>
            <input className="ce-input" value={form.quote} onChange={set('quote')} placeholder="예쁘게 간직해줄게." />
          </div>

          <div className="ce-field">
            <label className="ce-label">성별</label>
            <input className="ce-input" value={form.gender} onChange={set('gender')} placeholder="여성" />
          </div>
          <div className="ce-field">
            <label className="ce-label">키</label>
            <input className="ce-input" value={form.height} onChange={set('height')} placeholder="175CM" />
          </div>
          <div className="ce-field">
            <label className="ce-label">몸무게</label>
            <input className="ce-input" value={form.weight} onChange={set('weight')} placeholder="54KG" />
          </div>
          <div className="ce-field">
            <label className="ce-label">나이</label>
            <input className="ce-input" value={form.age} onChange={set('age')} placeholder="19세" />
          </div>
          <div className="ce-field">
            <label className="ce-label">혈액형</label>
            <input className="ce-input" value={form.bloodType} onChange={set('bloodType')} placeholder="RH+ AB형" />
          </div>
          <div className="ce-field ce-field-wide">
            <label className="ce-label">성격 태그 (쉼표로 구분)</label>
            <input className="ce-input" value={form.tags} onChange={set('tags')} placeholder="악랄한, 고혹적인, 집착" />
          </div>

          <div className="ce-field">
            <label className="ce-label">가족</label>
            <input className="ce-input" value={form.family} onChange={set('family')} placeholder="가족 미상" />
          </div>
          <div className="ce-field">
            <label className="ce-label">학교/소속</label>
            <input className="ce-input" value={form.school} onChange={set('school')} placeholder="학교의 클럽입니다." />
          </div>

          <div className="ce-field ce-field-wide">
            <label className="ce-label">외관 서술 (마크다운)</label>
            <textarea className="ce-textarea" value={form.appearance} onChange={set('appearance')} rows={4} />
            <MdFieldExport text={form.appearance} defaultFilename="appearance.md" />
          </div>
          <div className="ce-field ce-field-wide">
            <label className="ce-label">성격 (마크다운)</label>
            <textarea className="ce-textarea" value={form.personality} onChange={set('personality')} rows={4} />
            <MdFieldExport text={form.personality} defaultFilename="personality.md" />
          </div>
          <div className="ce-field ce-field-wide">
            <label className="ce-label">기타사항 (마크다운)</label>
            <textarea className="ce-textarea" value={form.etc} onChange={set('etc')} rows={4} />
            <MdFieldExport text={form.etc} defaultFilename="etc.md" />
          </div>
          <div className="ce-field ce-field-wide">
            <label className="ce-label">비밀설정 (마크다운)</label>
            <textarea className="ce-textarea" value={form.secret} onChange={set('secret')} rows={4} />
            <MdFieldExport text={form.secret} defaultFilename="secret.md" />
          </div>

          <div className="ce-field ce-field-wide">
            <ListEditor
              title="스탯"
              rows={stats}
              onChange={setStats}
              addLabel="스탯 추가"
              fields={[
                { key: 'label', placeholder: '항목 (예: STR)' },
                { key: 'value', placeholder: '값 (예: 70)' },
              ]}
            />
          </div>

          <div className="ce-field ce-field-wide">
            <ListEditor
              title="캐릭터 이입 질문"
              rows={questions}
              onChange={setQuestions}
              addLabel="질문 추가"
              fields={[
                { key: 'q', placeholder: '질문' },
                { key: 'a', placeholder: '답변' },
              ]}
            />
          </div>

          <div className="ce-field ce-field-wide">
            <ListEditor
              title="스킬"
              rows={skills}
              onChange={setSkills}
              addLabel="스킬 추가"
              fields={[
                { key: 'name', placeholder: '스킬 이름' },
                { key: 'desc', placeholder: '설명' },
              ]}
            />
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
