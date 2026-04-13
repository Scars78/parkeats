import { useState, useEffect } from 'react'
import { FOOD_DATA_FALLBACK, PARKS_FALLBACK } from './data/fallback.js'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const CACHE_KEY = 'parkeats_food_cache_v1'
const CACHE_TIME_KEY = 'parkeats_food_cache_time_v1'

async function fetchSheetData(sheetUrl) {
  const res = await fetch(sheetUrl)
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
  const rows = await res.json()

  const foodData = {}
  const parks = []
  const seenParks = new Set()

  for (const obj of rows) {
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
      isNew: obj.is_new === 'true' || obj.is_new === true,
    })

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
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function load() {
      let cachedData = null
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY)
        if (raw && cacheTime) {
          cachedData = JSON.parse(raw)
          const age = Date.now() - parseInt(cacheTime)
          if (age < CACHE_TTL_MS) {
            setFoodData(cachedData.foodData)
            setParks(cachedData.parks)
            setStatus('cached')
            return
          }
        }
      } catch (_) {}

      if (sheetUrl) {
        try {
          const { foodData: liveFood, parks: liveParkList } = await fetchSheetData(sheetUrl)
          setFoodData(liveFood)
          setParks(liveParkList)
          setStatus('live')
          localStorage.setItem(CACHE_KEY, JSON.stringify({ foodData: liveFood, parks: liveParkList }))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
          return
        } catch (err) {
          console.warn('Could not fetch sheet:', err)
        }
      }

      if (cachedData) {
        setFoodData(cachedData.foodData)
        setParks(cachedData.parks)
        setStatus('cached')
        return
      }

      setFoodData(FOOD_DATA_FALLBACK)
      setParks(PARKS_FALLBACK)
      setStatus('fallback')
    }

    load()
  }, [sheetUrl])

  return { foodData, parks, status }
}
