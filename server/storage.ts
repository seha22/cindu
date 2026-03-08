import { db } from "./db";
import {
  programs,
  donations,
  articles,
  users,
  cmsPages,
  type InsertProgram,
  type Program,
  type InsertDonation,
  type Donation,
  type InsertArticle,
  type Article,
  type InsertUser,
  type User,
  type InsertCmsPage,
  type CmsPage,
} from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  getPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program | undefined>;
  deleteProgram(id: number): Promise<boolean>;

  getDonations(): Promise<Donation[]>;
  getDonationsByProgram(programId: number): Promise<Donation[]>;
  getDonationsByUser(userId: number): Promise<Donation[]>;
  getDonation(id: number): Promise<Donation | undefined>;
  getDonationByOrderId(orderId: string): Promise<Donation | undefined>;
  createDonation(donation: InsertDonation & { paymentStatus?: string; midtransOrderId?: string }): Promise<Donation>;
  updateDonationStatus(id: number, newStatus: string, previousStatus: string | null, transactionId?: string): Promise<Donation | undefined>;

  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;

  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;

  getCmsPage(slug: string): Promise<CmsPage | undefined>;
  getCmsPages(): Promise<CmsPage[]>;
  upsertCmsPage(page: InsertCmsPage): Promise<CmsPage>;

  getUsersByRole(role: string): Promise<User[]>;
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

  async updateProgram(id: number, data: Partial<InsertProgram>): Promise<Program | undefined> {
    const [updated] = await db.update(programs).set(data).where(eq(programs.id, id)).returning();
    return updated;
  }

  async deleteProgram(id: number): Promise<boolean> {
    const result = await db.delete(programs).where(eq(programs.id, id)).returning();
    return result.length > 0;
  }

  async getDonations(): Promise<Donation[]> {
    return await db.select().from(donations).orderBy(desc(donations.createdAt));
  }

  async getDonationsByProgram(programId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.programId, programId)).orderBy(desc(donations.createdAt));
  }

  async getDonationsByUser(userId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.userId, userId)).orderBy(desc(donations.createdAt));
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation;
  }

  async getDonationByOrderId(orderId: string): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.midtransOrderId, orderId));
    return donation;
  }

  async createDonation(donation: InsertDonation & { paymentStatus?: string; midtransOrderId?: string }): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    if (donation.paymentStatus === "settlement" || donation.paymentStatus === "capture") {
      await db.update(programs)
        .set({
          currentAmount: sql`${programs.currentAmount} + ${donation.amount}`,
          donorCount: sql`${programs.donorCount} + 1`,
        })
        .where(eq(programs.id, donation.programId));
    }
    return newDonation;
  }

  async updateDonationStatus(id: number, newStatus: string, previousStatus: string | null, transactionId?: string): Promise<Donation | undefined> {
    const updateData: any = { paymentStatus: newStatus };
    if (transactionId) {
      updateData.midtransTransactionId = transactionId;
    }
    const [updated] = await db.update(donations).set(updateData).where(eq(donations.id, id)).returning();

    if (!updated) return updated;

    const wasSettled = previousStatus === "settlement" || previousStatus === "capture";
    const isNowSettled = newStatus === "settlement" || newStatus === "capture";

    if (!wasSettled && isNowSettled) {
      await db.update(programs)
        .set({
          currentAmount: sql`${programs.currentAmount} + ${updated.amount}`,
          donorCount: sql`${programs.donorCount} + 1`,
        })
        .where(eq(programs.id, updated.programId));
    }

    return updated;
  }

  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: number, data: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updated] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getCmsPage(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return page;
  }

  async getCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }

  async upsertCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const existing = await this.getCmsPage(page.slug);
    if (existing) {
      const [updated] = await db.update(cmsPages)
        .set({ title: page.title, content: page.content, updatedAt: new Date() })
        .where(eq(cmsPages.slug, page.slug))
        .returning();
      return updated;
    }
    const [newPage] = await db.insert(cmsPages).values(page).returning();
    return newPage;
  }
}

export const storage = new DatabaseStorage();
