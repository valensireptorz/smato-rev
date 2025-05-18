// routes/api/presensi.js

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

// ✅ BARU: Ambil presensi berdasarkan mata pelajaran
router.get("/mapel/:id_mapel", async function (req, res) {
  try {
    const { id_mapel } = req.params;

    if (!id_mapel) {
      return res.status(400).json({
        success: false,
        message: "id_mapel harus diisi",
      });
    }

    const presensiMapel = await Model_Presensi.getByMapel(id_mapel);

    if (presensiMapel.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada data presensi untuk mata pelajaran ini",
      });
    }

    return res.status(200).json({
      success: true,
      data: presensiMapel,
      message: `Berhasil mengambil ${presensiMapel.length} data presensi`
    });
  } catch (error) {
    console.error("Error mengambil presensi per mapel:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ✅ BARU: Ambil detail presensi berdasarkan id_absen (siapa saja yang sudah presensi)
router.get("/detail/:id_absen", async function (req, res) {
  try {
    const { id_absen } = req.params;
    console.log("🔍 Request detail presensi untuk id_absen:", id_absen);

    if (!id_absen) {
      return res.status(400).json({
        success: false,
        message: "id_absen harus diisi",
      });
    }

    // Ambil detail presensi (daftar siswa yang hadir HANYA untuk sesi ini)
    const detailPresensi = await Model_Presensi.getDetailByAbsen(id_absen);
    
    // Ambil info absen
    const absenInfo = await Model_Presensi.getAbsenInfo(id_absen);
    console.log("📋 Info absen:", absenInfo);

    if (detailPresensi.length === 0) {
      console.log("⚠️ Belum ada siswa yang presensi untuk sesi id_absen:", id_absen);
      return res.status(200).json({
        success: true,
        message: "Belum ada siswa yang melakukan presensi untuk sesi ini",
        data: [],
        absenInfo: absenInfo
      });
    }

    console.log("✅ Berhasil mengambil detail presensi:", detailPresensi.length, "siswa");
    return res.status(200).json({
      success: true,
      data: detailPresensi,
      absenInfo: absenInfo,
      message: `${detailPresensi.length} siswa telah melakukan presensi untuk sesi ini`
    });
  } catch (error) {
    console.error("❌ Error mengambil detail presensi:", error);
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