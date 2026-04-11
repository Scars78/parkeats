import { useState, useEffect } from 'react'

// How long to use cached data before re-fetching (6 hours)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const CACHE_KEY = 'parkeats_food_cache_v1'
const CACHE_TIME_KEY = 'parkeats_food_cache_time_v1'

// Fallback: used if fetch fails AND no cache exists
import { FOOD_DATA_FALLBACK, PARKS_FALLBACK } from './data/fallback.js'

/**
 * Converts a Google Sheets "publish to web" CSV URL into structured food data.
 *
 * Expected sheet columns (row 1 = headers):
 *   park_id | food_id | name | section | price | category | description | is_new
 *
 * @param {string} sheetUrl - The Google Sheets CSV export URL
 */
async function fetchSheetData(sheetUrl) {
  const res = await fetch(sheetUrl)
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
  const csv = await res.text()

  const rows = csv.trim().split('\n').map(row =>
    row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
  )

  // Skip header row
  const headers = rows[0]
  const dataRows = rows.slice(1)

  const foodData = {}
  const parks = []
  const seenParks = new Set()

  for (const row of dataRows) {
    if (!row[0]) continue // skip empty rows

    const obj = {}
    headers.forEach((h, i) => { obj[h.trim()] = row[i] || '' })

    const parkId = obj.park_id
    const foodId = parseInt(obj.food_id)

    if (!parkId || !foodId) continue

    if (!foodData[parkId]) foodData[parkId] = []

    foodData[parkId].push({
      id: foodId,
      name: obj.name,
      section: obj.section,
      price: obj.price,
      category: obj.category,
      description: obj.description,
      isNew: obj.is_new?.toLowerCase() === 'true' || obj.is_new === '1',
    })

    // Build parks list from sheet data
    if (!seenParks.has(parkId) && obj.team && obj.park && obj.city) {
      seenParks.add(parkId)
      parks.push({
        id: parkId,
        team: obj.team,
        park: obj.park,
        city: obj.city,
      })
    }
  }

  return { foodData, parks }
}

export function useFoodData(sheetUrl) {
  const [foodData, setFoodData] = useState(null)
  const [parks, setParks] = useState(null)
  const [status, setStatus] = useState('loading') // loading | live | cached | fallback

  useEffect(() => {
    async function load() {
      // 1. Load cache immediately so the app is usable right away
      let cachedData = null
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY)
        if (raw && cacheTime) {
          cachedData = JSON.parse(raw)
          const age = Date.now() - parseInt(cacheTime)
          if (age < CACHE_TTL_MS) {
            // Cache is fresh — use it and don't bother fetching
            setFoodData(cachedData.foodData)
            setParks(cachedData.parks)
            setStatus('cached')
            return
          }
        }
      } catch (_) {}

      // 2. Try fetching live data from Google Sheets
      if (sheetUrl) {
        try {
          const { foodData: liveFood, parks: liveParkList } = await fetchSheetData(sheetUrl)
          setFoodData(liveFood)
          setParks(liveParkList)
          setStatus('live')
          // Save to cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({ foodData: liveFood, parks: liveParkList }))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
          return
        } catch (err) {
          console.warn('Could not fetch sheet, using fallback:', err)
        }
      }

      // 3. Use stale cache if fetch failed
      if (cachedData) {
        setFoodData(cachedData.foodData)
        setParks(cachedData.parks)
        setStatus('cached')
        return
      }

      // 4. Last resort: use hardcoded fallback data
      setFoodData(FOOD_DATA_FALLBACK)
      setParks(PARKS_FALLBACK)
      setStatus('fallback')
    }

    load()
  }, [sheetUrl])

  return { foodData, parks, status }
}
