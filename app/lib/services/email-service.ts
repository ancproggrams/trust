
import { EmailLog, EmailType, EmailStatus, EmailTemplateData } from '@/lib/types';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class EmailService {
  private static instance: EmailService;
  private templates: Map<string, EmailTemplate> = new Map();

  private constructor() {
    this.loadTemplates();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async loadTemplates() {
    // Load email templates - in production these would come from database
    this.templates.set('CLIENT_CONFIRMATION_nl', {
      subject: 'Bevestig uw registratie bij Trust.io',
      htmlTemplate: await this.getHtmlTemplate('client-confirmation', 'nl'),
      textTemplate: await this.getTextTemplate('client-confirmation', 'nl'),
    });

    this.templates.set('CLIENT_CONFIRMATION_en', {
      subject: 'Confirm your registration with Trust.io',
      htmlTemplate: await this.getHtmlTemplate('client-confirmation', 'en'),
      textTemplate: await this.getTextTemplate('client-confirmation', 'en'),
    });

    this.templates.set('ADMIN_NOTIFICATION_nl', {
      subject: 'Nieuwe klant wacht op goedkeuring - Trust.io',
      htmlTemplate: await this.getHtmlTemplate('admin-notification', 'nl'),
      textTemplate: await this.getTextTemplate('admin-notification', 'nl'),
    });

    this.templates.set('APPROVAL_NOTIFICATION_nl', {
      subject: 'Uw account is goedgekeurd - Trust.io',
      htmlTemplate: await this.getHtmlTemplate('approval-notification', 'nl'),
      textTemplate: await this.getTextTemplate('approval-notification', 'nl'),
    });

    this.templates.set('REJECTION_NOTIFICATION_nl', {
      subject: 'Aanvullende informatie vereist - Trust.io',
      htmlTemplate: await this.getHtmlTemplate('rejection-notification', 'nl'),
      textTemplate: await this.getTextTemplate('rejection-notification', 'nl'),
    });
  }

  public async sendEmail(
    type: EmailType,
    recipient: string,
    templateData: EmailTemplateData,
    clientId?: string,
    language: string = 'nl'
  ): Promise<EmailLog> {
    const emailId = uuidv4();
    const confirmationToken = type === 'CLIENT_CONFIRMATION' ? uuidv4() : undefined;
    
    try {
      // Get template
      const templateKey = `${type}_${language}`;
      const template = this.templates.get(templateKey);
      
      if (!template) {
        throw new Error(`Template not found: ${templateKey}`);
      }

      // Render content
      const htmlContent = this.renderTemplate(template.htmlTemplate, templateData);
      const textContent = this.renderTemplate(template.textTemplate, templateData);
      const subject = this.renderTemplate(template.subject, templateData);

      // Create email log entry
      const emailLog = await prisma.emailLog.create({
        data: {
          id: emailId,
          clientId,
          type,
          recipient,
          subject,
          template: templateKey,
          language,
          templateData: templateData as any,
          htmlContent,
          textContent,
          status: 'PENDING',
          confirmationToken,
          retryCount: 0,
          maxRetries: 3,
        },
      });

      // Send email (mock implementation for demo)
      await this.deliverEmail({
        ...emailLog,
        clientId: emailLog.clientId || undefined,
      } as EmailLog);

      return {
        ...emailLog,
        clientId: emailLog.clientId || undefined,
      } as EmailLog;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Log the error
      const errorLog = await prisma.emailLog.create({
        data: {
          id: emailId,
          clientId,
          type,
          recipient,
          subject: `Error: ${type}`,
          template: `${type}_${language}`,
          language,
          templateData: templateData as any,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          retryCount: 0,
          maxRetries: 3,
        },
      });

      return errorLog as EmailLog;
    }
  }

  private async deliverEmail(emailLog: EmailLog): Promise<void> {
    try {
      // Mock email delivery - in production, integrate with SendGrid, Mailgun, etc.
      console.log(`📧 Mock Email Delivery:`);
      console.log(`To: ${emailLog.recipient}`);
      console.log(`Subject: ${emailLog.subject}`);
      console.log(`Type: ${emailLog.type}`);
      console.log(`Language: ${emailLog.language}`);
      
      if (emailLog.confirmationToken) {
        console.log(`Confirmation URL: ${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${emailLog.confirmationToken}`);
      }

      // Simulate delivery delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status to sent
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          // Simulate immediate delivery for demo
          deliveredAt: new Date(),
        },
      });

      console.log(`✅ Email delivered successfully`);
    } catch (error) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Delivery failed',
        },
      });
      throw error;
    }
  }

  public async confirmEmail(token: string, ipAddress?: string): Promise<boolean> {
    try {
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          confirmationToken: token,
          type: 'CLIENT_CONFIRMATION',
          status: { in: ['SENT', 'DELIVERED'] },
        },
        include: {
          client: true,
        },
      });

      if (!emailLog) {
        return false;
      }

      // Update email log
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          confirmedAt: new Date(),
          confirmationData: { ipAddress },
          status: 'CLICKED',
        },
      });

      // Update client email confirmation status
      if (emailLog.clientId) {
        await prisma.client.update({
          where: { id: emailLog.clientId },
          data: {
            emailConfirmed: true,
            emailConfirmedAt: new Date(),
            onboardingStatus: 'CLIENT_CONFIRMED',
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Error confirming email:', error);
      return false;
    }
  }

  public async trackEmailOpened(emailId: string): Promise<void> {
    try {
      await prisma.emailLog.update({
        where: { id: emailId },
        data: {
          openedAt: new Date(),
          status: 'OPENED',
        },
      });
    } catch (error) {
      console.error('Error tracking email open:', error);
    }
  }

  public async retryFailedEmail(emailId: string): Promise<boolean> {
    try {
      const emailLog = await prisma.emailLog.findUnique({
        where: { id: emailId },
      });

      if (!emailLog || emailLog.retryCount >= emailLog.maxRetries) {
        return false;
      }

      await prisma.emailLog.update({
        where: { id: emailId },
        data: {
          status: 'PENDING',
          retryCount: emailLog.retryCount + 1,
          errorMessage: null,
        },
      });

      await this.deliverEmail(emailLog as EmailLog);
      return true;
    } catch (error) {
      console.error('Error retrying email:', error);
      return false;
    }
  }

  private renderTemplate(template: string, data: EmailTemplateData): string {
    let rendered = template;
    
    // Simple template variable replacement
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    });

    return rendered;
  }

  private async getHtmlTemplate(templateName: string, language: string): Promise<string> {
    // In production, these would be loaded from files or database
    const templates: Record<string, Record<string, string>> = {
      'client-confirmation': {
        'nl': `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bevestig uw registratie</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px 20px; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{brandName}}</h1>
            <p>Welkom bij uw vertrouwde ZZP administratie platform</p>
        </div>
        <div class="content">
            <h2>Hallo {{clientName}},</h2>
            <p>Bedankt voor uw registratie bij Trust.io! Om uw account te activeren, klik op onderstaande knop:</p>
            
            <a href="{{confirmationUrl}}" class="button">Account Bevestigen</a>
            
            <p>Na bevestiging zal uw aanvraag worden doorgestuurd naar ons administratie team voor finale goedkeuring.</p>
            
            <h3>Wat gebeurt er nu?</h3>
            <ol>
                <li>✅ U bevestigt uw email adres</li>
                <li>🔍 Wij valideren uw KVK en BTW gegevens</li>
                <li>👨‍💼 Ons team beoordeelt uw aanvraag</li>
                <li>🚀 U krijgt toegang tot het platform</li>
            </ol>
            
            <p>Heeft u vragen? Neem contact op met ons support team via {{supportEmail}} of bel {{supportPhone}}.</p>
            
            <p>Met vriendelijke groet,<br>Het Trust.io Team</p>
        </div>
        <div class="footer">
            <p>Deze email werd verstuurd naar {{clientName}} ({{adminContactEmail}})</p>
            <p>{{brandName}} - Betrouwbare ZZP Administratie</p>
        </div>
    </div>
</body>
</html>`,
        'en': `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your registration</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px 20px; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{brandName}}</h1>
            <p>Welcome to your trusted freelance administration platform</p>
        </div>
        <div class="content">
            <h2>Hello {{clientName}},</h2>
            <p>Thank you for registering with Trust.io! To activate your account, please click the button below:</p>
            
            <a href="{{confirmationUrl}}" class="button">Confirm Account</a>
            
            <p>After confirmation, your application will be forwarded to our administration team for final approval.</p>
            
            <h3>What happens next?</h3>
            <ol>
                <li>✅ You confirm your email address</li>
                <li>🔍 We validate your KVK and VAT details</li>
                <li>👨‍💼 Our team reviews your application</li>
                <li>🚀 You get access to the platform</li>
            </ol>
            
            <p>Questions? Contact our support team at {{supportEmail}} or call {{supportPhone}}.</p>
            
            <p>Best regards,<br>The Trust.io Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to {{clientName}} ({{adminContactEmail}})</p>
            <p>{{brandName}} - Trusted Freelance Administration</p>
        </div>
    </div>
</body>
</html>`
      },
      'admin-notification': {
        'nl': `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nieuwe klant - Goedkeuring vereist</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff9500; color: white; text-align: center; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Nieuwe Klant Goedkeuring</h1>
            <p>Actie vereist voor {{clientName}}</p>
        </div>
        <div class="content">
            <h2>Klant Details</h2>
            <div class="info-box">
                <strong>Naam:</strong> {{clientName}}<br>
                <strong>Bedrijf:</strong> {{companyName}}<br>
                <strong>Email:</strong> {{adminContactEmail}}<br>
                <strong>KVK:</strong> {{kvkNumber}}<br>
                <strong>BTW:</strong> {{vatNumber}}<br>
                <strong>Status:</strong> Email bevestigd ✅
            </div>
            
            <p>Een nieuwe klant heeft de email bevestiging voltooid en wacht op admin goedkeuring.</p>
            
            <div style="text-align: center;">
                <a href="{{platformUrl}}/admin/approvals" class="button">Bekijk in Dashboard</a>
                <a href="{{platformUrl}}/admin/clients/{{clientId}}" class="button">Klant Details</a>
            </div>
            
            <p><strong>Volgende stappen:</strong></p>
            <ul>
                <li>Review klant gegevens</li>
                <li>Valideer KVK en BTW nummers</li>
                <li>Controleer bankgegevens</li>
                <li>Goedkeuren of afwijzen</li>
            </ul>
        </div>
        <div class="footer">
            <p>Trust.io Admin Notification System</p>
        </div>
    </div>
</body>
</html>`
      },
      'approval-notification': {
        'nl': `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Goedgekeurd!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; text-align: center; padding: 30px 20px; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .feature-box { background: #f0f8f0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Gefeliciteerd!</h1>
            <p>Uw Trust.io account is goedgekeurd</p>
        </div>
        <div class="content">
            <h2>Hallo {{clientName}},</h2>
            <p>Geweldig nieuws! Uw Trust.io account is officieel goedgekeurd en u kunt nu alle functies van het platform gebruiken.</p>
            
            <div class="feature-box">
                <strong>✅ Account Status:</strong> Volledig geactiveerd<br>
                <strong>🏢 Bedrijf:</strong> {{companyName}}<br>
                <strong>📧 Contact:</strong> {{adminContactName}} ({{adminContactEmail}})<br>
                <strong>💳 Facturatie:</strong> Ingeschakeld
            </div>
            
            {{#approvalNotes}}
            <div class="feature-box">
                <strong>💬 Notities van het admin team:</strong><br>
                {{approvalNotes}}
            </div>
            {{/approvalNotes}}
            
            <div style="text-align: center;">
                <a href="{{platformUrl}}/dashboard" class="button">Start met Trust.io</a>
            </div>
            
            <h3>Wat kunt u nu doen?</h3>
            <ul>
                <li>📄 Facturen aanmaken en versturen</li>
                <li>👥 Klanten beheren</li>
                <li>💰 BTW en belasting administratie</li>
                <li>📊 Financiële rapportages bekijken</li>
                <li>📅 Afspraken plannen</li>
                <li>📁 Documenten beheren</li>
            </ul>
            
            <p>Heeft u vragen over het platform? Neem contact op via {{supportEmail}} of bel {{supportPhone}}.</p>
            
            <p>Welkom bij Trust.io!<br>Het Trust.io Team</p>
        </div>
        <div class="footer">
            <p>Deze email werd verstuurd naar {{clientName}} ({{adminContactEmail}})</p>
            <p>{{brandName}} - Betrouwbare ZZP Administratie</p>
        </div>
    </div>
</body>
</html>`
      },
      'rejection-notification': {
        'nl': `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aanvullende informatie vereist</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; text-align: center; padding: 30px 20px; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Aanvullende Informatie</h1>
            <p>Uw Trust.io aanvraag vereist meer gegevens</p>
        </div>
        <div class="content">
            <h2>Hallo {{clientName}},</h2>
            <p>Bedankt voor uw interesse in Trust.io. We hebben uw aanvraag beoordeeld en hebben enkele aanvullende vragen:</p>
            
            <div class="warning-box">
                <strong>💡 Gevraagde aanpassingen:</strong><br>
                {{rejectionReason}}
            </div>
            
            <p>Geen zorgen! Dit is een standaard proces om ervoor te zorgen dat we u de beste service kunnen bieden.</p>
            
            <div style="text-align: center;">
                <a href="{{platformUrl}}/register/update?token={{confirmationToken}}" class="button">Gegevens Bijwerken</a>
            </div>
            
            <h3>Volgende stappen:</h3>
            <ol>
                <li>🔗 Klik op de knop hierboven</li>
                <li>✏️ Werk uw gegevens bij</li>
                <li>📤 Verstuur opnieuw voor beoordeling</li>
                <li>✅ Krijg toegang tot het platform</li>
            </ol>
            
            <p>Heeft u vragen over deze feedback? Neem gerust contact op met ons support team via {{supportEmail}} of bel {{supportPhone}}.</p>
            
            <p>Met vriendelijke groet,<br>Het Trust.io Team</p>
        </div>
        <div class="footer">
            <p>Deze email werd verstuurd naar {{clientName}} ({{adminContactEmail}})</p>
            <p>{{brandName}} - Betrouwbare ZZP Administratie</p>
        </div>
    </div>
</body>
</html>`
      }
    };

    return templates[templateName]?.[language] || '';
  }

  private async getTextTemplate(templateName: string, language: string): Promise<string> {
    // Simple text versions of the templates
    const templates: Record<string, Record<string, string>> = {
      'client-confirmation': {
        'nl': `
{{brandName}} - Bevestig uw registratie

Hallo {{clientName}},

Bedankt voor uw registratie bij Trust.io! 

Bevestig uw account via: {{confirmationUrl}}

Na bevestiging wordt uw aanvraag doorgestuurd voor finale goedkeuring.

Wat gebeurt er nu?
1. U bevestigt uw email adres
2. Wij valideren uw KVK en BTW gegevens  
3. Ons team beoordeelt uw aanvraag
4. U krijgt toegang tot het platform

Vragen? Contact: {{supportEmail}} of {{supportPhone}}

Met vriendelijke groet,
Het Trust.io Team
        `,
        'en': `
{{brandName}} - Confirm your registration

Hello {{clientName}},

Thank you for registering with Trust.io!

Confirm your account at: {{confirmationUrl}}

After confirmation, your application will be forwarded for final approval.

What happens next?
1. You confirm your email address
2. We validate your KVK and VAT details
3. Our team reviews your application  
4. You get access to the platform

Questions? Contact: {{supportEmail}} or {{supportPhone}}

Best regards,
The Trust.io Team
        `
      },
      'admin-notification': {
        'nl': `
Trust.io - Nieuwe Klant Goedkeuring Vereist

Klant Details:
- Naam: {{clientName}}
- Bedrijf: {{companyName}}
- Email: {{adminContactEmail}}
- Status: Email bevestigd

Een nieuwe klant wacht op admin goedkeuring.

Dashboard: {{platformUrl}}/admin/approvals
Klant Details: {{platformUrl}}/admin/clients/{{clientId}}

Trust.io Admin System
        `
      },
      'approval-notification': {
        'nl': `
{{brandName}} - Account Goedgekeurd!

Hallo {{clientName}},

Uw Trust.io account is officieel goedgekeurd!

Account Status: Volledig geactiveerd
Bedrijf: {{companyName}}
Contact: {{adminContactName}} ({{adminContactEmail}})
Facturatie: Ingeschakeld

Start nu: {{platformUrl}}/dashboard

Functies beschikbaar:
- Facturen aanmaken
- Klanten beheren  
- BTW administratie
- Financiële rapportages
- Afspraken plannen
- Documenten beheren

Vragen? {{supportEmail}} of {{supportPhone}}

Welkom bij Trust.io!
        `
      },
      'rejection-notification': {
        'nl': `
{{brandName}} - Aanvullende Informatie Vereist

Hallo {{clientName}},

Uw Trust.io aanvraag vereist aanvullende gegevens:

{{rejectionReason}}

Werk uw gegevens bij: {{platformUrl}}/register/update?token={{confirmationToken}}

Volgende stappen:
1. Klik op de link hierboven
2. Werk uw gegevens bij
3. Verstuur opnieuw voor beoordeling
4. Krijg toegang tot het platform

Vragen? {{supportEmail}} of {{supportPhone}}

Met vriendelijke groet,
Het Trust.io Team
        `
      }
    };

    return templates[templateName]?.[language] || '';
  }
}

interface EmailTemplate {
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
}

export const emailService = EmailService.getInstance();
