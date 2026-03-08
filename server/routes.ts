import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import passport from "passport";
import { setupAuth, requireAuth, requireAdmin, hashPassword } from "./auth";
import { createSnapTransaction, getClientKey, verifySignatureKey } from "./midtrans";
import { insertArticleSchema, insertProgramSchema, insertCmsPageSchema } from "@shared/schema";

async function seedDatabase() {
  const existingArticles = await storage.getArticles();
  if (existingArticles.length === 0) {
    await storage.createArticle({
      title: "Ramadan Penuh Berkah: 1.000 Paket Sembako Tersalurkan",
      excerpt: "Alhamdulillah, melalui program Ramadan Berkah, kami berhasil menyalurkan 1.000 paket sembako kepada keluarga dhuafa di 5 kota.",
      content: "Bulan Ramadan tahun ini menjadi momen istimewa bagi Yayasan Cinta Dhuafa. Dengan dukungan para donatur yang luar biasa, kami berhasil mengumpulkan dan menyalurkan 1.000 paket sembako kepada keluarga-keluarga dhuafa yang tersebar di 5 kota besar.",
      imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop",
      author: "Tim Redaksi",
      category: "Laporan Program",
    });
    await storage.createArticle({
      title: "Beasiswa Cinta Dhuafa: Mengantarkan Mimpi Anak Yatim ke Perguruan Tinggi",
      excerpt: "Tahun ini, 50 anak yatim berprestasi mendapatkan beasiswa penuh untuk melanjutkan pendidikan ke jenjang perguruan tinggi.",
      content: "Pendidikan adalah kunci untuk memutus rantai kemiskinan. Dengan keyakinan ini, Yayasan Cinta Dhuafa kembali meluncurkan Program Beasiswa untuk anak-anak yatim berprestasi di seluruh Indonesia.",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
      author: "Ahmad Fauzi",
      category: "Berita",
    });
    await storage.createArticle({
      title: "Tips Menghitung Zakat Penghasilan dengan Benar",
      excerpt: "Panduan lengkap cara menghitung zakat penghasilan sesuai dengan ketentuan syariat Islam yang dapat Anda praktikkan.",
      content: "Zakat penghasilan atau zakat profesi adalah zakat yang dikeluarkan dari penghasilan yang diperoleh dari pekerjaan atau profesi tertentu.",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2072&auto=format&fit=crop",
      author: "Ustadz Hasan",
      category: "Edukasi",
    });
    await storage.createArticle({
      title: "Kisah Inspiratif: Dari Penerima Manfaat Menjadi Donatur Tetap",
      excerpt: "Bapak Suryadi, mantan penerima bantuan, kini menjadi donatur tetap yang rutin menyisihkan sebagian rezekinya untuk sesama.",
      content: "Kisah Bapak Suryadi adalah bukti nyata bahwa kebaikan akan selalu berbalas kebaikan.",
      imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop",
      author: "Siti Nurhaliza",
      category: "Inspirasi",
    });
  }

  const existingPrograms = await storage.getPrograms();
  if (existingPrograms.length === 0) {
    const p1 = await storage.createProgram({
      title: "Bantuan Pangan Dhuafa",
      description: "Program penyaluran paket sembako untuk keluarga dhuafa di pelosok desa yang kesulitan memenuhi kebutuhan pokok sehari-hari.",
      content: "Program Bantuan Pangan Dhuafa merupakan program unggulan Yayasan Cinta Dhuafa.",
      targetAmount: 50000000,
      currentAmount: 12500000,
      donorCount: 156,
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
    });
    const p2 = await storage.createProgram({
      title: "Beasiswa Anak Yatim",
      description: "Memberikan beasiswa pendidikan penuh bagi anak yatim berprestasi.",
      content: "Program Beasiswa Anak Yatim adalah bentuk kepedulian kami terhadap masa depan anak-anak yatim di Indonesia.",
      targetAmount: 100000000,
      currentAmount: 45000000,
      donorCount: 289,
      imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop",
    });
    const p3 = await storage.createProgram({
      title: "Pembangunan Sumur Air Bersih",
      description: "Membangun fasilitas sumur dan MCK untuk warga di daerah kekeringan.",
      content: "Program Pembangunan Sumur Air Bersih hadir untuk menjawab kebutuhan mendasar masyarakat.",
      targetAmount: 75000000,
      currentAmount: 32000000,
      donorCount: 203,
      imageUrl: "https://images.unsplash.com/photo-1541888046830-5896a2c206d2?q=80&w=2070&auto=format&fit=crop",
    });

    await storage.createDonation({ programId: p1.id, donorName: "Ahmad Fadillah", amount: 500000, message: "Semoga bermanfaat.", paymentStatus: "settlement" });
    await storage.createDonation({ programId: p1.id, donorName: "Hamba Allah", amount: 100000, message: "Lillahi ta'ala.", paymentStatus: "settlement" });
    await storage.createDonation({ programId: p1.id, donorName: "Siti Aminah", amount: 250000, message: "Semoga Allah memudahkan.", paymentStatus: "settlement" });
    await storage.createDonation({ programId: p2.id, donorName: "Fatimah Az-Zahra", amount: 2000000, message: "Untuk adik-adik yatim.", paymentStatus: "settlement" });
    await storage.createDonation({ programId: p2.id, donorName: "Keluarga Besar Hasan", amount: 5000000, message: "Semoga berkah.", paymentStatus: "settlement" });
    await storage.createDonation({ programId: p3.id, donorName: "Umar Hakim", amount: 1500000, message: "Amal jariyah.", paymentStatus: "settlement" });
    await storage.createDonation({ programId: p3.id, donorName: "Aisyah Putri", amount: 750000, message: "Sumber keberkahan.", paymentStatus: "settlement" });
  }

  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    await storage.createUser({
      username: "admin",
      email: "admin@cintadhuafa.org",
      password: hashPassword("admin123"),
      role: "admin",
      fullName: "Administrator",
      phone: null,
      address: null,
    });
  }

  const existingCms = await storage.getCmsPages();
  if (existingCms.length === 0) {
    await storage.upsertCmsPage({
      slug: "sejarah",
      title: "Sejarah Yayasan",
      content: JSON.stringify({
        intro: "Yayasan Cinta Dhuafa didirikan pada tahun 2010 oleh sekelompok pemuda yang memiliki kepedulian tinggi terhadap nasib kaum dhuafa di Indonesia.",
        timeline: [
          { year: "2010", title: "Pendirian Yayasan", description: "Yayasan Cinta Dhuafa resmi didirikan di Jakarta dengan fokus pada program bantuan pangan." },
          { year: "2013", title: "Ekspansi Program", description: "Memperluas program ke bidang pendidikan dengan meluncurkan Program Beasiswa Anak Yatim." },
          { year: "2016", title: "Jangkauan Nasional", description: "Program telah menjangkau 15 provinsi di seluruh Indonesia." },
          { year: "2020", title: "10 Tahun Dedikasi", description: "Merayakan satu dekade pelayanan dengan lebih dari 50.000 penerima manfaat." },
          { year: "2024", title: "Era Digital", description: "Meluncurkan platform digital untuk memudahkan donatur dalam berdonasi." }
        ]
      }),
    });
    await storage.upsertCmsPage({
      slug: "visi-misi",
      title: "Visi & Misi",
      content: JSON.stringify({
        visi: "Menjadi yayasan terdepan dalam memberdayakan kaum dhuafa menuju kehidupan yang mandiri dan bermartabat.",
        misi: [
          "Menyalurkan bantuan pangan dan kebutuhan pokok kepada keluarga dhuafa",
          "Memberikan akses pendidikan berkualitas bagi anak yatim dan dhuafa",
          "Membangun fasilitas air bersih di daerah yang membutuhkan",
          "Memberdayakan ekonomi masyarakat melalui program pelatihan dan modal usaha",
          "Menjalin kerjasama dengan berbagai pihak untuk memperluas dampak sosial"
        ],
        values: [
          { title: "Amanah", description: "Menjaga kepercayaan donatur dengan transparansi dan akuntabilitas" },
          { title: "Profesional", description: "Mengelola program dengan standar manajemen yang baik" },
          { title: "Peduli", description: "Mengutamakan kepentingan penerima manfaat" },
          { title: "Inovatif", description: "Terus berinovasi dalam program dan pelayanan" }
        ]
      }),
    });
    await storage.upsertCmsPage({
      slug: "struktur-organisasi",
      title: "Struktur Organisasi",
      content: JSON.stringify({
        description: "Struktur organisasi Yayasan Cinta Dhuafa terdiri dari para profesional yang berdedikasi tinggi.",
        members: [
          { name: "Dr. H. Ahmad Sulaiman", position: "Ketua Yayasan", image: "" },
          { name: "Hj. Fatimah Azzahra, M.Pd", position: "Wakil Ketua", image: "" },
          { name: "Ustadz Muhammad Hasan", position: "Sekretaris Jenderal", image: "" },
          { name: "Ir. Abdullah Rahman", position: "Bendahara", image: "" },
          { name: "Siti Khadijah, S.Sos", position: "Direktur Program", image: "" },
          { name: "Ahmad Fauzi, SE", position: "Direktur Keuangan", image: "" }
        ]
      }),
    });
    await storage.upsertCmsPage({
      slug: "program",
      title: "Program Kami",
      content: JSON.stringify({
        intro: "Yayasan Cinta Dhuafa menjalankan berbagai program pemberdayaan masyarakat yang berfokus pada empat pilar utama.",
        areas: [
          { title: "Pendidikan", description: "Program beasiswa dan bantuan pendidikan untuk anak yatim dan dhuafa.", icon: "GraduationCap" },
          { title: "Kesehatan", description: "Layanan kesehatan gratis dan bantuan biaya pengobatan.", icon: "Heart" },
          { title: "Ekonomi", description: "Program pemberdayaan ekonomi melalui pelatihan dan modal usaha.", icon: "TrendingUp" },
          { title: "Sosial", description: "Bantuan pangan, air bersih, dan kebutuhan dasar masyarakat.", icon: "Users" }
        ]
      }),
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  setupAuth(app);

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, fullName, phone, address } = req.body;
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({ message: "Username, email, password, dan nama lengkap wajib diisi" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }
      const user = await storage.createUser({
        username,
        email,
        password: hashPassword(password),
        role: "orang_tua_asuh",
        fullName,
        phone: phone || null,
        address: address || null,
      });
      const { password: _, ...userWithoutPassword } = user;
      req.login(userWithoutPassword as Express.User, (err) => {
        if (err) return res.status(500).json({ message: "Login gagal setelah registrasi" });
        return res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ message: "Terjadi kesalahan saat registrasi" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: "Terjadi kesalahan" });
      if (!user) return res.status(401).json({ message: info?.message || "Login gagal" });
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login gagal" });
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout gagal" });
      res.json({ message: "Berhasil logout" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  app.get("/api/programs", async (_req, res) => {
    const programsList = await storage.getPrograms();
    res.json(programsList);
  });

  app.get("/api/programs/:id", async (req, res) => {
    const program = await storage.getProgram(Number(req.params.id));
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  });

  app.post("/api/programs", requireAdmin, async (req, res) => {
    try {
      const input = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(input);
      res.status(201).json(program);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      throw err;
    }
  });

  app.put("/api/programs/:id", requireAdmin, async (req, res) => {
    const updated = await storage.updateProgram(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Program not found" });
    res.json(updated);
  });

  app.delete("/api/programs/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteProgram(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Program not found" });
    res.json({ message: "Program deleted" });
  });

  app.get("/api/programs/:id/donations", async (req, res) => {
    const donationsList = await storage.getDonationsByProgram(Number(req.params.id));
    const sanitized = donationsList
      .filter(d => d.paymentStatus === "settlement")
      .map(d => ({
        id: d.id,
        donorName: d.donorName,
        amount: d.amount,
        message: d.message,
        createdAt: d.createdAt,
      }));
    res.json(sanitized);
  });

  app.get("/api/donations", requireAdmin, async (_req, res) => {
    const donationsList = await storage.getDonations();
    res.json(donationsList);
  });

  app.post("/api/donations/create-payment", async (req, res) => {
    try {
      const { programId, donorName, donorEmail, amount, message } = req.body;
      if (!programId || !donorName || !amount) {
        return res.status(400).json({ message: "Data donasi tidak lengkap" });
      }
      const program = await storage.getProgram(programId);
      if (!program) return res.status(404).json({ message: "Program not found" });

      const orderId = `DONATION-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const userId = req.isAuthenticated() ? (req.user as any).id : null;

      const donation = await storage.createDonation({
        programId,
        userId,
        donorName,
        donorEmail: donorEmail || null,
        amount,
        message: message || null,
        paymentStatus: "pending",
        midtransOrderId: orderId,
      });

      try {
        const snapResult = await createSnapTransaction({
          orderId,
          grossAmount: amount,
          donorName,
          donorEmail,
          programTitle: program.title,
        });

        res.json({
          donation,
          snapToken: snapResult.token,
          redirectUrl: snapResult.redirect_url,
        });
      } catch (midtransError: any) {
        res.json({
          donation,
          snapToken: null,
          redirectUrl: null,
          midtransError: "Midtrans belum dikonfigurasi. Donasi tercatat dengan status pending.",
        });
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      return res.status(500).json({ message: "Gagal membuat pembayaran" });
    }
  });

  app.post("/api/midtrans/notification", async (req, res) => {
    try {
      const { order_id, transaction_status, transaction_id, signature_key, status_code, gross_amount } = req.body;
      if (!order_id) return res.status(400).json({ message: "Invalid notification" });

      if (signature_key && status_code && gross_amount) {
        const isValid = verifySignatureKey(order_id, status_code, gross_amount, signature_key);
        if (!isValid) {
          console.error("Invalid Midtrans signature for order:", order_id);
          return res.status(403).json({ message: "Invalid signature" });
        }
      }

      const donation = await storage.getDonationByOrderId(order_id);
      if (!donation) return res.status(404).json({ message: "Donation not found" });

      let newStatus = "pending";
      if (transaction_status === "capture" || transaction_status === "settlement") {
        newStatus = "settlement";
      } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
        newStatus = "failed";
      }

      const previousStatus = donation.paymentStatus;
      if (previousStatus === newStatus) {
        return res.json({ message: "OK" });
      }

      await storage.updateDonationStatus(donation.id, newStatus, previousStatus, transaction_id);
      res.json({ message: "OK" });
    } catch (err) {
      console.error("Midtrans notification error:", err);
      return res.status(500).json({ message: "Error processing notification" });
    }
  });

  app.get("/api/articles", async (_req, res) => {
    const articlesList = await storage.getArticles();
    res.json(articlesList);
  });

  app.get("/api/articles/:id", async (req, res) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  });

  app.post("/api/articles", requireAdmin, async (req, res) => {
    try {
      const input = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(input);
      res.status(201).json(article);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      throw err;
    }
  });

  app.put("/api/articles/:id", requireAdmin, async (req, res) => {
    const updated = await storage.updateArticle(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Article not found" });
    res.json(updated);
  });

  app.delete("/api/articles/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteArticle(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  });

  app.get("/api/cms/:slug", async (req, res) => {
    const page = await storage.getCmsPage(req.params.slug);
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  });

  app.get("/api/cms", async (_req, res) => {
    const pages = await storage.getCmsPages();
    res.json(pages);
  });

  app.put("/api/cms/:slug", requireAdmin, async (req, res) => {
    try {
      const page = await storage.upsertCmsPage({
        slug: req.params.slug,
        title: req.body.title,
        content: req.body.content,
      });
      res.json(page);
    } catch (err) {
      console.error("CMS update error:", err);
      return res.status(500).json({ message: "Gagal memperbarui halaman" });
    }
  });

  app.get("/api/user/donations", requireAuth, async (req, res) => {
    const userDonations = await storage.getDonationsByUser((req.user as any).id);
    res.json(userDonations);
  });

  app.put("/api/user/profile", requireAuth, async (req, res) => {
    const { fullName, phone, address, email } = req.body;
    const updated = await storage.updateUser((req.user as any).id, {
      fullName,
      phone,
      address,
      email,
    });
    if (!updated) return res.status(404).json({ message: "User not found" });
    const { password: _, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  });

  app.get("/api/midtrans/client-key", (_req, res) => {
    res.json({ clientKey: getClientKey() });
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const allPrograms = await storage.getPrograms();
    const allDonations = await storage.getDonations();
    const allArticles = await storage.getArticles();

    const totalDonations = allDonations
      .filter(d => d.paymentStatus === "settlement")
      .reduce((sum, d) => sum + d.amount, 0);

    res.json({
      totalPrograms: allPrograms.length,
      totalDonations,
      totalDonors: allDonations.filter(d => d.paymentStatus === "settlement").length,
      totalArticles: allArticles.length,
    });
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    const allUsers = await storage.getUsersByRole("orang_tua_asuh");
    const allDonations = await storage.getDonations();

    const usersWithStats = allUsers.map(u => {
      const userDonations = allDonations.filter(d => d.userId === u.id && d.paymentStatus === "settlement");
      const { password: _, ...userWithoutPassword } = u;
      return {
        ...userWithoutPassword,
        totalDonations: userDonations.reduce((sum, d) => sum + d.amount, 0),
        donationCount: userDonations.length,
      };
    });

    res.json(usersWithStats);
  });

  app.get("/api/admin/users/:id/donations", requireAdmin, async (req, res) => {
    const userDonations = await storage.getDonationsByUser(Number(req.params.id));
    res.json(userDonations);
  });

  app.get("/api/admin/reports", requireAdmin, async (_req, res) => {
    const allPrograms = await storage.getPrograms();
    const allDonations = await storage.getDonations();
    const allUsers = await storage.getUsersByRole("orang_tua_asuh");

    const settledDonations = allDonations.filter(d => d.paymentStatus === "settlement");

    const programStats = allPrograms.map(p => {
      const programDonations = settledDonations.filter(d => d.programId === p.id);
      return {
        id: p.id,
        title: p.title,
        targetAmount: p.targetAmount,
        currentAmount: p.currentAmount,
        donorCount: p.donorCount,
        percentage: p.targetAmount > 0 ? Math.round((p.currentAmount / p.targetAmount) * 100) : 0,
        totalFromDonations: programDonations.reduce((sum, d) => sum + d.amount, 0),
      };
    });

    const monthlyMap = new Map<string, { amount: number; count: number }>();
    settledDonations.forEach(d => {
      if (!d.createdAt) return;
      const date = new Date(d.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(key) || { amount: 0, count: 0 };
      existing.amount += d.amount;
      existing.count += 1;
      monthlyMap.set(key, existing);
    });
    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month));

    const donorMap = new Map<string, { name: string; amount: number; count: number }>();
    settledDonations.forEach(d => {
      const key = d.donorName;
      const existing = donorMap.get(key) || { name: key, amount: 0, count: 0 };
      existing.amount += d.amount;
      existing.count += 1;
      donorMap.set(key, existing);
    });
    const topDonors = Array.from(donorMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    res.json({
      overview: {
        totalUsers: allUsers.length,
        totalSettledDonations: settledDonations.length,
        totalAmount: settledDonations.reduce((sum, d) => sum + d.amount, 0),
        totalPrograms: allPrograms.length,
        pendingDonations: allDonations.filter(d => d.paymentStatus === "pending").length,
      },
      programStats,
      monthlyStats,
      topDonors,
    });
  });

  seedDatabase().catch(console.error);

  return httpServer;
}
