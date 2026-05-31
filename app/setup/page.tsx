import Link from 'next/link'
import { adminExists } from './actions'
import { SetupForm } from '@/components/auth/setup-form'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  const exists = await adminExists()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-semibold text-deep-teal">
            {exists ? 'Setup complete' : 'Create your admin account'}
          </h1>
          <p className="mt-2 font-sans leading-relaxed text-muted-foreground">
            {exists
              ? 'An administrator already exists for this site.'
              : 'This is a one-time step to create the first administrator. After this, new accounts are created from the admin panel.'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {exists ? (
            <Link
              href="/sign-in"
              className="block text-center font-sans font-semibold text-deep-teal hover:underline"
            >
              Go to sign in
            </Link>
          ) : (
            <SetupForm />
          )}
        </div>
      </div>
    </main>
  )
}
