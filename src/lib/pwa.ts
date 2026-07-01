export type OfflineCacheStatus = 'checking' | 'ready' | 'unsupported' | 'error'

const listeners = new Set<() => void>()
let cacheStatus: OfflineCacheStatus = import.meta.env.PROD ? 'checking' : 'ready'

function setCacheStatus(next: OfflineCacheStatus): void {
  if (cacheStatus === next) return
  cacheStatus = next
  listeners.forEach((listener) => listener())
}

export function getOfflineCacheStatus(): OfflineCacheStatus {
  return cacheStatus
}

export function subscribeOfflineCacheStatus(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) {
    setCacheStatus('unsupported')
    return
  }

  if (navigator.serviceWorker.controller) setCacheStatus('ready')

  const register = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        // ready 只表示缓存安装完成；必须已经控制当前页面，断网重载才真正可靠。
        if (navigator.serviceWorker.controller) setCacheStatus('ready')
      })
      .catch(() => {
        // 无痕模式或浏览器禁用 Service Worker 时保持应用正常运行。
        setCacheStatus('error')
      })
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    setCacheStatus('ready')
  })

  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}
