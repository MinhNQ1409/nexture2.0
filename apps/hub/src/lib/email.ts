// Resend over HTTP; without RESEND_API_KEY the mail is printed to the server log (local dev).
export async function sendEmail(msg: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email] to=${msg.to} subject=${msg.subject}\n${msg.text}`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: msg.to, subject: msg.subject, text: msg.text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
