import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  getOfflineCacheStatus,
  subscribeOfflineCacheStatus,
  type OfflineCacheStatus,
} from './pwa'

export interface OfflineStatus {
  online: boolean
  cacheStatus: OfflineCacheStatus
}

export function useOfflineStatus(): OfflineStatus {
  const cacheStatus = useSyncExternalStore(
    subscribeOfflineCacheStatus,
    getOfflineCacheStatus,
    getOfflineCacheStatus,
  )
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const syncOnlineState = () => setOnline(navigator.onLine)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncOnlineState()
    }
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    window.addEventListener('focus', syncOnlineState)
    window.addEventListener('pageshow', syncOnlineState)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('focus', syncOnlineState)
      window.removeEventListener('pageshow', syncOnlineState)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return { online, cacheStatus }
}
