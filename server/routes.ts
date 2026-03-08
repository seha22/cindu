import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingPrograms = await storage.getPrograms();
  if (existingPrograms.length === 0) {
    await storage.createProgram({
      title: "Bantuan Pangan Dhuafa",
      description: "Program penyaluran paket sembako untuk keluarga dhuafa di pelosok desa yang kesulitan memenuhi kebutuhan pokok sehari-hari.",
      targetAmount: 50000000,
      currentAmount: 12500000,
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
    });
    
    await storage.createProgram({
      title: "Beasiswa Anak Yatim",
      description: "Memberikan beasiswa pendidikan penuh bagi anak yatim berprestasi untuk memastikan mereka dapat terus bersekolah hingga ke perguruan tinggi.",
      targetAmount: 100000000,
      currentAmount: 45000000,
      imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop",
    });

    await storage.createProgram({
      title: "Pembangunan Sumur Air Bersih",
      description: "Membangun fasilitas sumur dan MCK untuk warga di daerah kekeringan yang kesulitan mengakses air bersih.",
      targetAmount: 75000000,
      currentAmount: 32000000,
      imageUrl: "https://images.unsplash.com/photo-1541888046830-5896a2c206d2?q=80&w=2070&auto=format&fit=crop",
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.programs.list.path, async (req, res) => {
    const programsList = await storage.getPrograms();
    res.json(programsList);
  });

  app.get(api.programs.get.path, async (req, res) => {
    const program = await storage.getProgram(Number(req.params.id));
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  });

  app.post(api.programs.create.path, async (req, res) => {
    try {
      const input = api.programs.create.input.parse(req.body);
      const program = await storage.createProgram(input);
      res.status(201).json(program);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.donations.list.path, async (req, res) => {
    const donationsList = await storage.getDonations();
    res.json(donationsList);
  });

  app.post(api.donations.create.path, async (req, res) => {
    try {
      const input = api.donations.create.input.parse(req.body);
      const donation = await storage.createDonation(input);
      res.status(201).json(donation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed the database
  seedDatabase().catch(console.error);

  return httpServer;
}
