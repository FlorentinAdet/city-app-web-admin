const stripDiacritics = (value) => {
  try {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  } catch {
    return value
  }
}

export const normalizeText = (value) => {
  if (value == null) return ''
  return stripDiacritics(String(value)).toLowerCase().trim()
}

export const textIncludes = (haystack, needle) => {
  const h = normalizeText(haystack)
  const n = normalizeText(needle)
  if (!n) return true
  return h.includes(n)
}

const parseDateInputStart = (yyyyMmDd) => {
  if (!yyyyMmDd) return null
  const dt = new Date(`${yyyyMmDd}T00:00:00`)
  const ms = dt.getTime()
  return Number.isNaN(ms) ? null : ms
}

const parseDateInputEnd = (yyyyMmDd) => {
  if (!yyyyMmDd) return null
  const dt = new Date(`${yyyyMmDd}T23:59:59.999`)
  const ms = dt.getTime()
  return Number.isNaN(ms) ? null : ms
}

export const dateInRange = (dateValue, from, to) => {
  if (!from && !to) return true
  if (!dateValue) return false

  const ms = new Date(dateValue).getTime()
  if (Number.isNaN(ms)) return false

  const fromMs = parseDateInputStart(from)
  const toMs = parseDateInputEnd(to)

  if (fromMs != null && ms < fromMs) return false
  if (toMs != null && ms > toMs) return false
  return true
}

export const filterAndSort = ({
  items,
  query,
  dateFrom,
  dateTo,
  sort,
  getText,
  getDate,
  getTitle
}) => {
  const list = Array.isArray(items) ? [...items] : []

  const filtered = list.filter((item) => {
    const matchQuery = textIncludes(getText?.(item) ?? '', query)
    const matchDate = dateInRange(getDate?.(item), dateFrom, dateTo)
    return matchQuery && matchDate
  })

  const titleOf = (item) => normalizeText(getTitle?.(item) ?? '')
  const dateMsOf = (item) => {
    const v = getDate?.(item)
    const ms = v ? new Date(v).getTime() : 0
    return Number.isNaN(ms) ? 0 : ms
  }

  filtered.sort((a, b) => {
    switch (sort) {
      case 'alpha_asc':
        return titleOf(a).localeCompare(titleOf(b), 'fr', { sensitivity: 'base' })
      case 'alpha_desc':
        return titleOf(b).localeCompare(titleOf(a), 'fr', { sensitivity: 'base' })
      case 'date_asc':
        return dateMsOf(a) - dateMsOf(b)
      case 'date_desc':
      default:
        return dateMsOf(b) - dateMsOf(a)
    }
  })

  return filtered
}
