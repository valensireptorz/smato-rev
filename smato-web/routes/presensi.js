// routes/presensi.js

const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


// ✅ Tampilkan semua data presensi (khusus admin)
router.get("/semua", async (req, res) => {
  try {
    const response = await fetch("http://192.168.1.68:3000/api/presensi/semua");
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
      riwayatPresensi: data.data, // karena API mengembalikan key `data`
      success: req.flash("success"),
      messageError: req.flash("messageError"),
      level: req.session.level,
    });
  } catch (error) {
    console.error("Gagal ambil semua data presensi:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat mengambil data presensi",
    });
  }
});



module.exports = router;
