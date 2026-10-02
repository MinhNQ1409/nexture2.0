// Better Auth: email + password only (docs/spec/05-api-ghi-chu.md §7).
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { coreTables as t } from '@nexture/db';
import { db } from './db';
import { sendEmail } from './email';

const adminEmails = () =>
  (process.env.NEXTURE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db(), {
    provider: 'pg',
    schema: { user: t.user, session: t.session, account: t.account, verification: t.verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Đặt lại mật khẩu NexTure',
        text: `Chào ${user.name},\n\nBấm vào link sau để đặt lại mật khẩu (hiệu lực 60 phút):\n${url}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
      });
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  user: {
    additionalFields: {
      platformRole: { type: 'string', input: false, defaultValue: 'USER', fieldName: 'platformRole' },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, platformRole: adminEmails().includes(user.email.toLowerCase()) ? 'NEXTURE_ADMIN' : 'USER' },
        }),
      },
    },
  },
  plugins: [nextCookies()],
});
