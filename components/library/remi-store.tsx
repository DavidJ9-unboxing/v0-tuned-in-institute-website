'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Chat, useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useSession } from '@/lib/auth-client'

// One shared conversation across every Remi surface (the library page chat and the
// slide-over panel). Without this, each surface kept its own in-memory useChat state,
// so navigating away or opening the panel started a brand-new, empty conversation.

// Per-tab mirror: keeps the conversation alive across navigation and refresh within a
// single visit. Cleared automatically when the tab closes.
const SESSION_KEY = 'remi-chat-session-v1'
// Device-level opt-in flag ("remember my conversations on this device").
const REMEMBER_KEY = 'remi-chat-remember-v1'
// Persistent per-user copy, only written when the member opts in. Scoped by user id so
// a shared browser doesn't surface one member's chat to another.
const SAVED_PREFIX = 'remi-chat-saved-v1:'

function savedKey(userId: string) {
  return `${SAVED_PREFIX}${userId}`
}

type RemiStoreValue = {
  /** The shared chat instance — pass to useChat({ chat }) on every surface. */
  chat: Chat<UIMessage>
  /** Whether the member has opted in to remembering chats on this device. */
  remember: boolean
  setRemember: (value: boolean) => void
  /** Wipe the current conversation and any stored copies. */
  clearChat: () => void
}

const RemiStoreContext = createContext<RemiStoreValue | null>(null)

export function useRemiStore() {
  const ctx = useContext(RemiStoreContext)
  if (!ctx) {
    throw new Error('useRemiStore must be used within <RemiStoreProvider>')
  }
  return ctx
}

export function RemiStoreProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  // Created once and kept stable for the life of the app so every surface shares it.
  const [chat] = useState(
    () =>
      new Chat<UIMessage>({
        transport: new DefaultChatTransport({ api: '/api/library/remi' }),
      }),
  )

  const [remember, setRememberState] = useState(false)

  // Load the saved opt-in preference on mount (client only).
  useEffect(() => {
    try {
      setRememberState(localStorage.getItem(REMEMBER_KEY) === '1')
    } catch {
      // Ignore storage access errors (private mode, disabled storage, etc.).
    }
  }, [])

  const clearChat = useCallback(() => {
    // The Chat instance exposes a messages setter that notifies all subscribers.
    chat.messages = []
    try {
      sessionStorage.removeItem(SESSION_KEY)
      if (userId) localStorage.removeItem(savedKey(userId))
    } catch {
      // Ignore storage errors.
    }
  }, [chat, userId])

  const setRemember = useCallback(
    (value: boolean) => {
      setRememberState(value)
      try {
        localStorage.setItem(REMEMBER_KEY, value ? '1' : '0')
        if (value) {
          // Opting in: persist whatever's already on screen right away.
          if (userId && chat.messages.length > 0) {
            localStorage.setItem(savedKey(userId), JSON.stringify(chat.messages))
          }
        } else if (userId) {
          // Opting out ("forget"): drop the saved copy but keep the current visit going.
          localStorage.removeItem(savedKey(userId))
        }
      } catch {
        // Ignore storage errors.
      }
    },
    [chat, userId],
  )

  const value = useMemo(
    () => ({ chat, remember, setRemember, clearChat }),
    [chat, remember, setRemember, clearChat],
  )

  return (
    <RemiStoreContext.Provider value={value}>
      {children}
      {/* Isolated so per-token streaming re-renders never touch the app subtree. */}
      <RemiPersistence chat={chat} remember={remember} userId={userId} />
    </RemiStoreContext.Provider>
  )
}

/**
 * Headless companion that subscribes to the shared conversation and mirrors it to
 * storage. It lives as a sibling of {children} so its frequent re-renders (one per
 * streamed token) don't re-render the whole application.
 */
function RemiPersistence({
  chat,
  remember,
  userId,
}: {
  chat: Chat<UIMessage>
  remember: boolean
  userId: string | null
}) {
  const { messages, setMessages } = useChat({ chat })
  const [hydrated, setHydrated] = useState(false)
  const restoredFromSaved = useRef(false)

  // Restore the per-tab mirror once on mount so navigating within a visit keeps the chat.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored && chat.messages.length === 0) {
        const parsed = JSON.parse(stored) as UIMessage[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch {
      // Ignore parse/storage errors and start fresh.
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Restore the saved per-user copy on a fresh visit, once we know who's signed in and
  // that they opted in. Only runs when there's nothing already on screen.
  useEffect(() => {
    if (!hydrated || restoredFromSaved.current) return
    if (!remember || !userId || chat.messages.length > 0) return
    try {
      const stored = localStorage.getItem(savedKey(userId))
      if (stored) {
        const parsed = JSON.parse(stored) as UIMessage[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          restoredFromSaved.current = true
        }
      }
    } catch {
      // Ignore parse/storage errors.
    }
  }, [hydrated, remember, userId, chat, setMessages])

  // Mirror the live conversation to storage. We only ever write here — clearing is
  // explicit (clearChat / opting out) so there are no races that could wipe a restore.
  useEffect(() => {
    if (!hydrated || messages.length === 0) return
    try {
      const serialized = JSON.stringify(messages)
      sessionStorage.setItem(SESSION_KEY, serialized)
      if (remember && userId) {
        localStorage.setItem(savedKey(userId), serialized)
      }
    } catch {
      // Ignore quota/storage errors.
    }
  }, [messages, remember, userId, hydrated])

  return null
}
