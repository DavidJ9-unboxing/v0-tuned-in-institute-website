import { put } from '@vercel/blob'

// Small CC0 sample clip (~1MB) used only to verify video playback in the library.
const SOURCE = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

const res = await fetch(SOURCE)
if (!res.ok) {
  throw new Error(`Failed to download sample video: ${res.status}`)
}
const bytes = Buffer.from(await res.arrayBuffer())

const blob = await put('test/remi-sample-flower.mp4', bytes, {
  access: 'public',
  contentType: 'video/mp4',
  addRandomSuffix: true,
})

console.log(blob.url)
