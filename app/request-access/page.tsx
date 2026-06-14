import { redirect } from 'next/navigation'

// The library is granted directly to Rooted Rhythm and Madrega clients by their
// care team, so there is no public request-access form. Anyone landing here
// (including old links or bookmarks) is sent to sign in.
export default function RequestAccessPage() {
  redirect('/sign-in')
}
