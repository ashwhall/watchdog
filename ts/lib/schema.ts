// src/lib/schema.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const dogs = sqliteTable('dogs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  breed: text('breed'), // Nullable - will be filled by ML service
  postUrl: text('post_url').notNull(),
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull(),
  scrapedAt: integer('scraped_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Dog = typeof dogs.$inferSelect;
export type NewDog = typeof dogs.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
