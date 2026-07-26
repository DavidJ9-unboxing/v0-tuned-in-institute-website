'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Triggers the browser print dialog so clinicians can print or save the help
 * sheet as a PDF. Hidden when printing so it never appears on the page.
 */
export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      variant="outline"
      className="gap-2 print:hidden"
    >
      <Printer className="size-4" aria-hidden="true" />
      Print / Save as PDF
    </Button>
  )
}
