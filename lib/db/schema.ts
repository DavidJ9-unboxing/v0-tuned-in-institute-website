import { pgTable, text, timestamp, boolean, serial, integer, index } from 'drizzle-orm/pg-core'

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
  // True for admin-created accounts using a temporary password. When set, the
  // member is prompted to choose their own password after signing in.
  mustChangePassword: boolean('mustChangePassword').notNull().default(false),
  // The staff member (admin or therapist) who created this account. Lets a
  // therapist see the clients they onboarded. Null for the original admin and
  // any self-created/seed accounts.
  createdById: text('createdById'),
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
//
// Sections can optionally be grouped under a collection (e.g. the multi-part
// "Tuned In Parenting (2–12)" course, whose Introduction + Modules are each a
// section). Sections with a null collectionId are standalone and appear as
// their own top-level card in the library.

export const collection = pgTable('collection', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  hidden: boolean('hidden').notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const section = pgTable('section', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  // Optional parent collection. Null = standalone top-level section.
  collectionId: integer('collectionId'),
  // Order within the parent collection (used on the collection page).
  collectionPosition: integer('collectionPosition').notNull().default(0),
  // Course sections show a "Course" badge and count their items as "lessons";
  // non-course sections count their items as "resources" instead.
  isCourse: boolean('isCourse').notNull().default(false),
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
  // Sub-items share the previous main item's number with a letter suffix in the
  // viewer (e.g. a "1b" extended version listed under item "1"). Purely cosmetic
  // numbering — they're still ordinary lessons.
  isSubItem: boolean('isSubItem').notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Audit log -------------------------------------------------------------
// Append-only record of staff access to member data, required by the HIPAA
// Security Rule (§164.312(b)) and the only way to answer "whose data was
// affected?" after an incident.
//
// Three deliberate design decisions:
//
// 1. NO FOREIGN KEYS. `actorId`/`targetId` are plain text, not references. A
//    cascade would delete the audit trail for a member at the exact moment
//    someone deletes their account — which is precisely the event most worth
//    keeping. Actor and target details are also snapshotted (`actorEmail`,
//    `targetLabel`) so the log stays readable after the row it describes is
//    gone.
// 2. APPEND-ONLY BY CONVENTION. There is no update or delete path in the app.
//    Rows are written once and never modified.
// 3. NO PHI IN `detail`. This table records *that* an access happened, never
//    the sensitive content involved. Never write conversation text, clinical
//    notes, or free-text member disclosures here.
export const auditLog = pgTable(
  'audit_log',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    // Who acted. Null only for system/automated events.
    actorId: text('actorId'),
    actorEmail: text('actorEmail'),
    actorRole: text('actorRole'),
    // What they did, as a stable dotted key (e.g. 'member.password_reset').
    action: text('action').notNull(),
    // What it was done to.
    targetType: text('targetType'),
    targetId: text('targetId'),
    targetLabel: text('targetLabel'),
    // 'success' | 'failure' | 'denied' — denied attempts matter as much as
    // successful ones, since they are the signal for probing.
    outcome: text('outcome').notNull().default('success'),
    // Short, non-PHI context (e.g. 'role: client -> admin', '640 records').
    detail: text('detail'),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
  },
  (table) => [
    // Supports the default "most recent first" view.
    index('audit_log_created_at_idx').on(table.createdAt.desc()),
    // Supports "everything that touched this member" — the question asked
    // during a breach investigation or a member's access request.
    index('audit_log_target_idx').on(table.targetType, table.targetId),
    // Supports "everything this staff member did".
    index('audit_log_actor_idx').on(table.actorId),
  ],
)

// Admin-curated featured content shown on the public resources page. Each row
// points to a lesson and can override its presentation with a custom headline
// and blurb. `position` controls display order.
export const featured = pgTable('featured', {
  id: serial('id').primaryKey(),
  lessonId: integer('lessonId')
    .notNull()
    .unique()
    .references(() => lesson.id, { onDelete: 'cascade' }),
  headline: text('headline'),
  blurb: text('blurb'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
