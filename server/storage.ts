import { db } from "./db";
import {
  programs,
  donations,
  articles,
  type InsertProgram,
  type Program,
  type InsertDonation,
  type Donation,
  type InsertArticle,
  type Article,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  getDonations(): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;

  getDonationsByProgram(programId: number): Promise<Donation[]>;

  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
}

export class DatabaseStorage implements IStorage {
  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs);
  }

  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  }

  async getDonations(): Promise<Donation[]> {
    return await db.select().from(donations);
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    await db.update(programs)
      .set({
        currentAmount: sql`${programs.currentAmount} + ${donation.amount}`,
        donorCount: sql`${programs.donorCount} + 1`,
      })
      .where(eq(programs.id, donation.programId));
    return newDonation;
  }

  async getDonationsByProgram(programId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.programId, programId));
  }

  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }
}

export const storage = new DatabaseStorage();
