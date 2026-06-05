'use client'

import { useEffect } from 'react'

/**
 * Ensures the home page always opens scrolled to the very top.
 *
 * Browsers restore the previous scroll position when a visitor reloads or
 * returns to the site, which can drop people partway down the page. Mounting
 * this on the home page resets the scroll to the top once on load. It's scoped
 * to the home page so normal back-button scroll restoration is preserved on
 * other routes (e.g. returning to a scroll position in the library).
 */
export function ScrollToTopOnLoad() {
  useEffect(() => {
    const history = window.history
    const previous = history.scrollRestoration

    // Stop the browser from re-applying the last scroll position while the home
    // page is open. Without this, native restoration can fire after our reset
    // and drop the visitor back down the page.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    const toTop = () => window.scrollTo(0, 0)

    // Reset immediately on mount...
    toTop()

    // ...and again on `pageshow`, which also covers returning to the page from
    // the bfcache (reopening the tab or pressing back), when React doesn't
    // remount and the effect above wouldn't otherwise run.
    window.addEventListener('pageshow', toTop)

    return () => {
      window.removeEventListener('pageshow', toTop)
      if ('scrollRestoration' in history) {
        history.scrollRestoration = previous
      }
    }
  }, [])

  return null
}
