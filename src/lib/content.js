// Auto-discovers content placed under src/content/<collection>/<slug>/...
// Drop a new folder in and it shows up here automatically - no registration needed.

function slugOf(path) {
  const parts = path.split('/')
  return parts[parts.length - 2]
}

function byPath(globResult) {
  const map = new Map()
  for (const [path, value] of Object.entries(globResult)) {
    map.set(slugOf(path), value)
  }
  return map
}

function collect(metaGlob, extraGlobs = {}) {
  const metaMap = byPath(metaGlob)
  const extraMaps = Object.fromEntries(
    Object.entries(extraGlobs).map(([key, glob]) => [key, byPath(glob)]),
  )
  return Array.from(metaMap.entries()).map(([slug, meta]) => {
    const entry = { slug, ...meta }
    for (const [key, map] of Object.entries(extraMaps)) {
      entry[key] = map.get(slug) ?? null
    }
    return entry
  })
}

// ---------- Sessions (세션 로그 백업) ----------

const sessionMeta = import.meta.glob('/src/content/sessions/*/meta.json', {
  eager: true,
  import: 'default',
})
const sessionCard = import.meta.glob('/src/content/sessions/*/card.*', {
  eager: true,
  query: '?url',
  import: 'default',
})
// log.html files can be large (exported chat logs with embedded images), so we
// only keep a URL reference here and fetch the actual content on demand -
// otherwise every log.html would get baked into the main JS bundle for every page.
const sessionLog = import.meta.glob('/src/content/sessions/*/log.html', {
  eager: true,
  query: '?url',
  import: 'default',
})
// Optional: synopsis.txt lets you write the synopsis as plain text (real Enter
// key line breaks work) instead of escaping \n inside meta.json.
const sessionSynopsisTxt = import.meta.glob('/src/content/sessions/*/synopsis.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
})

let _sessions = null
export function getSessions() {
  if (!_sessions) {
    _sessions = collect(sessionMeta, { cardUrl: sessionCard, logHtmlUrl: sessionLog }).map(
      (session) => {
        const synopsisTxt = byPath(sessionSynopsisTxt).get(session.slug)
        return synopsisTxt ? { ...session, synopsis: synopsisTxt.trim() } : session
      },
    )
    _sessions.sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
  }
  return _sessions
}

export function getSession(slug) {
  return getSessions().find((s) => s.slug === slug) ?? null
}

// ---------- Narratives (서사 로그 백업) ----------

const narrativeMeta = import.meta.glob('/src/content/narratives/*/meta.json', {
  eager: true,
  import: 'default',
})
const narrativeLog = import.meta.glob('/src/content/narratives/*/log.html', {
  eager: true,
  query: '?url',
  import: 'default',
})
// Just drop an .html file straight into src/content/narratives/ (no folder,
// no meta.json) - the filename becomes both the slug and the title.
const narrativeFlatHtml = import.meta.glob('/src/content/narratives/*.html', {
  eager: true,
  query: '?url',
  import: 'default',
})

let _narratives = null
export function getNarratives() {
  if (!_narratives) {
    const folders = collect(narrativeMeta, { logHtmlUrl: narrativeLog })
    const flat = Object.entries(narrativeFlatHtml).map(([path, url]) => {
      const slug = path.split('/').pop().replace(/\.html$/, '')
      return { slug, title: slug, logHtmlUrl: url }
    })
    _narratives = [...folders, ...flat]
    _narratives.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }
  return _narratives
}

export function getNarrative(slug) {
  return getNarratives().find((n) => n.slug === slug) ?? null
}

// ---------- Log entries (개별 기록 / 블로그 글) ----------
// Linked to from inside narrative/session dialogue (e.g. <a href="#/log/01">),
// not from the sidebar - src/content/log/<id>/{meta.json, log.txt}.

const logMeta = import.meta.glob('/src/content/log/*/meta.json', {
  eager: true,
  import: 'default',
})
const logText = import.meta.glob('/src/content/log/*/log.txt', {
  eager: true,
  query: '?url',
  import: 'default',
})

let _logEntries = null
export function getLogEntries() {
  if (!_logEntries) {
    _logEntries = collect(logMeta, { textUrl: logText })
  }
  return _logEntries
}

export function getLogEntry(slug) {
  return getLogEntries().find((l) => l.slug === slug) ?? null
}

// ---------- Characters (캐릭터 백업) ----------

const characterMeta = import.meta.glob('/src/content/characters/*/meta.json', {
  eager: true,
  import: 'default',
})
const characterPortrait = import.meta.glob('/src/content/characters/*/portrait.*', {
  eager: true,
  query: '?url',
  import: 'default',
})
const characterStanding = import.meta.glob('/src/content/characters/*/standing.*', {
  eager: true,
  query: '?url',
  import: 'default',
})

let _characters = null
export function getCharacters() {
  if (!_characters) {
    _characters = collect(characterMeta, {
      portraitUrl: characterPortrait,
      standingUrl: characterStanding,
    })
  }
  return _characters
}

export function getCharacter(slug) {
  return getCharacters().find((c) => c.slug === slug) ?? null
}

export function findCharacterByName(name) {
  if (!name) return null
  const target = name.trim().toLowerCase()
  return getCharacters().find((c) => (c.name || '').trim().toLowerCase() === target) ?? null
}

// ---------- Gallery (커미션/이미지 백업) ----------

const galleryMeta = import.meta.glob('/src/content/gallery/*/meta.json', {
  eager: true,
  import: 'default',
})
const galleryImage = import.meta.glob('/src/content/gallery/*/image.*', {
  eager: true,
  query: '?url',
  import: 'default',
})

// Just drop image files straight into src/content/gallery/img/ - no meta.json needed.
// Extensions are listed in both cases since phone/camera exports often use
// uppercase (e.g. IMG_1234.JPG).
const galleryDropFolder = import.meta.glob(
  '/src/content/gallery/img/*.{png,PNG,jpg,JPG,jpeg,JPEG,gif,GIF,webp,WEBP,avif,AVIF,svg,SVG}',
  { eager: true, query: '?url', import: 'default' },
)

function filenameSlug(path) {
  return 'img-' + path.split('/').pop().replace(/\.[^.]+$/, '')
}

let _gallery = null
export function getGalleryItems() {
  if (!_gallery) {
    const structured = collect(galleryMeta, { imageUrl: galleryImage }).sort((a, b) =>
      (b.date || '').localeCompare(a.date || ''),
    )
    const dropped = Object.entries(galleryDropFolder)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([path, imageUrl]) => ({ slug: filenameSlug(path), imageUrl }))
    _gallery = [...dropped, ...structured]
  }
  return _gallery
}
