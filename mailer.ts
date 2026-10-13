// Outgoing email over SMTP (password reset links, test email). SMTP details are set on the admin Settings page.

import nodemailer from 'nodemailer';
import { getSetting } from './appSettings';

export const emailConfigured = () => Boolean(getSetting('SMTP_HOST') && getSetting('SMTP_FROM'));

export async function sendEmail(message: { to: string; subject: string; text: string; html: string }) {
  if (!emailConfigured()) throw new Error('Email is not set up. Add the SMTP details on the Settings page.');
  const port = parseInt(getSetting('SMTP_PORT') || '587', 10);
  const user = getSetting('SMTP_USER');
  // A new transport per email so changes on the Settings page apply immediately
  const transport = nodemailer.createTransport({
    host: getSetting('SMTP_HOST'),
    port,
    secure: port === 465, // 465 = TLS from the start; 587/25 upgrade with STARTTLS
    auth: user ? { user, pass: getSetting('SMTP_PASS') } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
  await transport.sendMail({ from: getSetting('SMTP_FROM'), ...message });
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Simple branded email: heading, paragraphs and an optional button */
export function emailLayout(opts: { heading: string; paragraphs: string[]; button?: { label: string; url: string }; footer?: string }) {
  const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155">${escapeHtml(t)}</p>`;
  const button = opts.button
    ? `<p style="margin:24px 0"><a href="${escapeHtml(opts.button.url)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:10px">${escapeHtml(opts.button.label)}</a></p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#64748b">Or copy this link into your browser:<br><a href="${escapeHtml(opts.button.url)}" style="color:#15803d;word-break:break-all">${escapeHtml(opts.button.url)}</a></p>`
    : '';
  const html = `<!doctype html><html><body style="margin:0;background:#f5f8fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;padding:32px 16px">
<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
<div style="font-weight:800;font-size:16px;color:#0a1f33;margin-bottom:24px">WA Direct Automation</div>
<h1 style="margin:0 0 16px;font-size:22px;color:#0a1f33">${escapeHtml(opts.heading)}</h1>
${opts.paragraphs.map(p).join('\n')}
${button}
${opts.footer ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#94a3b8">${escapeHtml(opts.footer)}</p>` : ''}
</div></div></body></html>`;
  const text = [opts.heading, '', ...opts.paragraphs, ...(opts.button ? ['', `${opts.button.label}: ${opts.button.url}`] : []), ...(opts.footer ? ['', opts.footer] : [])].join('\n');
  return { html, text };
}
