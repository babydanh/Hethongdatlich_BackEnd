import {
  pgTable,
  serial,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
  integer,
  date,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Bảng ROLES
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 20 }).unique().notNull(),
});

// 2. Bảng USERS
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uid: uuid('uid').defaultRandom().unique().notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    phone: varchar('phone', { length: 20 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    roleId: integer('role_id').references(() => roles.id),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    phoneIdx: uniqueIndex('idx_users_phone').on(table.phone),
    uidIdx: uniqueIndex('idx_users_uid').on(table.uid),
  }),
);

// 3. Bảng PROFILES
export const profiles = pgTable('profiles', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  dob: date('dob'),
  gender: varchar('gender', { length: 10 }),
  bio: text('bio'),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 4. RELATIONS
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));
