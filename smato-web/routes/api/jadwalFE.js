var express = require("express");
var router = express.Router();

var connection = require("../../config/database.js");
const Model_Jadwal = require("../../model/Model_Jadwal.js");
const Model_Mapel = require("../../model/Model_Mapel.js");
const Model_Guru = require("../../model/Model_Guru.js");
const Model_Kelas = require("../../model/Model_Kelas.js");
const Model_Users = require("../../model/Model_Users.js");

// Route untuk mendapatkan data jadwal dan pencarian kelas
router.get("/", async (req, res) => {
  try {
    // Cek apakah user sudah login dan memiliki level yang sesuai
    if (!req.session.userId || req.session.level !== 'guru') {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const kelasSearch = req.query.kelas || '';
    let jadwal;

    // Jika kelasSearch ada, lakukan pencarian berdasarkan kelas
    if (kelasSearch) {
      jadwal = await Model_Jadwal.getByKelas(kelasSearch);
    } else {
      // Jika tidak ada kelas yang dicari, tampilkan semua jadwal
      jadwal = await Model_Jadwal.getAll();
    }

    // Kelompokkan data jadwal berdasarkan hari
    const groupedData = jadwal.reduce((acc, item) => {
      if (!acc[item.hari]) {
        acc[item.hari] = [];
      }
      acc[item.hari].push(item);
      return acc;
    }, {});

    // Ambil hari ini
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = days[today.getDay()];

    // Ambil data guru yang sedang login
    let currentGuru = null;
    let currentGuruId = null;

    if (req.session.level === 'guru' && req.session.userId) {
      try {
        const userData = await Model_Users.getId(req.session.userId);
        if (userData && userData.length > 0 && userData[0].id_guru) {
          const guruId = userData[0].id_guru;
          const guruData = await Model_Guru.getId(guruId);

          if (guruData && guruData.length > 0) {
            currentGuru = guruData[0].nama_guru;
            currentGuruId = guruData[0].id_guru;
          }
        }
      } catch (error) {
        console.error("Error getting teacher data:", error);
      }
    }

    // Kirimkan respons dengan data yang sudah dikelompokkan
    res.json({
      success: true,
      groupedData: groupedData,
      currentDay: currentDay,
      currentGuru: currentGuru,
      currentGuruId: currentGuruId,
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal server error");
  }
});

// Route untuk menambah jadwal
router.get("/create", async function (req, res, next) {
  let level_users = req.session.level;
  let mapel = await Model_Mapel.getAll();
  let guru = await Model_Guru.getAll();
  let kelas = await Model_Kelas.getAll();
  res.render("jadwal/create", {
    hari: "",
    id_mapel: "",
    id_guru: "",
    jam_mulai: "",
    jam_selesai: "",
    id_kelas: "",
    data: mapel,
    data2: guru,
    data3: kelas,
    level: level_users,
  });
});

// Route untuk menyimpan jadwal baru
router.post("/store", async function (req, res, next) {
  try {
    let {
      hari,
      id_mapel,
      id_guru,
      jam_mulai,
      jam_selesai,
      id_kelas
    } = req.body;
    let Data = {
      hari,
      id_mapel,
      id_guru,
      jam_mulai,
      jam_selesai,
      id_kelas
    }
    await Model_Jadwal.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    res.redirect("/jadwal");
  } catch (err) {
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/jadwal");
  }
});

// Route untuk mengedit jadwal
router.get("/edit/(:id)", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.params.id;
    let rows = await Model_Jadwal.getId(id);
    let mapel = await Model_Mapel.getAll();
    let guru = await Model_Guru.getAll();
    let kelas = await Model_Kelas.getAll();
    res.render("jadwal/edit", {
      id: rows[0].id_jadwal,
      hari: rows[0].hari,
      id_mapel: rows[0].id_mapel,
      id_guru: rows[0].id_guru,
      jam_mulai: rows[0].jam_mulai,
      jam_selesai: rows[0].jam_selesai,
      id_kelas: rows[0].id_kelas,
      data: mapel,
      data2: guru,
      data3: kelas,
      level: level_users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Terjadi kesalahan pada server.");
  }
});

// Route untuk memperbarui jadwal
router.post("/update/(:id)", async function (req, res, next) {
  try {
    let id = req.params.id;
    let {
      hari,
      id_mapel,
      id_guru,
      jam_mulai,
      jam_selesai,
      id_kelas
    } = req.body;
    let Data = {
      hari,
      id_mapel,
      id_guru,
      jam_mulai,
      jam_selesai,
      id_kelas
    };
    await Model_Jadwal.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/jadwal");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/jadwal");
  }
});

// Route untuk menghapus jadwal
router.get("/delete/(:id)", async function (req, res) {
  let id = req.params.id;
  await Model_Jadwal.Delete(id);
  req.flash("success", "Data terhapus!");
  res.redirect("/jadwal");
});

module.exports = router;
