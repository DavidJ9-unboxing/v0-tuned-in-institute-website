import { put } from '@vercel/blob'

// One-time upload of the "Tuned In" book PDF into the private Blob store.
// Prints the resulting blob URL, which we store as the lesson's fileUrl.
const SOURCE_URL =
  'https://blobs.vusercontent.net/blob/Tuned-In-Book-PDF-CSmKHr2mNpiCx0DpArFCfqv0DeDOvk.pdf'
const PATHNAME = 'tuned-in-parenting-2-12/tuned-in-a-guide-for-parents-of-sensitive-children.pdf'

async function main() {
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`Failed to fetch source PDF: ${res.status} ${res.statusText}`)
  const bytes = Buffer.from(await res.arrayBuffer())
  console.log(`Fetched source PDF: ${(bytes.length / 1024 / 1024).toFixed(2)} MB`)

  const blob = await put(PATHNAME, bytes, {
    access: 'private',
    contentType: 'application/pdf',
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  console.log('\nUploaded to private Blob store.')
  console.log('FILE_URL=' + blob.url)
  console.log('PATHNAME=' + blob.pathname)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
