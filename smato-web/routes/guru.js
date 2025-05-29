var express = require("express");
var router = express.Router();


var connection = require("../config/database.js");
const Model_Guru = require("../model/Model_Guru.js");
const Model_Users = require("../model/Model_Users.js");

// Endpoint untuk memeriksa ketersediaan NIP (untuk form tambah)
router.get("/check-nip/:nip", async function (req, res) {
  try {
    const nip = req.params.nip;
    const exists = await Model_Guru.checkNipExists(nip);
    
    if (exists) {
      return res.json({ exists: true, message: "NIP sudah digunakan oleh guru lain" });
    } else {
      return res.json({ exists: false, message: "NIP tersedia dan dapat digunakan" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan saat memeriksa NIP" });
  }
});

// Endpoint untuk memeriksa ketersediaan NIP (untuk form edit)
router.get("/check-nip/:nip/edit/:id", async function (req, res) {
  try {
    const nip = req.params.nip;
    const id = req.params.id;
    const exists = await Model_Guru.checkNipExistsExcept(nip, id);
    
    if (exists) {
      return res.json({ exists: true, message: "NIP sudah digunakan oleh guru lain" });
    } else {
      return res.json({ exists: false, message: "NIP tersedia dan dapat digunakan" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan saat memeriksa NIP" });
  }
});

router.get("/", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.session.userId; // Assuming you are using sessions and storing userId in the session
    let Data = await Model_Users.getId(id);
    if (Data.length > 0) { // Check if user data exists
      let rows = await Model_Guru.getAll(); // Fetch guru data
      res.render("guru/index", {
        data: rows,
        level: level_users,
      });
    } else {
      res.redirect("/login"); // Redirect if user is not authenticated
    }
  } catch (error) {
    res.redirect("/login"); // Redirect if an error occurs
  }
});


router.get("/create", function (req, res, next) {
  let level_users = req.session.level;
  res.render("guru/create", {
    nama_guru: "",
    nip: "",
    level: level_users,
  });
});

router.post("/store", async function (req, res, next) {
  try {
    let { nama_guru, nip } = req.body;

    // Validasi input
    if (!nama_guru || !nip) {
      req.flash("error", "Nama guru dan NIP tidak boleh kosong!");
      return res.redirect("/guru/create");
    }

    // Periksa apakah NIP sudah ada
    const nipExists = await Model_Guru.checkNipExists(nip);
    if (nipExists) {
      req.flash("error", "NIP sudah digunakan oleh guru lain!");
      return res.redirect("/guru/create");
    }

    // Jika NIP unik, simpan data guru baru
    let Data = { nama_guru, nip };
    await Model_Guru.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    return res.redirect("/guru");
  } catch (error) {
    req.flash("error", "Terjadi kesalahan pada fungsi");
    return res.redirect("/guru");
  }
});


router.get("/edit/(:id)", async function (req, res, next) {
  let level_users = req.session.level;
  let id = req.params.id;
  let rows = await Model_Guru.getId(id);
  res.render("guru/edit", {
    id:             rows[0].id_guru,
    nama_guru:  rows[0].nama_guru,
    nip:  rows[0].nip,
    level: level_users,
  })
})

router.post("/update/(:id)", async function (req, res, next) {
  try {
    let id = req.params.id;
    let {
        nama_guru,
        nip
    } = req.body;
    let Data = { 
        nama_guru,
        nip
    };
    await Model_Guru.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/guru")
  } catch(err)  {
    console.log(err)
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/guru")
  }
})


router.get("/delete/(:id)", async function (req, res) {
  let id = req.params.id;
  await Model_Guru.Delete(id);
  req.flash("success", "Data terhapus!");
  res.redirect("/guru")
});
module.exports = router;
