import { db } from "./db";
import {
  programs,
  donations,
  type InsertProgram,
  type Program,
  type InsertDonation,
  type Donation,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  getDonations(): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
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
    return newDonation;
  }
}

export const storage = new DatabaseStorage();
