import 'dotenv/config';

interface LeadEmailData {
  name: string;
  email: string;
  company?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

interface QuoteEmailData {
  clientName: string;
  clientEmail?: string;
  serviceCategory: string;
  budgetRange: string;
  turnaroundTime: string;
  deliverables?: string[];
  notes?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'AI BUILD Studio <onboarding@resend.dev>';
const OWNER_EMAIL = process.env.OWNER_EMAIL || '';

export const emailService = {
  isConfigured(): boolean {
    return Boolean(RESEND_API_KEY && RESEND_API_KEY.startsWith('re_'));
  },

  /**
   * Send a raw email via Resend REST API
   */
  async sendEmail(options: { to: string | string[]; subject: string; html: string; text?: string }) {
    if (!this.isConfigured()) {
      console.log(`[EmailService] Resend not configured. Skipping email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return { success: false, reason: 'RESEND_NOT_CONFIGURED' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[EmailService] Resend error:', data);
        return { success: false, error: data };
      }

      console.log(`[EmailService] ✓ Email sent successfully via Resend (ID: ${data.id})`);
      return { success: true, data };
    } catch (err: any) {
      console.error('[EmailService] Network exception sending email:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Triggered when a new message/inquiry is submitted on the Contact form
   */
  async sendNewLeadNotification(lead: LeadEmailData) {
    if (!OWNER_EMAIL && !this.isConfigured()) return;

    const recipient = OWNER_EMAIL || 'owner@aibuild.studio';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d0e; color: #f3f4f6; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #18191c; border-radius: 12px; border: 1px solid #282a30; padding: 32px; }
          .header { border-bottom: 1px solid #282a30; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0; }
          .badge { display: inline-block; padding: 4px 12px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .field-row { margin-bottom: 16px; }
          .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 4px; }
          .field-value { font-size: 15px; color: #f3f4f6; font-weight: 500; }
          .message-box { background: #101114; border: 1px solid #282a30; border-radius: 8px; padding: 16px; margin-top: 16px; line-height: 1.6; color: #e5e7eb; white-space: pre-wrap; }
          .footer { margin-top: 32px; pt-4; border-top: 1px solid #282a30; font-size: 12px; color: #6b7280; text-align: center; }
          .btn { display: inline-block; background: #3b82f6; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">New Client Lead</span>
            <h1 class="title" style="margin-top: 12px;">New Inquiry from ${lead.name}</h1>
          </div>
          
          <div class="field-row">
            <div class="field-label">Sender Email</div>
            <div class="field-value"><a href="mailto:${lead.email}" style="color: #60a5fa; text-decoration: none;">${lead.email}</a></div>
          </div>

          ${lead.company ? `
          <div class="field-row">
            <div class="field-label">Company / Brand</div>
            <div class="field-value">${lead.company}</div>
          </div>` : ''}

          <div style="display: flex; gap: 20px;">
            ${lead.projectType ? `
            <div class="field-row" style="flex: 1;">
              <div class="field-label">Project Scope</div>
              <div class="field-value">${lead.projectType}</div>
            </div>` : ''}

            ${lead.budget ? `
            <div class="field-row" style="flex: 1;">
              <div class="field-label">Target Budget</div>
              <div class="field-value" style="color: #34d399;">${lead.budget}</div>
            </div>` : ''}
          </div>

          <div class="field-row">
            <div class="field-label">Project Brief / Message</div>
            <div class="message-box">${lead.message}</div>
          </div>

          <div style="text-align: center;">
            <a href="mailto:${lead.email}?subject=Re:%20${encodeURIComponent(lead.projectType || 'Project Inquiry')}%20-%20AI%20BUILD%20Studio" class="btn">Reply to ${lead.name}</a>
          </div>

          <div class="footer">
            Sent automatically by AI BUILD Studio Engine
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Send notification to Owner
    await this.sendEmail({
      to: recipient,
      subject: `🚨 New Lead: ${lead.name} (${lead.projectType || 'Inquiry'})`,
      html,
    });

    // 2. Optional: Send automated receipt to Client
    if (lead.email) {
      const clientReceiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0d0e; color: #f3f4f6; margin: 0; padding: 24px; }
            .container { max-width: 580px; margin: 0 auto; background: #18191c; border-radius: 12px; border: 1px solid #282a30; padding: 32px; }
            .title { font-size: 20px; font-weight: 700; color: #ffffff; }
            p { font-size: 15px; line-height: 1.6; color: #d1d5db; }
            .highlight { color: #60a5fa; font-weight: 600; }
            .footer { margin-top: 24px; border-top: 1px solid #282a30; padding-top: 16px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="title">Thanks for reaching out, ${lead.name}!</h1>
            <p>We've received your project inquiry for <span class="highlight">${lead.projectType || 'your creative brief'}</span>.</p>
            <p>Our team is reviewing your requirements and will get back to you within <strong>24 business hours</strong> with initial thoughts and next steps.</p>
            <p>Best regards,<br><strong>AI BUILD Studio</strong></p>
            <div class="footer">
              AI BUILD — Next-Gen 3D, UGC & Automation Architecture
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail({
        to: lead.email,
        subject: `We received your brief — AI BUILD Studio`,
        html: clientReceiptHtml,
      });
    }
  },

  /**
   * Triggered when a new estimate/proposal is created
   */
  async sendNewQuoteNotification(quote: QuoteEmailData) {
    if (!OWNER_EMAIL && !this.isConfigured()) return;
    const recipient = OWNER_EMAIL || 'owner@aibuild.studio';

    const deliverablesList = (quote.deliverables || []).map(d => `<li style="margin-bottom: 4px; color: #e5e7eb;">${d}</li>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0d0e; color: #f3f4f6; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #18191c; border-radius: 12px; border: 1px solid #282a30; padding: 32px; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; }
          .badge { display: inline-block; padding: 4px 12px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .box { background: #101114; border: 1px solid #282a30; border-radius: 8px; padding: 16px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">New Scope Proposal</span>
          <h1 class="title" style="margin-top: 12px;">Estimate for ${quote.clientName}</h1>
          <p><strong>Category:</strong> ${quote.serviceCategory}</p>
          <p><strong>Estimated Budget:</strong> <span style="color: #34d399; font-weight: 700;">${quote.budgetRange}</span></p>
          <p><strong>Turnaround Time:</strong> ${quote.turnaroundTime}</p>
          
          ${quote.deliverables && quote.deliverables.length > 0 ? `
          <div class="box">
            <strong style="color: #9ca3af; font-size: 12px; text-transform: uppercase;">Selected Deliverables:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
              ${deliverablesList}
            </ul>
          </div>` : ''}

          ${quote.clientEmail ? `<p><strong>Client Email:</strong> <a href="mailto:${quote.clientEmail}" style="color: #60a5fa;">${quote.clientEmail}</a></p>` : ''}
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: recipient,
      subject: `📊 New Scope Proposal: ${quote.clientName} (${quote.budgetRange})`,
      html,
    });
  }
};
