import { useEffect, useRef, useState } from 'react'
import EditorTabs from '../components/EditorTabs.jsx'
import './Editor.css'

function downloadHtml(html, filename) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Editor() {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [filename, setFilename] = useState('log.html')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Makes Enter produce <p> tags consistently instead of <div>/<br> - the
    // exact markup our content pages expect (a paragraph per <p>).
    document.execCommand('defaultParagraphSeparator', false, 'p')
  }, [])

  const format = (command) => {
    editorRef.current.focus()
    document.execCommand(command)
  }

  const handleDownload = () => {
    downloadHtml(editorRef.current.innerHTML, filename || 'log.html')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorRef.current.innerHTML)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      editorRef.current.innerHTML = text
    })
    e.target.value = ''
  }

  return (
    <div className="page">
      <div className="panel editor-page">
        <EditorTabs />

        <p className="editor-help">
          여기서 편하게 글을 쓰고 "다운로드"나 "복사"로 HTML을 받아서, 세션/서사/기록 폴더의{' '}
          <code>log.html</code>로 저장하면 됩니다.
        </p>

        <div className="editor-toolbar">
          <button type="button" onClick={() => format('bold')} title="굵게">
            <b>B</b>
          </button>
          <button type="button" onClick={() => format('italic')} title="기울임">
            <i>I</i>
          </button>
          <button type="button" onClick={() => format('underline')} title="밑줄">
            <u>U</u>
          </button>
          <span className="editor-toolbar-sep" />
          <button type="button" onClick={handleImportClick} title="기존 log.html 불러오기">
            불러오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,text/html"
            onChange={handleImportFile}
            hidden
          />
        </div>

        <div
          ref={editorRef}
          className="editor-surface"
          contentEditable
          suppressContentEditableWarning
        >
          <p>여기에 글을 쓰세요...</p>
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
            {copied ? '복사됨!' : 'HTML 복사'}
          </button>
        </div>
      </div>
    </div>
  )
}
