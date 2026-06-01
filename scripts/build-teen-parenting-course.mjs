// One-off: build the "Tuned in Parenting for Teens (12-18)" course (section 11).
//
// - Copies each slideshow / companion-guide PDF from its temporary upload URL
//   into the project's permanent Blob store.
// - Builds the full ordered lesson list: a video lesson before each module's
//   slides, with the printable Companion Guide at the very top.
// - Keeps the two video lessons that already exist (Introduction #130 and
//   Module 1 #144) and slots the new content around them.
//
// Idempotent: re-running deletes the lessons it previously created (everything
// in the section except the two kept embeds) and rebuilds them.

import { neon } from '@neondatabase/serverless'
import { put } from '@vercel/blob'

const sql = neon(process.env.DATABASE_URL)

const SECTION_ID = 11
const KEEP_INTRO_VIDEO = 130 // existing embed: "Introduction"
const KEEP_MODULE1_VIDEO = 144 // existing embed: "Understanding Your Highly Sensitive Teen"

// Temporary source URLs for the uploaded PDFs.
const PDF = {
  companion:
    'https://blobs.vusercontent.net/blob/Tuned%20In%20For%20Teens%20Companion%20Guide-zJfuPolIDsaFicX64eLsgQ2121ER2S.pdf',
  intro:
    'https://blobs.vusercontent.net/blob/INTRO-Tuned-In-Parenting-for-Sensitive-Teens-WeVfIHVSZA4GYByvva3bpxMsGguDBj.pdf',
  m1: 'https://blobs.vusercontent.net/blob/module%201-%20TUNED-IN-TEEN-PARENITNG-1-Your-Sensitive-Teen-Is-Not-Your-Sensitive-Child-Anymore-RfDu6pWB6PTWCqTQkvxfeHvfPfQSjq.pdf',
  m2: 'https://blobs.vusercontent.net/blob/Module%202%20-%20The-Adolescent-Brain-and-Nervous-System-on-Fire%20%281%29-ojmmbaW76iK82VevUGek7H0oih19Wp.pdf',
  m3: 'https://blobs.vusercontent.net/blob/module%203%20teen%20parenting-mSS4HGmseB5OFqDoSRaA4i3mnCh8Xj.pdf',
  m4: 'https://blobs.vusercontent.net/blob/Module-4-Knowing-Your-Sensitive-Teen-The-DOES-Framework-1YYQqKENDDvbpetVO20pupHp0U7tYd.pdf',
  m5: 'https://blobs.vusercontent.net/blob/module%205%20-%20Shame-Identity-and-the-Teen-Years-UqhSKBspHyTnqzyend4kMB2wUSlWvL.pdf',
  m6: 'https://blobs.vusercontent.net/blob/Module%206%20-%20Loving-Boundaries-with-a-Teenager-OMsxjcqXBcMvR3qXrp334yT0d7u0k9.pdf',
  m7: 'https://blobs.vusercontent.net/blob/module%207%20-%20Connection-Across-the-Disconnection%20%281%29-6B6bX4sBOpyWs9bazCSt6e4XRPypEJ.pdf',
  m8: 'https://blobs.vusercontent.net/blob/Module-8-The-Sensitive-Teen-at-School-and-in-the-World-gtinBuaprcSMKYNjwHVB0U4RWwkNfY.pdf',
  m9: 'https://blobs.vusercontent.net/blob/Module%209%20-%20Building-Your-Village-and-Theirs-7VbfwIZIK8j6f8yBlLDIkPQ4B1jlhn.pdf',
  m10: 'https://blobs.vusercontent.net/blob/Raising-a-Thriving-Sensitive-Teen%20%281%29-KOzCaibouGEvNqA50Mkk62zbqRpzGA.pdf',
}

