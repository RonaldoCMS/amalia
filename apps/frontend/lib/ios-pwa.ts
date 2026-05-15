/** Returns true if running on any iOS device (iPhone, iPad, iPod) */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** Returns the major iOS version number, or null if not on iOS */
export function getIOSVersion(): number | null {
  if (typeof navigator === 'undefined') return null
  const match = navigator.userAgent.match(/OS (\d+)_/)
  return match ? parseInt(match[1], 10) : null
}

/** Returns true if the app is running as an installed PWA (standalone mode) */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  )
}

/** Returns true if Web Push is supported: iOS 16.4+ as a standalone PWA */
export function supportsIOSWebPush(): boolean {
  return isIOS() && (getIOSVersion() ?? 0) >= 16 && isStandalone() && 'PushManager' in window
}

/** Returns true if on iOS Safari browser (not installed as PWA) — prompt to install */
export function isIOSSafariNotPWA(): boolean {
  return isIOS() && !isStandalone()
}
