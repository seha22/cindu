import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingArticles = await storage.getArticles();
  if (existingArticles.length === 0) {
    await storage.createArticle({
      title: "Ramadan Penuh Berkah: 1.000 Paket Sembako Tersalurkan",
      excerpt: "Alhamdulillah, melalui program Ramadan Berkah, kami berhasil menyalurkan 1.000 paket sembako kepada keluarga dhuafa di 5 kota.",
      content: "Bulan Ramadan tahun ini menjadi momen istimewa bagi Yayasan Cinta Dhuafa. Dengan dukungan para donatur yang luar biasa, kami berhasil mengumpulkan dan menyalurkan 1.000 paket sembako kepada keluarga-keluarga dhuafa yang tersebar di 5 kota besar. Setiap paket berisi beras 10 kg, minyak goreng, gula, teh, dan kebutuhan pokok lainnya yang cukup untuk memenuhi kebutuhan satu keluarga selama sebulan penuh.\n\nPenyaluran dilakukan secara langsung door-to-door untuk memastikan bantuan tepat sasaran. Tim relawan kami turun langsung ke lapangan, mengunjungi rumah-rumah warga yang telah didata sebelumnya oleh mitra lokal di setiap kota.\n\nKami mengucapkan terima kasih yang sebesar-besarnya kepada seluruh donatur yang telah mempercayakan amanahnya kepada kami. Semoga setiap kebaikan yang diberikan menjadi ladang pahala di bulan yang mulia ini.",
      imageUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop",
      author: "Tim Redaksi",
      category: "Laporan Program",
    });
    await storage.createArticle({
      title: "Beasiswa Cinta Dhuafa: Mengantarkan Mimpi Anak Yatim ke Perguruan Tinggi",
      excerpt: "Tahun ini, 50 anak yatim berprestasi mendapatkan beasiswa penuh untuk melanjutkan pendidikan ke jenjang perguruan tinggi.",
      content: "Pendidikan adalah kunci untuk memutus rantai kemiskinan. Dengan keyakinan ini, Yayasan Cinta Dhuafa kembali meluncurkan Program Beasiswa untuk anak-anak yatim berprestasi di seluruh Indonesia.\n\nTahun ini, sebanyak 50 anak yatim terpilih mendapatkan beasiswa penuh yang mencakup biaya kuliah, buku, dan biaya hidup selama masa studi. Para penerima beasiswa ini berasal dari berbagai daerah dan telah melewati proses seleksi yang ketat berdasarkan prestasi akademik dan kondisi ekonomi.\n\nSalah satu penerima beasiswa, Aisyah dari Surabaya, mengungkapkan rasa syukurnya. 'Saya tidak pernah membayangkan bisa kuliah. Terima kasih Cinta Dhuafa dan para donatur yang telah memberi saya kesempatan ini,' ujarnya dengan mata berkaca-kaca.\n\nProgram beasiswa ini tidak hanya memberikan bantuan finansial, tetapi juga pendampingan akademik dan pembinaan karakter secara berkelanjutan.",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
      author: "Ahmad Fauzi",
      category: "Berita",
    });
    await storage.createArticle({
      title: "Tips Menghitung Zakat Penghasilan dengan Benar",
      excerpt: "Panduan lengkap cara menghitung zakat penghasilan sesuai dengan ketentuan syariat Islam yang dapat Anda praktikkan.",
      content: "Zakat penghasilan atau zakat profesi adalah zakat yang dikeluarkan dari penghasilan yang diperoleh dari pekerjaan atau profesi tertentu. Berikut panduan lengkap untuk menghitung zakat penghasilan Anda.\n\nNishab zakat penghasilan setara dengan 85 gram emas per tahun. Jika penghasilan Anda dalam setahun telah mencapai nishab, maka Anda wajib mengeluarkan zakat sebesar 2,5% dari total penghasilan bruto.\n\nContoh perhitungan:\n- Gaji per bulan: Rp 10.000.000\n- Total per tahun: Rp 120.000.000\n- Nishab (85 gram emas x Rp 1.000.000/gram): Rp 85.000.000\n- Karena Rp 120.000.000 > Rp 85.000.000, maka wajib zakat\n- Zakat per tahun: 2,5% x Rp 120.000.000 = Rp 3.000.000\n- Zakat per bulan: Rp 250.000\n\nAnda dapat menunaikan zakat secara bulanan atau tahunan sesuai kenyamanan. Yang terpenting adalah niat dan konsistensi dalam menunaikan kewajiban ini.",
      imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2072&auto=format&fit=crop",
      author: "Ustadz Hasan",
      category: "Edukasi",
    });
    await storage.createArticle({
      title: "Kisah Inspiratif: Dari Penerima Manfaat Menjadi Donatur Tetap",
      excerpt: "Bapak Suryadi, mantan penerima bantuan, kini menjadi donatur tetap yang rutin menyisihkan sebagian rezekinya untuk sesama.",
      content: "Kisah Bapak Suryadi adalah bukti nyata bahwa kebaikan akan selalu berbalas kebaikan. Lima tahun lalu, Bapak Suryadi adalah seorang pedagang kecil yang kesulitan memenuhi kebutuhan keluarganya. Ia menjadi salah satu penerima bantuan modal usaha dari Yayasan Cinta Dhuafa.\n\nDengan modal sebesar Rp 5.000.000, Bapak Suryadi memulai usaha warung makan sederhana di pinggir jalan. Berkat kerja keras dan keuletan, usahanya berkembang pesat. Kini ia memiliki dua cabang warung dan mempekerjakan 8 orang karyawan.\n\n'Saya tidak akan pernah lupa masa-masa sulit itu. Sekarang giliran saya membantu orang lain,' ujar Bapak Suryadi. Setiap bulan, ia rutin mendonasikan Rp 1.000.000 melalui Yayasan Cinta Dhuafa.\n\nKisah Bapak Suryadi menginspirasi kita semua bahwa setiap bantuan yang kita berikan, sekecil apapun, bisa mengubah hidup seseorang selamanya.",
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
      content: "Program Bantuan Pangan Dhuafa merupakan program unggulan Yayasan Cinta Dhuafa yang bertujuan untuk membantu keluarga-keluarga dhuafa yang kesulitan memenuhi kebutuhan pangan sehari-hari.\n\nSetiap paket sembako yang disalurkan berisi:\n- Beras 10 kg\n- Minyak goreng 2 liter\n- Gula pasir 2 kg\n- Teh dan kopi\n- Mie instan\n- Susu untuk anak-anak\n\nPenyaluran dilakukan setiap bulan secara rutin ke daerah-daerah yang telah disurvei oleh tim lapangan kami. Kami memastikan setiap bantuan tepat sasaran dan sampai ke tangan yang berhak menerimanya.\n\nDengan berdonasi di program ini, Anda turut membantu meringankan beban keluarga dhuafa dan memastikan mereka tidak kelaparan. Semoga setiap butir nasi yang tersaji menjadi saksi kebaikan Anda.",
      targetAmount: 50000000,
      currentAmount: 12500000,
      donorCount: 156,
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
    });
    
    const p2 = await storage.createProgram({
      title: "Beasiswa Anak Yatim",
      description: "Memberikan beasiswa pendidikan penuh bagi anak yatim berprestasi untuk memastikan mereka dapat terus bersekolah hingga ke perguruan tinggi.",
      content: "Program Beasiswa Anak Yatim adalah bentuk kepedulian kami terhadap masa depan anak-anak yatim di Indonesia. Kami percaya bahwa pendidikan adalah kunci untuk memutus rantai kemiskinan.\n\nCakupan beasiswa meliputi:\n- Biaya pendidikan (SPP) penuh\n- Buku dan alat tulis\n- Seragam sekolah\n- Biaya transportasi\n- Bimbingan belajar\n- Pembinaan karakter dan mental\n\nPenerima beasiswa dipilih berdasarkan:\n- Status yatim/piatu/dhuafa\n- Prestasi akademik\n- Motivasi belajar yang tinggi\n- Rekomendasi dari sekolah/pesantren\n\nSelain bantuan finansial, kami juga memberikan pendampingan berupa mentoring dan pembinaan karakter secara berkala. Tujuannya agar anak-anak yatim tidak hanya cerdas secara akademik, tetapi juga memiliki akhlak yang baik dan siap berkontribusi untuk masyarakat.",
      targetAmount: 100000000,
      currentAmount: 45000000,
      donorCount: 289,
      imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop",
    });

    const p3 = await storage.createProgram({
      title: "Pembangunan Sumur Air Bersih",
      description: "Membangun fasilitas sumur dan MCK untuk warga di daerah kekeringan yang kesulitan mengakses air bersih.",
      content: "Program Pembangunan Sumur Air Bersih hadir untuk menjawab kebutuhan mendasar masyarakat di daerah-daerah yang mengalami krisis air bersih. Air bersih adalah hak setiap manusia, namun masih banyak saudara kita yang harus berjalan berkilo-kilo meter hanya untuk mendapatkan air.\n\nTarget pembangunan:\n- Sumur bor kedalaman 50-100 meter\n- Fasilitas MCK (Mandi, Cuci, Kakus)\n- Instalasi pipa distribusi air\n- Tandon penampungan air\n\nLokasi prioritas:\n- Daerah kekeringan di NTT dan NTB\n- Wilayah pedalaman Kalimantan\n- Desa-desa terpencil di Sulawesi\n- Kawasan perbukitan Jawa Timur\n\nSetiap sumur yang terbangun dapat melayani 50-100 kepala keluarga. Dengan berdonasi di program ini, Anda memberikan akses air bersih yang menjadi sumber kehidupan bagi mereka.",
      targetAmount: 75000000,
      currentAmount: 32000000,
      donorCount: 203,
      imageUrl: "https://images.unsplash.com/photo-1541888046830-5896a2c206d2?q=80&w=2070&auto=format&fit=crop",
    });

    await storage.createDonation({ programId: p1.id, donorName: "Ahmad Fadillah", amount: 500000, message: "Semoga bermanfaat untuk saudara-saudara kita yang membutuhkan. Barakallahu fiikum." });
    await storage.createDonation({ programId: p1.id, donorName: "Hamba Allah", amount: 100000, message: "Lillahi ta'ala, semoga Allah memudahkan urusan mereka." });
    await storage.createDonation({ programId: p1.id, donorName: "Siti Aminah", amount: 250000, message: "Ya Allah, terimalah sedekah ini dan jadikanlah pemberat timbangan amal kebaikan kami." });
    await storage.createDonation({ programId: p1.id, donorName: "Muhammad Rizki", amount: 1000000, message: "Semoga menjadi amal jariyah yang tidak terputus pahalanya." });
    await storage.createDonation({ programId: p1.id, donorName: "Hamba Allah", amount: 50000, message: null });
    await storage.createDonation({ programId: p2.id, donorName: "Fatimah Az-Zahra", amount: 2000000, message: "Untuk adik-adik yatim, tetap semangat menuntut ilmu. Semoga Allah mudahkan jalan kalian." });
    await storage.createDonation({ programId: p2.id, donorName: "Keluarga Besar Hasan", amount: 5000000, message: "Semoga ilmu yang didapat menjadi berkah dunia dan akhirat." });
    await storage.createDonation({ programId: p2.id, donorName: "Hamba Allah", amount: 300000, message: "Allahumma baarik lahum fii ilmihim." });
    await storage.createDonation({ programId: p3.id, donorName: "Umar Hakim", amount: 1500000, message: "Semoga sumur ini menjadi amal jariyah yang terus mengalir pahalanya." });
    await storage.createDonation({ programId: p3.id, donorName: "Aisyah Putri", amount: 750000, message: "Ya Allah, jadikanlah air ini sumber keberkahan bagi mereka." });
    await storage.createDonation({ programId: p3.id, donorName: "Hamba Allah", amount: 200000, message: null });
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

  app.get(api.programDonations.list.path, async (req, res) => {
    const donationsList = await storage.getDonationsByProgram(Number(req.params.id));
    res.json(donationsList);
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

  app.get(api.articles.list.path, async (req, res) => {
    const articlesList = await storage.getArticles();
    res.json(articlesList);
  });

  app.get(api.articles.get.path, async (req, res) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  });

  seedDatabase().catch(console.error);

  return httpServer;
}
