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
// not from the sidebar - src/content/log/<id>/{meta.json, log.txt or log.html}.

const logMeta = import.meta.glob('/src/content/log/*/meta.json', {
  eager: true,
  import: 'default',
})
const logText = import.meta.glob('/src/content/log/*/log.txt', {
  eager: true,
  query: '?url',
  import: 'default',
})
// log.html (e.g. exported from the built-in /editor) takes priority over
// log.txt when both exist.
const logHtml = import.meta.glob('/src/content/log/*/log.html', {
  eager: true,
  query: '?url',
  import: 'default',
})

let _logEntries = null
export function getLogEntries() {
  if (!_logEntries) {
    _logEntries = collect(logMeta, { textUrl: logText, htmlUrl: logHtml }).sort((a, b) =>
      a.slug.localeCompare(b.slug, undefined, { numeric: true }),
    )
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
// Optional: bio.html (e.g. exported from /editor) takes priority over the
// plain "bio" string in meta.json when present.
const characterBioHtml = import.meta.glob('/src/content/characters/*/bio.html', {
  eager: true,
  query: '?url',
  import: 'default',
})
const characterSd = import.meta.glob('/src/content/characters/*/sd.*', {
  eager: true,
  query: '?url',
  import: 'default',
})
const characterHead = import.meta.glob('/src/content/characters/*/head.*', {
  eager: true,
  query: '?url',
  import: 'default',
})
// Long-form fields can be written as markdown files instead of cramming them
// into meta.json as escaped strings - if the file exists, it wins.
const characterAppearanceMd = import.meta.glob('/src/content/characters/*/appearance.md', {
  eager: true,
  query: '?url',
  import: 'default',
})
const characterPersonalityMd = import.meta.glob('/src/content/characters/*/personality.md', {
  eager: true,
  query: '?url',
  import: 'default',
})
const characterEtcMd = import.meta.glob('/src/content/characters/*/etc.md', {
  eager: true,
  query: '?url',
  import: 'default',
})
const characterSecretMd = import.meta.glob('/src/content/characters/*/secret.md', {
  eager: true,
  query: '?url',
  import: 'default',
})

let _characters = null
function loadCharacters() {
  if (!_characters) {
    const withoutPair = collect(characterMeta, {
      portraitUrl: characterPortrait,
      standingUrl: characterStanding,
      bioHtmlUrl: characterBioHtml,
      sdUrl: characterSd,
      headUrl: characterHead,
      appearanceMdUrl: characterAppearanceMd,
      personalityMdUrl: characterPersonalityMd,
      etcMdUrl: characterEtcMd,
      secretMdUrl: characterSecretMd,
    })
    // Cross-reference pairs so each character knows its pair + partner.
    const bySlug = new Map(withoutPair.map((c) => [c.slug, c]))
    for (const pair of getPairs()) {
      for (const slug of pair.characters || []) {
        const c = bySlug.get(slug)
        if (c) {
          c.pairSlug = pair.slug
          c.partnerSlug = pair.characters.find((s) => s !== slug) ?? null
        }
      }
    }
    _characters = withoutPair
  }
  return _characters
}

export function getCharacters() {
  return loadCharacters()
}

export function getCharacter(slug) {
  return getCharacters().find((c) => c.slug === slug) ?? null
}

export function findCharacterByName(name) {
  if (!name) return null
  const target = name.trim().toLowerCase()
  return (
    getCharacters().find(
      (c) =>
        (c.name || '').trim().toLowerCase() === target ||
        (c.nameKo || '').trim().toLowerCase() === target,
    ) ?? null
  )
}

// ---------- Character pairs (캐릭터 페어) ----------
// A pair groups two characters under one shared banner - src/content/pairs/<slug>/.

const pairMeta = import.meta.glob('/src/content/pairs/*/meta.json', {
  eager: true,
  import: 'default',
})
const pairBackground = import.meta.glob('/src/content/pairs/*/background.*', {
  eager: true,
  query: '?url',
  import: 'default',
})

let _pairs = null
export function getPairs() {
  if (!_pairs) {
    _pairs = collect(pairMeta, { backgroundUrl: pairBackground })
  }
  return _pairs
}

export function getPair(slug) {
  return getPairs().find((p) => p.slug === slug) ?? null
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
