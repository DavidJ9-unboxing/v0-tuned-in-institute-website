import { pgTable, text, timestamp, boolean, serial, integer } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  // Added by the admin plugin:
  role: text('role').notNull().default('client'),
  banned: boolean('banned').notNull().default(false),
  banReason: text('banReason'),
  banExpires: timestamp('banExpires'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  // Added by the admin plugin (impersonation):
  impersonatedBy: text('impersonatedBy'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Content library: sections (e.g. "Tuned In Teens") contain ordered lessons.
// A lesson is either a video (Blob URL) or an article (rich text body).

export const section = pgTable('section', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  // Hidden sections (and their lessons) never appear in the library, but their
  // content is still fed to Remi as background knowledge for answering questions.
  hidden: boolean('hidden').notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const lesson = pgTable('lesson', {
  id: serial('id').primaryKey(),
  sectionId: integer('sectionId').notNull(),
  // "video" | "article" | "link" | "document"
  kind: text('kind').notNull().default('video'),
  title: text('title').notNull(),
  description: text('description'),
  // For videos: the Blob URL of the uploaded file.
  videoUrl: text('videoUrl'),
  // For articles: the body text/markdown.
  body: text('body'),
  // For links: an external URL (e.g. a course transcript or blog post).
  externalUrl: text('externalUrl'),
  // For documents: the Blob URL of the uploaded file and its original name.
  fileUrl: text('fileUrl'),
  fileName: text('fileName'),
  // Hidden lessons never appear in the library, but are still fed to Remi as
  // background knowledge for answering questions.
  hidden: boolean('hidden').notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
