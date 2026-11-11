// One-off: upload the printable family handouts to the "Parent & Caregiver
// Handouts" section (13) and email copies to Sophie.
//
// Idempotent: lessons are matched by fileName, so re-running replaces the file
// on an existing lesson instead of creating duplicates.

import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'
import { put } from '@vercel/blob'
import { Resend } from 'resend'

const sql = neon(process.env.DATABASE_URL)
const SECTION_ID = 13
const SRC_DIR = '/tmp/handout-pdfs'
const EMAIL_TO = 'sophie@rootedrhythm.com'

const HANDOUTS = [
  {
    src: 'tuned-in-handout.pdf',
    fileName: 'Tuned In Institute - Family Access & Library Guide.pdf',
    title: 'Family Handout: Getting Into the Tuned In Institute',
    description:
      'A printable two-page guide for families: how to sign in to the Tuned In Institute, what each Tuned In book covers, and the 10 modules of the Tuned In Parenting for Teens course.',
    position: -3,
  },
  {
    src: 'rooted-rhythm-process.pdf',
    fileName: 'Rooted Rhythm - Therapy & Parent Coaching Process.pdf',
    title: 'Rooted Rhythm Therapy + Parent Coaching Process',
    description:
      'A printable overview of the Rooted Rhythm child and teen therapy process, the Tuned In books, and the Tuned In Parenting course modules for ages 2–12 and teens.',
    position: -2,
  },
  {
    src: 'tuned-in-tools-outlines.pdf',
    fileName: 'Tuned In Tools for Teens & Adults - Course Outlines.pdf',
    title: 'Course Outlines: Tuned In Regulation Tools for Teens & Adults',
    description:
      'A printable outline of the Tuned In Regulation Tools for Teens and Tuned In Regulation Tools for Adults courses.',
    position: -1,
  },
]

async function main() {
  const attachments = []

  for (const h of HANDOUTS) {
    const buf = await readFile(`${SRC_DIR}/${h.src}`)
    attachments.push({ filename: h.fileName, content: buf })

    const blob = await put(`handouts/${h.src}`, buf, {
      access: 'private',
      contentType: 'application/pdf',
      addRandomSuffix: true,
    })

    const existing = await sql`
      select id from lesson where "sectionId" = ${SECTION_ID} and "fileName" = ${h.fileName}
    `
    if (existing.length) {
      await sql`
        update lesson
        set "fileUrl" = ${blob.url}, title = ${h.title}, description = ${h.description},
            position = ${h.position}, hidden = false, "updatedAt" = now()
        where id = ${existing[0].id}
      `
      console.log(`updated lesson #${existing[0].id}: ${h.title}`)
    } else {
      const [row] = await sql`
        insert into lesson ("sectionId", kind, title, description, "fileUrl", "fileName", position)
        values (${SECTION_ID}, 'document', ${h.title}, ${h.description}, ${blob.url}, ${h.fileName}, ${h.position})
        returning id
      `
      console.log(`created lesson #${row.id}: ${h.title}`)
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: 'The Tuned In Institute <no-reply@tunedininstitute.org>',
    to: EMAIL_TO,
    subject: 'Your Tuned In family handouts (PDFs)',
    html: `
      <div style="font-family:Georgia,'Times New Roman',serif;color:#2a2a2a;line-height:1.6;max-width:520px;">
        <p>Hi Sophie,</p>
        <p>Attached are the three printable handouts:</p>
        <ul>
          ${HANDOUTS.map((h) => `<li>${h.title}</li>`).join('')}
        </ul>
        <p>They're also live in the Tuned In Institute library under <strong>Parent &amp; Caregiver Handouts</strong>.</p>
        <p style="color:#5b574f;font-size:13px;">— The Tuned In Institute</p>
      </div>`,
    attachments,
  })
  if (error) {
    console.error('email failed:', error)
    process.exitCode = 1
  } else {
    console.log('email sent:', data?.id)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
