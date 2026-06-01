import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  // Gate the entire /library segment — redirects guests to /sign-in.
  const user = await requireUser()
  // Force first-time users (admin-created accounts on a shared temporary
  // password) to choose their own password before browsing the library.
  if (user.mustChangePassword) redirect('/change-password')
  return <div className="min-h-[80vh] bg-off-white">{children}</div>
}
