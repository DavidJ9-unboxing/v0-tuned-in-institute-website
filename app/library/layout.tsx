import { requireUser } from '@/lib/session'

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  // Gate the entire /library segment — redirects guests to /sign-in.
  await requireUser()
  return <div className="min-h-[80vh] bg-off-white">{children}</div>
}
