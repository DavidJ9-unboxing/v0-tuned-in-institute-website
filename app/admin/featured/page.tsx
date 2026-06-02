import { getFeaturedForAdmin, getSectionsWithLessons } from '@/lib/content'
import { FeaturedManager } from '@/components/admin/featured-manager'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturedPage() {
  const [featuredItems, sections] = await Promise.all([
    getFeaturedForAdmin(),
    getSectionsWithLessons(),
  ])

  // Flatten visible lessons into pickable options grouped by section.
  const options = sections
    .filter((s) => !s.hidden)
    .map((s) => ({
      sectionTitle: s.title,
      lessons: s.lessons
        .filter((l) => !l.hidden)
        .map((l) => ({ id: l.id, title: l.title, kind: l.kind })),
    }))
    .filter((g) => g.lessons.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-deep-teal">Featured content</h1>
        <p className="mt-2 max-w-2xl font-sans leading-relaxed text-muted-foreground">
          Choose which library content appears in the &ldquo;Featured&rdquo; section on the public
          resources page. Give each one a custom headline and blurb, and drag the order with the
          arrows. Members deep-link straight to the content; guests are prompted to request access.
        </p>
      </div>
      <FeaturedManager items={featuredItems} options={options} />
    </div>
  )
}
