const express = require("express");
const router = express.Router();
const Model_Absen = require("../../model/Model_Absen.js"); // Import Model_Absen

// Route default GET
router.get("/", async (req, res) => {
  try {
    const data = await Model_Absen.getAll(); // Pastikan method ini ada
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data absen",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data absen",
      error: error.message,
    });
  }
});

// Ambil semua data absen
router.get("/getall", async (req, res) => {
  try {
    const data = await Model_Absen.getAll();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data absen",
      data: data,
    });
  } catch (error) {
    console.error("Error getAll absen:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
      error: error.message,
    });
  }
});

// Ambil data absen berdasarkan ID
router.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Model_Absen.getId(id);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data absen",
        data: data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data absen tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getById absen:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
      error: error.message,
    });
  }
});

// Tambah data absen
router.post("/store", async (req, res) => {
  const { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai,id_kelas } = req.body;

  if (!id_mapel || !id_guru || !tanggal || !jam_mulai || !jam_selesai, id_kelas) {
    return res.status(400).json({
      success: false,
      message: "Semua data absen wajib diisi",
    });
  }

  try {
    await Model_Absen.Store({ id_mapel, id_guru, tanggal, jam_mulai, jam_selesai,id_kelas });
    res.status(201).json({
      success: true,
      message: "Data absen berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error store absen:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan data absen",
      error: error.message,
    });
  }
});

// Update data absen
router.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai } = req.body;

  try {
    await Model_Absen.Update(id, { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai });
    res.status(200).json({
      success: true,
      message: "Data absen berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error update absen:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data absen",
      error: error.message,
    });
  }
});

// Hapus data absen
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Model_Absen.Delete(id);
    res.status(200).json({
      success: true,
      message: "Data absen berhasil dihapus",
    });
  } catch (error) {
    console.error("Error delete absen:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data absen",
      error: error.message,
    });
  }
});

// Ambil data absen berdasarkan mata pelajaran (course)
router.get("/course/:courseName", async (req, res) => {
  const courseName = req.params.courseName;
  try {
    const data = await Model_Absen.getByCourse(courseName);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data absen untuk mata pelajaran",
        data: data,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data absen untuk mata pelajaran tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getByCourse absen:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data absen",
      error: error.message,
    });
  }
});


// Ambil data absen berdasarkan kode kelas
router.get("/kelas/:kode_kelas", async (req, res) => {
  const kode_kelas = req.params.kode_kelas;
  try {
    const data = await Model_Absen.getByKelas(kode_kelas);
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data absen berdasarkan kelas",
      data: data,
    });
  } catch (error) {
    console.error("Error getByKelas absen:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data absen",
      error: error.message,
    });
  }
});


module.exports = router;
