import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const handler = NextAuth({
    providers: [
        EmailProvider({
            server: {
                host: 'smtp.gmail.com',
                port: 465,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            },
            from: process.env.EMAIL_USER,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user?.email) {
                const result = await pool.query(
                    'SELECT id FROM kullanicilar WHERE email = $1',
                    [session.user.email]
                );
                if (result.rows.length > 0) {
                    (session.user as any).id = result.rows[0].id;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };