var express = require("express");
var router = express.Router();

const Model_Guru_Kelas = require("../model/Model_Guru_Kelas.js");
const Model_Guru = require("../model/Model_Guru.js");
const Model_Kelas = require("../model/Model_Kelas.js");
const Model_Users = require("../model/Model_Users.js");

// Tampilkan data guru_kelas
router.get("/", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.session.userId;

    if (!id) return res.redirect("/login");

    let Data = await Model_Users.getId(id);
    if (Data.length > 0) {
      let rows = await Model_Guru_Kelas.getAll();
      res.render("guru_kelas/index", {
        data: rows,
        level: level_users,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/login");
  }
});

// Form tambah guru_kelas
router.get("/create", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let guru = await Model_Guru.getAll();
    let kelas = await Model_Kelas.getAll();

    res.render("guru_kelas/create", {
      id_guru: "",
      id_kelas: "",
      guru: guru,
      kelas: kelas,
      level: level_users,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Gagal membuka halaman tambah");
    res.redirect("/guru_kelas");
  }
});

// Simpan guru_kelas
router.post("/store", async function (req, res, next) {
  try {
    let { id_guru, id_kelas } = req.body;

    if (!id_guru || !id_kelas) {
      req.flash("error", "Guru dan Kelas harus dipilih!");
      return res.redirect("/guru_kelas/create");
    }

    let Data = {
      id_guru,
      id_kelas,
    };

    await Model_Guru_Kelas.Store(Data);
    req.flash("success", "Berhasil menyimpan relasi guru dan kelas!");
    res.redirect("/guru_kelas");
  } catch (error) {
    console.log(error);
    req.flash("error", "Terjadi kesalahan saat menyimpan");
    res.redirect("/guru_kelas");
  }
});

// Form edit guru_kelas
router.get("/edit/(:id)", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.params.id;
    let rows = await Model_Guru_Kelas.getId(id);
    let guru = await Model_Guru.getAll();
    let kelas = await Model_Kelas.getAll();

    res.render("guru_kelas/edit", {
      id: rows[0].id,
      id_guru: rows[0].id_guru,
      id_kelas: rows[0].id_kelas,
      guru: guru,
      kelas: kelas,
      level: level_users,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Gagal membuka halaman edit");
    res.redirect("/guru_kelas");
  }
});

// Update data guru_kelas
router.post("/update/(:id)", async function (req, res, next) {
  try {
    let id = req.params.id;
    let { id_guru, id_kelas } = req.body;

    let Data = {
      id_guru,
      id_kelas,
    };

    await Model_Guru_Kelas.Update(id, Data);
    req.flash("success", "Data berhasil diperbarui");
    res.redirect("/guru_kelas");
  } catch (error) {
    console.log(error);
    req.flash("error", "Terjadi kesalahan saat update");
    res.redirect("/guru_kelas");
  }
});

// Hapus data guru_kelas
router.get("/delete/(:id)", async function (req, res) {
  try {
    let id = req.params.id;
    await Model_Guru_Kelas.Delete(id);
    req.flash("success", "Data relasi berhasil dihapus");
    res.redirect("/guru_kelas");
  } catch (error) {
    console.log(error);
    req.flash("error", "Terjadi kesalahan saat menghapus");
    res.redirect("/guru_kelas");
  }
});

module.exports = router;
