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
    window.scrollTo(0, 0)
  }, [])

  return null
}
