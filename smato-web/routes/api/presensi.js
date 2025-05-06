// routes/api/presensi_siswa.js

const express = require("express");
const router = express.Router();
const moment = require("moment-timezone"); // Import moment-timezone
const Model_Presensi = require("../../model/Model_Presensi");

// ✅ Ambil semua data presensi (khusus admin)
router.get("/semua", async function (req, res) {
  try {
    const semuaPresensi = await Model_Presensi.getAllPresensiAdmin();

    if (semuaPresensi.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada data presensi yang ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: semuaPresensi,
    });
  } catch (error) {
    console.error("Error mengambil semua data presensi:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ✅ Ambil riwayat presensi berdasarkan id_siswa
router.get("/riwayat", async function (req, res) {
  try {
    const { id_siswa } = req.query;

    if (!id_siswa) {
      return res.status(400).json({
        success: false,
        message: "id_siswa harus diisi",
      });
    }

    const riwayatPresensi = await Model_Presensi.getAllPresensi(id_siswa);

    if (riwayatPresensi.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data presensi tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      riwayatPresensi,
    });
  } catch (error) {
    console.error("Error mengambil riwayat presensi:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ✅ API Presensi Siswa
router.post("/presensi", async function (req, res) {
  try {
    const { id_siswa, id_mapel, id_absen } = req.body;

    // Validasi input
    if (!id_siswa || !id_mapel || !id_absen) {
      return res.status(400).json({
        success: false,
        message: "id_siswa, id_mapel, dan id_absen harus diisi",
      });
    }

    // Ambil tanggal dan waktu saat ini dalam zona waktu Asia/Jakarta (WIB)
    const today = moment().tz("Asia/Jakarta");
    const tanggal = today.format("YYYY-MM-DD");
    const waktu = today.format("HH:mm");

    // Cek apakah siswa sudah presensi hari ini untuk mapel tersebut
    const cekPresensi = await Model_Presensi.getPresensi(
      id_siswa,
      tanggal,
      id_mapel
    );

    if (cekPresensi.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Anda sudah presensi untuk mapel ini.",
      });
    }

    // Simpan presensi baru
    const dataPresensi = {
      id_absen,
      tanggal_presensi: tanggal,
      jam_presensi: waktu,
      status: "Sudah",
      id_siswa,
      id_mapel,
    };

    const simpan = await Model_Presensi.Store(dataPresensi);

    if (simpan) {
      return res.status(200).json({
        success: true,
        message: "Presensi berhasil dilakukan!",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan presensi.",
      });
    }
  } catch (error) {
    console.error("Error presensi siswa:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

module.exports = router;
