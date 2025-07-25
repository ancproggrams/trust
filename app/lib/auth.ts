
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true }
          });

          if (!user) {
            return null;
          }

          // For demo users, allow simple password check
          if (user.isDemo) {
            // Demo users have simple passwords
            if (credentials.password === 'johndoe123' && user.email === 'john@doe.com') {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                isDemo: user.isDemo,
              };
            }
            return null;
          }

          // For regular users, implement proper password hashing
          // Note: In a real implementation, you'd have a password field and proper bcrypt comparison
          // For now, we'll use a simple check for development
          if (credentials.password === 'password123') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              isDemo: user.isDemo,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isDemo = user.isDemo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.isDemo = token.isDemo as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account }) {
      // Log sign in event
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            newValues: {
              email: user.email,
              provider: account?.provider,
              timestamp: new Date().toISOString(),
            }
          }
        });
      } catch (error) {
        console.error('Failed to log sign in event:', error);
      }
    },
    async signOut({ session }) {
      // Log sign out event
      try {
        if (session?.user?.id) {
          await prisma.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'LOGOUT',
              entity: 'User',
              entityId: session.user.id,
              newValues: {
                timestamp: new Date().toISOString(),
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to log sign out event:', error);
      }
    }
  },
};
