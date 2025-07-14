// src/lib/db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { dogs, settings } from './schema';

// Create database connection
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite);

// Dog helper functions
export async function getDogs() {
  return db.select().from(dogs);
}

export async function createDog(data: {
  name: string;
  breed: string;
  postUrl: string;
  imageUrl: string;
  description: string;
  scrapedAt: Date;
}) {
  return db
    .insert(dogs)
    .values({
      ...data,
      scrapedAt: data.scrapedAt,
    })
    .returning();
}

export async function getDogById(id: number) {
  return db.select().from(dogs).where(eq(dogs.id, id)).limit(1);
}

export async function updateDog(
  id: number,
  data: Partial<{
    name: string;
    breed: string;
    postUrl: string;
    imageUrl: string;
    description: string;
    scrapedAt: Date;
  }>
) {
  return db
    .update(dogs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(dogs.id, id))
    .returning();
}

export async function deleteDog(id: number) {
  return db.delete(dogs).where(eq(dogs.id, id)).returning();
}

// Settings helper functions
export async function getSetting(key: string) {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return result[0]?.value || null;
}

export async function setSetting(key: string, value: string) {
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(settings)
      .set({
        value,
        updatedAt: new Date(),
      })
      .where(eq(settings.key, key))
      .returning();
  } else {
    return db
      .insert(settings)
      .values({
        key,
        value,
      })
      .returning();
  }
}

export async function getAllSettings() {
  return db.select().from(settings);
}
