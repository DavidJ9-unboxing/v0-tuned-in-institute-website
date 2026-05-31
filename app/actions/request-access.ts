'use server'

import { Resend } from 'resend'

// Public-facing contact address shown across the site.
const ADMIN_EMAIL = 'admin@tunedininstitute.org'
// Where access requests are delivered for now. Switch to ADMIN_EMAIL once the
// tunedininstitute.org domain is verified in Resend.
const DELIVERY_EMAIL = 'dwolfe.j9@gmail.com'

export type RequestAccessState = {
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

export async function requestAccess(
  _prev: RequestAccessState,
  formData: FormData,
): Promise<RequestAccessState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const relationship = String(formData.get('relationship') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  // Honeypot
  if (String(formData.get('company') ?? '').trim() !== '') {
    return { status: 'success', message: "Thank you. We'll be in touch shortly." }
  }

  if (!name || !email) {
    return { status: 'error', message: 'Please share your name and email so we can reach you.' }
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailValid) {
    return { status: 'error', message: 'Please enter a valid email address.' }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      status: 'error',
      message:
        'The request form is not fully configured yet. Please email admin@tunedininstitute.org directly.',
    }
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Tuned In Institute <onboarding@resend.dev>',
      to: DELIVERY_EMAIL,
      replyTo: email,
      subject: `Access request from ${name}`,
      html: `
        <h2>New access request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Relationship to Rooted Rhythm:</strong> ${escapeHtml(relationship) || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>') || 'No message provided.'}</p>
      `,
    })

    return {
      status: 'success',
      message: "Thank you. Your request has been sent to the Institute. We'll be in touch shortly.",
    }
  } catch (error) {
    console.log('[v0] request-access send error:', error)
    return {
      status: 'error',
      message:
        'Something went wrong sending your request. Please email admin@tunedininstitute.org directly.',
    }
  }
}
