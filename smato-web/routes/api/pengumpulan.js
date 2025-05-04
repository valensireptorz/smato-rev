const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const moment = require("moment-timezone");
const fs = require("fs");

const Model_Pengumpulan = require("../../model/Model_Pengumpulan");

// Pastikan folder upload ada
const uploadPath = "public/images/upload";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size 10MB
});

// ✅ Ambil semua data pengumpulan (admin)
router.get("/semua", async (req, res) => {
  try {
    const semuaData = await Model_Pengumpulan.getAll();
    if (semuaData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada data pengumpulan yang ditemukan",
      });
    }
    return res.status(200).json({
      success: true,
      data: semuaData,
    });
  } catch (error) {
    console.error("Error ambil semua data pengumpulan:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ✅ Ambil data pengumpulan berdasarkan id_siswa dan id_tugas
router.get("/riwayat", async (req, res) => {
  try {
    const { id_siswa, id_tugas } = req.query;

    if (!id_siswa || !id_tugas) {
      return res.status(400).json({
        success: false,
        message: "id_siswa dan id_tugas harus diisi",
      });
    }

    const data = await Model_Pengumpulan.getAllByid_tugas_and_id_siswa(id_tugas, id_siswa);

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data pengumpulan tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error ambil riwayat pengumpulan:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ✅ Upload tugas siswa
router.post("/upload", upload.single("file_tugas"), async (req, res) => {
  try {
    // Log request body dan file untuk debugging
    console.log("📦 Body:", req.body);
    console.log("📎 File:", req.file);

    const { id_tugas, id_siswa, id_mapel, id_guru } = req.body;

    // Validasi data yang dibutuhkan
    if (!id_tugas || !id_siswa || !req.file) {
      return res.status(400).json({
        success: false,
        message: "id_tugas, id_siswa, dan file_tugas wajib diisi",
      });
    }

    const upload_time = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

    // Memastikan id_guru adalah null ketika tidak ada nilai yang valid
    const data = {
      id_tugas,
      upload_time,
      file_tugas: req.file.filename,
      id_siswa,
      id_mapel: id_mapel || null,
      id_guru: id_guru && id_guru.toLowerCase() !== 'null' ? id_guru : null,
    };

    // Simpan data pengumpulan ke database
    const simpan = await Model_Pengumpulan.Store(data);

    return res.status(200).json({
      success: true,
      message: "Pengumpulan tugas berhasil",
    });
  } catch (error) {
    console.error("❌ Error upload tugas:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ✅ Ambil detail pengumpulan berdasarkan id_pengumpulan
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Model_Pengumpulan.getId(id);

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data pengumpulan tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Error ambil data pengumpulan by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

module.exports = router;
