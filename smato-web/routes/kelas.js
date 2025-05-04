var express = require("express");
var router = express.Router();

var connection = require("../config/database.js");
const Model_Kelas = require("../model/Model_Kelas.js");
const Model_Users = require("../model/Model_Users.js");

router.get("/", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.session.userId; // Assuming you are using sessions and storing userId in the session
    let Data = await Model_Users.getId(id);
    if (Data.length > 0) { // Check if user data exists
      let rows = await Model_Kelas.getAll(); // Fetch Dosen data
      res.render("kelas/index", {
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
  res.render("kelas/create", {
    kode_kelas: "",
    level: level_users,
  });
});

router.post("/store", async function (req, res, next) {
  try {
    let { 
        kode_kelas
    } = req.body;
    let Data = {
        kode_kelas
    }
    await Model_Kelas.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    res.redirect("/kelas")
  } catch {
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/kelas")
  }
})

router.get("/edit/(:id)", async function (req, res, next) {
  let level_users = req.session.level;
  let id = req.params.id;
  let rows = await Model_Kelas.getId(id);
  res.render("kelas/edit", {
    id:             rows[0].id_kelas,
    kode_kelas:  rows[0].kode_kelas,
    level: level_users,
  })
})

router.post("/update/(:id)", async function (req, res, next) {
  try {
    let id = req.params.id;
    let {
        kode_kelas
    } = req.body;
    let Data = { 
        kode_kelas
    };
    await Model_Kelas.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/kelas")
  } catch(err)  {
    console.log(err)
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/kelas")
  }
})

router.get("/delete/(:id)", async function (req, res) {
  let id = req.params.id;
  await Model_Kelas.Delete(id);
  req.flash("success", "Data terhapus!");
  res.redirect("/kelas")
});
module.exports = router;