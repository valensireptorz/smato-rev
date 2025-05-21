// routes/presensi.js

const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Update the detail route in routes/presensi.js

// ✅ Tampilkan detail presensi (siapa saja yang sudah presensi dan belum presensi) berdasarkan id_absen
router.get("/detail/:id_absen", async (req, res) => {
  try {
    const { id_absen } = req.params;
    console.log("🔍 Frontend request detail untuk id_absen:", id_absen);
    
    // Make the API request to get comprehensive attendance data
    const response = await fetch(`http://192.168.100.23:3000/api/presensi/detail/${id_absen}`);
    
    // Check if response was successful
    if (!response.ok) {
      console.log(`❌ API error: ${response.status} ${response.statusText}`);
      req.flash("messageError", `API error (${response.status}): ${response.statusText}`);
      return res.redirect("/absen");
    }

    // Parse the response data
    const data = await response.json();
    console.log("📦 Data dari API:", JSON.stringify(data, null, 2));

    if (!data.success) {
      console.log("⚠️ API response success=false:", data.message);
      req.flash("messageError", data.message || "Data detail presensi tidak ditemukan");
      // Still continue to render the page with empty data
    }

    // Calculate attendance statistics
    const presentCount = data.data ? data.data.length : 0;
    const absentCount = data.absentStudents ? data.absentStudents.length : 0;
    const totalCount = presentCount + absentCount;
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    console.log(`📊 Statistik kehadiran: ${presentCount} hadir, ${absentCount} tidak hadir (${attendanceRate}%)`);

    // Render the view with complete data
    res.render("presensi/detail", {
      detailPresensi: data.data || [],
      absentStudents: data.absentStudents || [],
      absenInfo: data.absenInfo || {},
      statistics: {
        present: presentCount,
        absent: absentCount,
        total: totalCount,
        rate: attendanceRate
      },
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
    });
  } catch (error) {
    console.error("❌ Frontend error:", error);
    req.flash("messageError", "Terjadi kesalahan koneksi ke server");
    res.redirect("/absen");
  }
});


// ✅ Tampilkan semua data presensi (khusus admin)
router.get("/semua", async (req, res) => {
  try {
    const response = await fetch("http://192.168.100.23:3000/api/presensi/semua");
    
    if (!response.ok) {
      console.log(`API error: ${response.status} ${response.statusText}`);
      return res.render("presensi/index", {
        riwayatPresensi: [],
        success: req.flash("success"),
        messageError: [`API tidak dapat diakses (${response.status})`],
        level: req.session.level,
      });
    }

    const data = await response.json();

    if (!data.success) {
      return res.render("presensi/index", {
        riwayatPresensi: [],
        success: req.flash("success"),
        messageError: ["Data presensi tidak ditemukan"],
        level: req.session.level,
      });
    }

    res.render("presensi/index", {
      riwayatPresensi: data.data,
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
    });
  } catch (error) {
    console.error("Gagal ambil semua data presensi:", error);
    res.render("presensi/index", {
      riwayatPresensi: [],
      success: req.flash("success"),
      messageError: ["Terjadi kesalahan koneksi ke server"],
      level: req.session.level,
    });
  }
});

// ✅ Tampilkan data presensi per mata pelajaran
router.get("/mapel/:id_mapel", async (req, res) => {
  try {
    const { id_mapel } = req.params;
    const response = await fetch(`http://192.168.100.23:3000/api/presensi/mapel/${id_mapel}`);
    
    // Cek apakah response berhasil
    if (!response.ok) {
      console.log(`API endpoint error: ${response.status} ${response.statusText}`);
      return res.render("presensi/mapel", {
        riwayatPresensi: [],
        success: req.flash("success"),
        messageError: [`API endpoint tidak dapat diakses (${response.status})`],
        level: req.session.level,
        id_mapel: id_mapel,
        nama_mapel: '',
      });
    }

    const data = await response.json();

    if (!data.success) {
      return res.render("presensi/mapel", {
        riwayatPresensi: [],
        success: req.flash("success"),
        messageError: ["Data presensi tidak ditemukan untuk mata pelajaran ini"],
        level: req.session.level,
        id_mapel: id_mapel,
        nama_mapel: '',
      });
    }

    res.render("presensi/mapel", {
      riwayatPresensi: data.data,
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
      id_mapel: id_mapel,
      nama_mapel: data.data.length > 0 ? data.data[0].nama_mapel : '',
    });
  } catch (error) {
    console.error("Gagal ambil data presensi per mapel:", error);
    
    // Render halaman dengan pesan error yang user-friendly
    res.render("presensi/mapel", {
      riwayatPresensi: [],
      success: req.flash("success"),
      messageError: ["Terjadi kesalahan koneksi ke server"],
      level: req.session.level,
      id_mapel: req.params.id_mapel,
      nama_mapel: '',
    });
  }
});

// ✅ Tampilkan detail presensi (siapa saja yang sudah presensi) berdasarkan id_absen
router.get("/detail/:id_absen", async (req, res) => {
  try {
    const { id_absen } = req.params;
    console.log("🔍 Frontend request detail untuk id_absen:", id_absen);
    
    const response = await fetch(`http://192.168.100.23:3000/api/presensi/detail/${id_absen}`);
    
    // Cek apakah response berhasil
    if (!response.ok) {
      console.log(`❌ API error: ${response.status} ${response.statusText}`);
      req.flash("messageError", `API error (${response.status}): ${response.statusText}`);
      return res.redirect("/absen");
    }

    const data = await response.json();
    console.log("📦 Data dari API:", JSON.stringify(data, null, 2));

    if (!data.success) {
      console.log("⚠️ API response success=false:", data.message);
      // Jika tidak ada data tapi success, tetap tampilkan halaman
      req.flash("messageError", data.message || "Data detail presensi tidak ditemukan");
    }

    res.render("presensi/detail", {
      detailPresensi: data.data || [],
      absenInfo: data.absenInfo || {},
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
    });
  } catch (error) {
    console.error("❌ Frontend error:", error);
    req.flash("messageError", "Terjadi kesalahan koneksi ke server");
    res.redirect("/absen");
  }
});


module.exports = router;