var express = require("express");
var router = express.Router();

const Model_Guru = require("../../model/Model_Guru.js");

// Endpoint untuk mengambil semua data guru
router.get("/", async function (req, res) {
  try {
    const rows = await Model_Guru.getAll(); // Ambil data guru dari Model_Guru
    res.json(rows); // Kirim data dalam format JSON
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data guru" });
  }
});

router.post("/store", async function (req, res) {
  try {
    const { nama_guru, nip } = req.body;

    // Validasi input
    if (!nama_guru || !nip) {
      return res.status(400).json({ error: "Nama guru dan NIP tidak boleh kosong!" });
    }

    // Periksa apakah NIP sudah ada
    const nipExists = await Model_Guru.checkNipExists(nip);
    if (nipExists) {
      return res.status(400).json({ error: "NIP sudah digunakan oleh guru lain!" });
    }

    // Simpan data guru
    const data = { nama_guru, nip };
    await Model_Guru.Store(data);

    res.status(201).json({ message: "Guru berhasil ditambahkan!" });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan saat menyimpan data guru" });
  }
});

router.put("/update/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const { nama_guru, nip } = req.body;
    const data = { nama_guru, nip };

    // Update data guru
    await Model_Guru.Update(id, data);

    res.status(200).json({ message: "Guru berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan saat memperbarui data guru" });
  }
});

router.delete("/delete/:id", async function (req, res) {
  try {
    const id = req.params.id;

    // Hapus data guru
    await Model_Guru.Delete(id);

    res.status(200).json({ message: "Guru berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus data guru" });
  }
});


module.exports = router;
