var express = require("express");
var router = express.Router();

var connection = require("../config/database.js");
const Model_Mapel = require("../model/Model_Mapel.js");
const Model_Users = require("../model/Model_Users.js");

router.get("/", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.session.userId; // Assuming you are using sessions and storing userId in the session
    let Data = await Model_Users.getId(id);
    if (Data.length > 0) { // Check if user data exists
      let rows = await Model_Mapel.getAll(); // Fetch Dosen data
      res.render("mapel/index", {
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
  res.render("mapel/create", {
    nama_mapel: "",
    jenis_mapel: "",
    level: level_users,
  });
});

router.post("/store", async function (req, res, next) {
  try {
    let { 
        nama_mapel,
        jenis_mapel
    } = req.body;
    let Data = {
        nama_mapel,
        jenis_mapel
    }
    await Model_Mapel.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    res.redirect("/mapel")
  } catch {
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/mapel")
  }
})

router.get("/edit/(:id)", async function (req, res, next) {
  let level_users = req.session.level;
  let id = req.params.id;
  let rows = await Model_Mapel.getId(id);
  res.render("mapel/edit", {
    id:             rows[0].id_mapel,
    nama_mapel:  rows[0].nama_mapel,
    jenis_mapel:  rows[0].jenis_mapel,
    level: level_users,
  })
})

router.post("/update/(:id)", async function (req, res, next) {
  try {
    let id = req.params.id;
    let {
        nama_mapel,
        jenis_mapel
    } = req.body;
    let Data = { 
        nama_mapel,
        jenis_mapel
    };
    await Model_Mapel.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/mapel")
  } catch(err)  {
    console.log(err)
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/mapel")
  }
})

router.get("/delete/(:id)", async function (req, res) {
  let id = req.params.id;
  await Model_Mapel.Delete(id);
  req.flash("success", "Data terhapus!");
  res.redirect("/mapel")
});
module.exports = router;
