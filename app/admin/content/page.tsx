import { getSectionsWithLessons } from '@/lib/content'
import { ContentManager } from '@/components/admin/content-manager'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const sections = await getSectionsWithLessons()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">Content</h1>
        <p className="mt-2 max-w-2xl font-sans leading-relaxed text-muted-foreground">
          Organize your library into collections, then upload videos or write
          articles into each one. Lessons appear to members in the order shown here.
        </p>
      </div>
      <ContentManager sections={sections} />
    </div>
  )
}