// Vimeo links for the module videos (Intro + Module 1 already live in the DB).
const VIDEO = {
  m2a: 'https://vimeo.com/1197223040/513ff0d22d',
  m2b: 'https://vimeo.com/1197223352/0ea75948c9',
  m3: 'https://vimeo.com/1197223389',
  m4: 'https://vimeo.com/1197223436/a0c5efacca',
  m5: 'https://vimeo.com/1197223476/ce362e0e72',
  m6: 'https://vimeo.com/1197223860/6d5b49f7c8',
  m7: 'https://vimeo.com/1197223955/0496fca80e',
  m8: 'https://vimeo.com/1197224122/f424fa8370',
  m9: 'https://vimeo.com/1197224152/54bac179cb',
  m10: 'https://vimeo.com/1197224192/1fa6493c89',
}

async function uploadPdf(sourceUrl, destName) {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Failed to fetch ${destName}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const blob = await put(`teen-parenting-course/${destName}`, buf, {
    // The store is private; files are served to members via the authenticated
    // /api/library/file proxy, which signs short-lived URLs.
    access: 'private',
    contentType: 'application/pdf',
    addRandomSuffix: true,
  })
  console.log(`  uploaded ${destName} (${(buf.length / 1024).toFixed(0)} KB)`)
  return blob.url
}

