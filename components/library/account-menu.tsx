'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ChevronDown, Shield, KeyRound, Settings } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AccountMenu({
  name,
  email,
  isAdmin,
}: {
  name: string
  email: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function signOut() {
    setPending(true)
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex shrink-0 items-center gap-2 rounded-full border border-stone bg-card p-1 font-sans text-sm font-medium text-charcoal transition-colors hover:border-deep-teal/40 sm:px-2 sm:py-1.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-deep-teal font-sans text-xs font-semibold text-off-white">
          {initials || 'U'}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
        <ChevronDown className="hidden size-4 text-charcoal/50 sm:block" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-sans">
          <p className="truncate text-sm font-semibold text-charcoal">{name}</p>
          <p className="truncate text-xs font-normal text-charcoal/60">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer font-sans">
              <Shield className="size-4" aria-hidden="true" />
              Admin dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer font-sans">
            <Settings className="size-4" aria-hidden="true" />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/password" className="cursor-pointer font-sans">
            <KeyRound className="size-4" aria-hidden="true" />
            Change password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            if (!pending) signOut()
          }}
          className="cursor-pointer font-sans text-red-700 focus:text-red-700"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {pending ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
