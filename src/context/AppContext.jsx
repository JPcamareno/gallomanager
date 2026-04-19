// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db, getStats } from '../lib/db'

const AppContext = createContext(null)

export function AppProvider({ userId, children }) {
  const [data, setData] = useState({
    aves: [], jaulas: [], reproducciones: [],
    salud: [], medicamentos: [], ventas: [], alertas: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tables = ['aves', 'jaulas', 'reproducciones', 'salud', 'medicamentos', 'ventas', 'alertas']

  const fetchAll = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const results = await Promise.all(tables.map(t => db.get(t, userId)))
      const newData = {}
      tables.forEach((t, i) => { newData[t] = results[i] })
      setData(newData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const get = useCallback((table) => data[table] || [], [data])
  const find = useCallback((table, id) => (data[table] || []).find(i => i.id === id), [data])

  const add = useCallback(async (table, item) => {
    const newItem = await db.add(table, item, userId)
    setData(prev => ({ ...prev, [table]: [newItem, ...prev[table]] }))
    return newItem
  }, [userId])

  const update = useCallback(async (table, id, updates) => {
    const updated = await db.update(table, id, updates)
    setData(prev => ({
      ...prev,
      [table]: prev[table].map(i => i.id === id ? updated : i)
    }))
    return updated
  }, [])

  const remove = useCallback(async (table, id) => {
    await db.delete(table, id)
    setData(prev => ({ ...prev, [table]: prev[table].filter(i => i.id !== id) }))
  }, [])

  const stats = useCallback(() =>
    getStats(data.aves, data.alertas, data.reproducciones, data.ventas), [data])

  return (
    <AppContext.Provider value={{ get, find, add, update, remove, stats, loading, error, refresh: fetchAll }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