async function main() {
  console.log('Uploading PDFs to permanent Blob storage…')
  const urls = {}
  for (const [key, src] of Object.entries(PDF)) {
    urls[key] = await uploadPdf(src, `${key}.pdf`)
  }

  console.log('Clearing previously-generated lessons (keeping the two existing videos)…')
  await sql`
    delete from lesson
    where "sectionId" = ${SECTION_ID}
      and id not in (${KEEP_INTRO_VIDEO}, ${KEEP_MODULE1_VIDEO})
  `

  // Define the full ordered list. Existing rows are referenced by id; new rows
  // carry their full payload.
  const plan = [
    { existing: null, kind: 'document', title: 'Companion Guide (Printable) — Tuned In Parenting for Sensitive Teens', description: 'A printable 10-module written guide to read alongside the course.', fileUrl: urls.companion, fileName: 'Tuned-In-Parenting-for-Sensitive-Teens-Companion-Guide.pdf' },

    { existing: KEEP_INTRO_VIDEO },
    { existing: null, kind: 'document', title: 'Introduction — Slides', description: 'Slides for the course introduction.', fileUrl: urls.intro, fileName: 'Introduction-Tuned-In-Parenting-for-Sensitive-Teens.pdf' },

    { existing: KEEP_MODULE1_VIDEO },
    { existing: null, kind: 'document', title: 'Module 1 Slides — Your Sensitive Teen Is Not Your Sensitive Child Anymore', description: 'Slides for Module 1.', fileUrl: urls.m1, fileName: 'Module-1-Your-Sensitive-Teen-Is-Not-Your-Sensitive-Child-Anymore.pdf' },

    { existing: null, kind: 'embed', title: 'Module 2 Video — Part A: The Adolescent Brain & Nervous System on Fire', description: 'Module 2 video, part A of 2.', externalUrl: VIDEO.m2a },
    { existing: null, kind: 'embed', title: 'Module 2 Video — Part B: The Adolescent Brain & Nervous System on Fire', description: 'Module 2 video, part B of 2.', externalUrl: VIDEO.m2b },
    { existing: null, kind: 'document', title: 'Module 2 Slides — The Adolescent Brain & Nervous System on Fire', description: 'Slides for Module 2.', fileUrl: urls.m2, fileName: 'Module-2-The-Adolescent-Brain-and-Nervous-System-on-Fire.pdf' },

    { existing: null, kind: 'embed', title: 'Module 3 Video — Who You Are as the Parent of a Teenager', description: 'Module 3 video.', externalUrl: VIDEO.m3 },
    { existing: null, kind: 'document', title: 'Module 3 Slides — Who You Are as the Parent of a Teenager', description: 'Slides for Module 3.', fileUrl: urls.m3, fileName: 'Module-3-Who-You-Are-as-the-Parent-of-a-Teenager.pdf' },

    { existing: null, kind: 'embed', title: 'Module 4 Video — Knowing Your Sensitive Teen: The DOES Framework', description: 'Module 4 video.', externalUrl: VIDEO.m4 },
    { existing: null, kind: 'document', title: 'Module 4 Slides — Knowing Your Sensitive Teen: The DOES Framework', description: 'Slides for Module 4.', fileUrl: urls.m4, fileName: 'Module-4-Knowing-Your-Sensitive-Teen-The-DOES-Framework.pdf' },

    { existing: null, kind: 'embed', title: 'Module 5 Video — Shame, Identity & the Teen Years', description: 'Module 5 video.', externalUrl: VIDEO.m5 },
    { existing: null, kind: 'document', title: 'Module 5 Slides — Shame, Identity & the Teen Years', description: 'Slides for Module 5.', fileUrl: urls.m5, fileName: 'Module-5-Shame-Identity-and-the-Teen-Years.pdf' },

    { existing: null, kind: 'embed', title: 'Module 6 Video — Loving Boundaries with a Teenager', description: 'Module 6 video.', externalUrl: VIDEO.m6 },
    { existing: null, kind: 'document', title: 'Module 6 Slides — Loving Boundaries with a Teenager', description: 'Slides for Module 6.', fileUrl: urls.m6, fileName: 'Module-6-Loving-Boundaries-with-a-Teenager.pdf' },

    { existing: null, kind: 'embed', title: 'Module 7 Video — Connection Across the Disconnection', description: 'Module 7 video.', externalUrl: VIDEO.m7 },
    { existing: null, kind: 'document', title: 'Module 7 Slides — Connection Across the Disconnection', description: 'Slides for Module 7.', fileUrl: urls.m7, fileName: 'Module-7-Connection-Across-the-Disconnection.pdf' },

    { existing: null, kind: 'embed', title: 'Module 8 Video — The Sensitive Teen at School & in the World', description: 'Module 8 video.', externalUrl: VIDEO.m8 },
    { existing: null, kind: 'document', title: 'Module 8 Slides — The Sensitive Teen at School & in the World', description: 'Slides for Module 8.', fileUrl: urls.m8, fileName: 'Module-8-The-Sensitive-Teen-at-School-and-in-the-World.pdf' },

    { existing: null, kind: 'embed', title: 'Module 9 Video — Building Your Village and Theirs', description: 'Module 9 video.', externalUrl: VIDEO.m9 },
    { existing: null, kind: 'document', title: 'Module 9 Slides — Building Your Village and Theirs', description: 'Slides for Module 9.', fileUrl: urls.m9, fileName: 'Module-9-Building-Your-Village-and-Theirs.pdf' },

    { existing: null, kind: 'embed', title: 'Module 10 Video — Raising a Thriving Sensitive Teen', description: 'Module 10 video.', externalUrl: VIDEO.m10 },
    { existing: null, kind: 'document', title: 'Module 10 Slides — Raising a Thriving Sensitive Teen', description: 'Slides for Module 10.', fileUrl: urls.m10, fileName: 'Module-10-Raising-a-Thriving-Sensitive-Teen.pdf' },
  ]

  console.log('Writing lessons in order…')
  let position = 0
  for (const item of plan) {
    position += 1
    if (item.existing) {
      await sql`update lesson set position = ${position} where id = ${item.existing}`
    } else if (item.kind === 'embed') {
      await sql`
        insert into lesson ("sectionId", kind, title, description, "externalUrl", hidden, position)
        values (${SECTION_ID}, 'embed', ${item.title}, ${item.description}, ${item.externalUrl}, false, ${position})
      `
    } else {
      await sql`
        insert into lesson ("sectionId", kind, title, description, "fileUrl", "fileName", hidden, position)
        values (${SECTION_ID}, 'document', ${item.title}, ${item.description}, ${item.fileUrl}, ${item.fileName}, false, ${position})
      `
    }
  }

  const final = await sql`
    select position, kind, title from lesson where "sectionId" = ${SECTION_ID} order by position
  `
  console.log(`\nDone. ${final.length} lessons in the course:`)
  for (const l of final) console.log(`  ${String(l.position).padStart(2)}. [${l.kind}] ${l.title}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
