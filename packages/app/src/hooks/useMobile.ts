import * as React from "react"
import { useDebounce } from "@/lib/debounce"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  const updateIsMobile = React.useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  }, [])

  // Debounce the media query change handler (100ms delay for responsive checks)
  const debouncedUpdateIsMobile = useDebounce(updateIsMobile, 100)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Set initial value immediately
    updateIsMobile()
    
    // Use debounced handler for changes
    mql.addEventListener("change", debouncedUpdateIsMobile)
    
    return () => mql.removeEventListener("change", debouncedUpdateIsMobile)
  }, [updateIsMobile, debouncedUpdateIsMobile])

  return !!isMobile
}
