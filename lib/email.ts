import { Resend } from 'resend'

// Instantiate lazily so a missing RESEND_API_KEY doesn't crash module load
// (and every page that transitively imports auth). Emails no-op with a warning
// until the key is set in the project environment.
let resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

// Sends from the institute's no-reply address. The tunedininstitute.org domain
// must be verified in Resend for delivery to work; until then Resend will
// reject sends and you can temporarily switch this to 'onboarding@resend.dev'.
const FROM = 'The Tuned In Institute <no-reply@tunedininstitute.org>'

type SendArgs = {
  to: string
  subject: string
  heading: string
  intro: string
  buttonLabel: string
  buttonUrl: string
  footer?: string
}

function template({ heading, intro, buttonLabel, buttonUrl, footer }: Omit<SendArgs, 'to' | 'subject'>) {
  return `
  <div style="background:#faf5ed;padding:40px 0;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#fdfaf4;border:1px solid #d8d2c5;border-radius:12px;overflow:hidden;">
      <div style="background:#1b505a;padding:24px 32px;">
        <p style="margin:0;color:#faf5ed;font-size:18px;font-weight:600;letter-spacing:0.02em;">The Tuned In Institute</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;color:#1b505a;font-size:22px;">${heading}</h1>
        <p style="margin:0 0 24px;color:#2a2a2a;font-size:15px;line-height:1.6;">${intro}</p>
        <a href="${buttonUrl}" style="display:inline-block;background:#1b505a;color:#faf5ed;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">${buttonLabel}</a>
        <p style="margin:24px 0 0;color:#5b574f;font-size:13px;line-height:1.6;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${buttonUrl}" style="color:#3f7682;word-break:break-all;">${buttonUrl}</a></p>
        ${footer ? `<p style="margin:24px 0 0;color:#5b574f;font-size:13px;line-height:1.6;">${footer}</p>` : ''}
      </div>
    </div>
  </div>`
}

export async function sendAuthEmail(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const client = getResend()
  if (!client) {
    console.warn('[v0] RESEND_API_KEY not set — skipping email to', args.to)
    return { ok: false, error: 'RESEND_API_KEY not set' }
  }
  const { to, subject, ...rest } = args
  try {
    const { error } = await client.emails.send({
      from: FROM,
      to,
      subject,
      html: template(rest),
    })
    if (error) {
      // Most common cause: the sending domain isn't verified in Resend yet.
      console.error('[v0] Resend rejected email to', to, '-', error.message ?? error)
      return { ok: false, error: error.message ?? String(error) }
    }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[v0] Failed to send email to', to, '-', message)
    return { ok: false, error: message }
  }
}
