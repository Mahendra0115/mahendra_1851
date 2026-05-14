import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

interface BrandUserCredentialsMail {
  email: string;
  password: string;
  fullName?: string | null;
  brandName?: string | null;
}

@Injectable()
export class AppMailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBrandUserCredentials({
    email,
    password,
    fullName,
    brandName,
  }: BrandUserCredentialsMail) {
    const recipientName = fullName || brandName || email;
    const safeRecipientName = this.escapeHtml(recipientName);
    const safeEmail = this.escapeHtml(email);
    const safePassword = this.escapeHtml(password);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your brand account login credentials',
      text: [
        `Hello ${recipientName},`,
        '',
        'Your brand account has been created.',
        '',
        `Username/Email: ${email}`,
        `Password: ${password}`,
        '',
        'Please login and change your password after first access.',
      ].join('\n'),
      html: [
        `<p>Hello ${safeRecipientName},</p>`,
        '<p>Your brand account has been created.</p>',
        '<p>',
        `<strong>Username/Email:</strong> ${safeEmail}<br />`,
        `<strong>Password:</strong> ${safePassword}`,
        '</p>',
        '<p>Please login and change your password after first access.</p>',
      ].join(''),
    });
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
