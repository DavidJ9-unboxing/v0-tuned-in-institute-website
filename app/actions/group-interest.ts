'use server'

import { Resend } from 'resend'
import { db } from '@/lib/db'
import { groupInterest } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'
import { GROUP_TYPES, type GroupType } from '@/lib/groups'

const GROUP_TEAM = [
  'sophie@rootedrhythm.com',
  'kate@rootedrhythm.com',
  'erica.liberati@rootedrhythm.com',
]
const FROM = 'The Tuned In Institute <no-reply@tunedininstitute.org>'

export type GroupInterestState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clip(value: FormDataEntryValue | null, max: number) {
  return String(value ?? '').trim().slice(0, max)
}

export async function submitGroupInterest(
  _prev: GroupInterestState,
  formData: FormData,
): Promise<GroupInterestState> {
  const user = await getCurrentUser()
  if (!user) {
    return { status: 'error', message: 'Please sign in to sign up for a group.' }
  }

  const groupType = clip(formData.get('groupType'), 40) as GroupType
  const childAge = clip(formData.get('childAge'), 100)
  const goals = clip(formData.get('goals'), 2000)
  const availability = clip(formData.get('availability'), 300)

  if (!(groupType in GROUP_TYPES)) {
    return { status: 'error', message: 'Please choose which group you are interested in.' }
  }
  if (groupType !== 'adult' && !childAge) {
    return { status: 'error', message: "Please share your child's or teen's age." }
  }
  if (!goals) {
    return { status: 'error', message: 'Please share a little about your interest and goals.' }
  }

  try {
    await db.insert(groupInterest).values({
      userId: user.id,
      name: user.name,
      email: user.email,
      groupType,
      childAge: childAge || null,
      goals,
      availability: availability || null,
    })
  } catch (error) {
    console.log('[v0] group interest insert error:', error)
    return {
      status: 'error',
      message: 'Something went wrong saving your sign-up. Please try again or tell your therapist.',
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      const row = (label: string, value: string) =>
        `<tr><td style="padding:8px 12px;color:#5b574f;font-size:13px;border-bottom:1px solid #e7e1d4;vertical-align:top;width:140px;">${label}</td><td style="padding:8px 12px;color:#2a2a2a;font-size:14px;border-bottom:1px solid #e7e1d4;">${value}</td></tr>`
      await new Resend(apiKey).emails.send({
        from: FROM,
        to: GROUP_TEAM,
        replyTo: user.email,
        subject: `Group sign-up: ${user.name} (${GROUP_TYPES[groupType]})`,
        html: `
          <div style="font-family:Georgia,serif;color:#2a2a2a;line-height:1.6;max-width:560px;">
            <h2 style="color:#1b505a;margin:0 0 12px;">New group sign-up</h2>
            <table style="width:100%;border-collapse:collapse;background:#faf5ed;border:1px solid #d8d2c5;">
              ${row('Name', escapeHtml(user.name))}
              ${row('Email', escapeHtml(user.email))}
              ${row('Group', escapeHtml(GROUP_TYPES[groupType]))}
              ${row('Child / teen age', escapeHtml(childAge) || 'N/A (adult group)')}
              ${row('Availability', escapeHtml(availability) || 'Not specified')}
              ${row('Interest & goals', escapeHtml(goals).replace(/\n/g, '<br>'))}
            </table>
            <p style="font-size:13px;color:#5b574f;margin-top:16px;">The full list of sign-ups is in the Tuned In Institute under Therapist &rsaquo; Group sign-ups.</p>
          </div>`,
      })
    } catch (error) {
      console.log('[v0] group interest email error:', error)
    }
  }

  return {
    status: 'success',
    message:
      "Thank you for signing up. We'll reach out once a group with at least 4 members is ready to start.",
  }
}
