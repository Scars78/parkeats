import { useState, useEffect } from 'react'

const KEY = 'parkeats_tracker_v1'

export function useTracker() {
  const [eaten, setEaten] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // Persist every change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(eaten))
    } catch (e) {
      console.warn('Could not save to localStorage', e)
    }
  }, [eaten])

  const logItem = (foodId, parkId, rating, note) => {
    setEaten(prev => ({
      ...prev,
      [foodId]: {
        parkId,
        rating,
        note,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        })
      }
    }))
  }

  const removeItem = (foodId) => {
    setEaten(prev => {
      const next = { ...prev }
      delete next[foodId]
      return next
    })
  }

  return { eaten, logItem, removeItem }
}
