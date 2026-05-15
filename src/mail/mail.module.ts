import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppMailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('MAIL_HOST');
        const port = Number(configService.get<string>('MAIL_PORT') || 587);
        const user = configService.get<string>('MAIL_USER');
        const pass = configService.get<string>('MAIL_PASSWORD');
        const secure = configService.get<string>('MAIL_SECURE') === 'true';

        return {
          transport: host
            ? {
                host,
                port,
                secure,
                auth: user && pass ? { user, pass } : undefined,
              }
            : {
                jsonTransport: true,
              },
          defaults: {
            from:
              configService.get<string>('MAIL_FROM') ||
              '"Pearlthoughts" <no-reply@example.com>',
          },
        };
      },
    }),
  ],
  providers: [AppMailService],
  exports: [AppMailService],
})
export class MailModule {}
