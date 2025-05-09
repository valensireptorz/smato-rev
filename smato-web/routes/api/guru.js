// routes/api/guru.js

const express = require("express");
const router = express.Router();
const Model_Guru = require("../../model/Model_Guru.js"); // Import model Guru

// Ambil semua data guru
router.get("/getall", async (req, res) => {
  try {
    const data = await Model_Guru.getAll();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data guru",
      data: data,
    });z
  } catch (error) {
    console.error("Error getAll guru:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data guru",
      error: error.message,
    });
  }
});

// Ambil data guru berdasarkan ID
router.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Model_Guru.getId(id);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data guru",
        data: data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data guru tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getById guru:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data guru",
      error: error.message,
    });
  }
});

// Tambah data guru
router.post("/store", async (req, res) => {
  const { nama_guru, nip } = req.body;

  if (!nama_guru || !nip) {
    return res.status(400).json({
      success: false,
      message: "Nama guru dan NIP wajib diisi",
    });
  }

  try {
    await Model_Guru.Store({ nama_guru, nip });
    res.status(201).json({
      success: true,
      message: "Data guru berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error store guru:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan data guru",
      error: error.message,
    });
  }
});

// Update data guru
router.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { nama_guru, nip } = req.body;

  try {
    await Model_Guru.Update(id, { nama_guru, nip });
    res.status(200).json({
      success: true,
      message: "Data guru berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error update guru:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data guru",
      error: error.message,
    });
  }
});

// Hapus data guru
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Model_Guru.Delete(id);
    res.status(200).json({
      success: true,
      message: "Data guru berhasil dihapus",
    });
  } catch (error) {
    console.error("Error delete guru:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data guru",
      error: error.message,
    });
  }
});

module.exports = router;
