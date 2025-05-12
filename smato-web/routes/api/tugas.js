const express = require("express");
const router = express.Router();
const Model_Tugas = require("../../model/Model_Tugas.js"); // Import Model_Tugas

// Tambahkan endpoint ini di routes/api/tugas.js tepat di awal file
// atau di bawah endpoint /siswa/:id_siswa yang sudah ada
router.get("/mobile/siswa/:id_siswa", async (req, res) => {
  const id_siswa = req.params.id_siswa;
  console.log("🔍 Request tugas untuk siswa ID:", id_siswa);
  
  try {
    // 1. Dapatkan data siswa termasuk kode_kelas
    const Model_Siswa = require("../../model/Model_Siswa.js");
    const siswa = await Model_Siswa.getById(id_siswa);
    console.log("👤 Data siswa:", JSON.stringify(siswa, null, 2));
    
    if (!siswa) {
      console.log("❌ Siswa tidak ditemukan");
      return res.status(404).json({
        success: false,
        message: "Data siswa tidak ditemukan"
      });
    }
    
    // 2. Gunakan kode_kelas untuk mendapatkan data tugas
    const kode_kelas = siswa.kode_kelas;
    console.log("🏫 Kode kelas siswa:", kode_kelas);
    
    // 3. Pastikan kode_kelas ada
    if (!kode_kelas) {
      console.log("❌ Kode kelas tidak ditemukan");
      return res.status(400).json({
        success: false,
        message: "Siswa tidak memiliki informasi kelas"
      });
    }
    
    // 4. Ambil data tugas berdasarkan kelas
    console.log("📝 Mencoba mengambil data tugas untuk kelas:", kode_kelas);
    const data = await Model_Tugas.getByKelas(kode_kelas);
    console.log("📊 Jumlah data tugas yang ditemukan:", data.length);
    
    res.status(200).json({
      success: true,
      message: `Berhasil mengambil data tugas untuk kelas ${kode_kelas}`,
      data: data
    });
  } catch (error) {
    console.error("❌ Error getTugasSiswa:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data tugas siswa",
      error: error.message
    });
  }
});


// Route default GET
router.get("/", async (req, res) => {
  try {
    const data = await Model_Tugas.getAll(); // Pastikan method ini ada
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data Tugas",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data Tugas",
      error: error.message,
    });
  }
});

// Ambil semua data tugas
router.get("/getall", async (req, res) => {
  try {
    const data = await Model_Tugas.getAll();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data tugas",
      data: data,
    });
  } catch (error) {
    console.error("Error getAll tugas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data tugas",
      error: error.message,
    });
  }
});

// Ambil data tugas berdasarkan ID
router.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Model_Tugas.getId(id);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data tugas",
        data: data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data tugas tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getById tugas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data tugas",
      error: error.message,
    });
  }
});

// Tambah data tugas
router.post("/store", async (req, res) => {
  const { id_mapel, id_guru, judul, deskripsi, tenggat, id_kelas } = req.body;

  if (!id_mapel || !id_guru || !judul || !deskripsi || !tenggat || !id_kelas) {
    return res.status(400).json({
      success: false,
      message: "Semua data tugas wajib diisi",
    });
  }

  try {
    await Model_Tugas.Store({ id_mapel, id_guru, judul, deskripsi, tenggat, id_kelas });
    res.status(201).json({
      success: true,
      message: "Data tugas berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error store tugas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan data tugas",
      error: error.message,
    });
  }
});

// Update data tugas
router.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { id_mapel, id_guru, judul, deskripsi, tenggat } = req.body;

  try {
    await Model_Tugas.Update(id, { id_mapel, id_guru, judul, deskripsi, tenggat });
    res.status(200).json({
      success: true,
      message: "Data tugas berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error update tugas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data tugas",
      error: error.message,
    });
  }
});

// Hapus data tugas
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Model_Tugas.Delete(id);
    res.status(200).json({
      success: true,
      message: "Data tugas berhasil dihapus",
    });
  } catch (error) {
    console.error("Error delete tugas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data tugas",
      error: error.message,
    });
  }
});

// Ambil data tugas berdasarkan nama mapel
router.get("/course/:courseName", async (req, res) => {
  const courseName = req.params.courseName;
  try {
    const data = await Model_Tugas.getByCourse(courseName);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data tugas untuk mata pelajaran",
        data: data,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data tugas untuk mata pelajaran tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getByCourse tugas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data tugas",
      error: error.message,
    });
  }
});

// Ambil data tugas berdasarkan kode kelas
router.get("/kelas/:kode_kelas", async (req, res) => {
  const kode_kelas = req.params.kode_kelas;
  try {
    const data = await Model_Tugas.getByKelas(kode_kelas);
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data tugas berdasarkan kelas",
      data: data,
    });
  } catch (error) {
    console.error("Error getByKelas tugas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data tugas",
      error: error.message,
    });
  }
});

module.exports = router;
