export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 无痕模式或浏览器禁用 Service Worker 时保持应用正常运行。
    })
  }

  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}
