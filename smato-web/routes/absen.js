var express = require("express");
var router = express.Router();
const connection = require("../config/database.js");
const Model_Absen = require("../model/Model_Absen.js");
const Model_Mapel = require("../model/Model_Mapel.js");
const Model_Users = require("../model/Model_Users.js");
const Model_Guru = require("../model/Model_Guru.js");
const Model_Kelas = require("../model/Model_Kelas.js");

router.get('/', async (req, res) => {
  const nama_mapel = req.query.nama_mapel;

  try {
    const dataMapel = await Model_Mapel.getAll();
    let dataAbsen = [];
    let id_mapel = null;

    if (nama_mapel) {
      const mapel = await Model_Mapel.getByNama(nama_mapel);
      if (mapel) {
        id_mapel = mapel.id_mapel;
        dataAbsen = await Model_Absen.getByMapelId(id_mapel);
      }
    }

    res.render('absen/index', {
      dataMapel,
      dataAbsen,
      nama_mapel,
      id_mapel,
      level: req.session.level
    });

  } catch (err) {
    res.status(500).send("Terjadi kesalahan: " + err.message);
  }
});




router.post("/presensi", async function(req, res) {
  try {
    const { nama_siswa, nis, kelas, id_mapel, waktu } = req.body;
    await connection.query(
      "INSERT INTO presensi_siswa (nama_siswa, nis, kelas, id_mapel, waktu) VALUES (?, ?, ?, ?, ?)",
      [nama_siswa, nis, kelas, id_mapel, waktu]
    );
    req.flash("success", "Presensi berhasil!");
    res.redirect("back");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan saat presensi.");
    res.redirect("back");
  }
});


router.get("/create/:id_mapel", async function(req, res, next) {
  let id_mapel = req.params.id_mapel;

  // Cek apakah id_mapel valid
  if (!id_mapel || isNaN(id_mapel)) {
    req.flash("error", "ID Mata Pelajaran tidak valid");
    return res.redirect("/absen");
  }

  let mapel = await Model_Mapel.getId(id_mapel);
  if (!mapel || mapel.length === 0) {
    req.flash("error", "Mata Pelajaran tidak ditemukan");
    return res.redirect("/absen");
  }

  let kelas = await Model_Kelas.getAll();
  let guru = await Model_Guru.getAll();

  res.render("absen/create", {
    id_mapel: mapel[0].id_mapel,
    nama_mapel: mapel[0].nama_mapel,
    dataGuru: guru,
    dataKelas: kelas,
    level: req.session.level,
  });
});






router.post("/store", async function(req, res, next) {
  try {
    let { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas } = req.body; // Tambah id_guru
    let Data = { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas };     // Sertakan di objek
    await Model_Absen.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    res.redirect("/absen");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/absen");
  }
});


router.get("/edit/(:id)", async function(req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.params.id;
    let rows = await Model_Absen.getId(id);
    let mapel = await Model_Mapel.getAll();
    let guru = await Model_Guru.getAll(); // Tambahkan ambil guru
    let kelas = await Model_Kelas.getAll(); // ambil semua data kelas
    res.render("absen/edit", {
      id: rows[0].id_absen,
      id_mapel: rows[0].id_mapel,
      id_guru: rows[0].id_guru,
      id_kelas: rows[0].id_kelas, // tambahkan ini
      nama_mapel: rows[0].nama_mapel,
      tanggal: rows[0].tanggal,
      jam_mulai: rows[0].jam_mulai,
      jam_selesai: rows[0].jam_selesai,
      dataMapel: mapel,
      dataGuru: guru,
      dataKelas: kelas, // tambahkan ini juga
      level: level_users,
    });
    
  } catch (err) {
    console.log(err);
  }
});


router.post("/update/(:id)", async function(req, res, next) {
  try {
    let id = req.params.id;
    let { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas } = req.body;
let Data = { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas };
await Model_Absen.Update(id, Data);

    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/absen");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/absen");
  }
});


router.get("/delete/(:id)", async function(req, res) {
  let id = req.params.id;
  await Model_Absen.Delete(id);
  req.flash("success", "Data terhapus!");
  res.redirect("/absen");
});

module.exports = router;