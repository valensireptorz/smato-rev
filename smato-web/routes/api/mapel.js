const express = require("express");
const router = express.Router();
const Model_Mapel = require("../../model/Model_Mapel.js");
const Model_Siswa = require("../../model/Model_Siswa.js"); // Menambahkan Model_Siswa

// Ambil data mapel berdasarkan ID siswa
router.get("/getbysiswa/:siswaId", async (req, res) => {
  const siswaId = req.params.siswaId;
  try {
    // Misalnya, kamu punya fungsi di model untuk mengambil mapel berdasarkan siswa
    const data = await Model_Mapel.getBySiswaId(siswaId); 

    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data mapel untuk siswa",
        data: data,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Tidak ada mapel untuk siswa ini",
      });
    }
  } catch (error) {
    console.error("Error getMapelBySiswaId:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data mapel untuk siswa",
      error: error.message,
    });
  }
});


// Ambil semua data mapel
router.get("/getall", async (req, res) => {
  try {
    const data = await Model_Mapel.getAll();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data mata pelajaran",
      data: data,
    });
  } catch (error) {
    console.error("Error getAll mapel:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
      error: error.message,
    });
  }
});

// Ambil data mapel berdasarkan ID
router.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Model_Mapel.getId(id);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data mata pelajaran",
        data: data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getById mapel:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
      error: error.message,
    });
  }
});

// Tambah data mapel
router.post("/store", async (req, res) => {
  const { nama_mapel, jenis_mapel } = req.body;

  if (!nama_mapel || !jenis_mapel) {
    return res.status(400).json({
      success: false,
      message: "Nama dan jenis mata pelajaran wajib diisi",
    });
  }

  try {
    await Model_Mapel.Store({ nama_mapel, jenis_mapel });
    res.status(201).json({
      success: true,
      message: "Data berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error store mapel:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan data",
      error: error.message,
    });
  }
});

// Update data mapel
router.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { nama_mapel, jenis_mapel } = req.body;

  try {
    await Model_Mapel.Update(id, { nama_mapel, jenis_mapel });
    res.status(200).json({
      success: true,
      message: "Data berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error update mapel:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data",
      error: error.message,
    });
  }
});

// Hapus data mapel
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Model_Mapel.Delete(id);
    res.status(200).json({
      success: true,
      message: "Data berhasil dihapus",
    });
  } catch (error) {
    console.error("Error delete mapel:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data",
      error: error.message,
    });
  }
});

// Ambil semua data siswa
router.get("/siswa/getall", async (req, res) => {
  try {
    const data = await Model_Siswa.getAll();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data siswa",
      data: data,
    });
  } catch (error) {
    console.error("Error getAll siswa:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data siswa",
      error: error.message,
    });
  }
});

// Ambil data siswa berdasarkan ID
router.get("/siswa/get/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Model_Siswa.getById(id);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data siswa",
        data: data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data siswa tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getById siswa:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data siswa",
      error: error.message,
    });
  }
});

module.exports = router;
