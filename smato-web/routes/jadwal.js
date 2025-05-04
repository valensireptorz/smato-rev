var express = require("express");
var router = express.Router();

var connection = require("../config/database.js");
const Model_Jadwal = require("../model/Model_Jadwal.js");
const Model_Mapel = require("../model/Model_Mapel.js");
const Model_Guru = require("../model/Model_Guru.js");
const Model_Kelas = require("../model/Model_Kelas.js");
const Model_Users = require("../model/Model_Users.js");



router.get("/", async (req, res) => {
  try {
    const kelasSearch = req.query.kelas || '';  // Get the kelas from the query string, or default to an empty string
    let jadwal;

    if (kelasSearch) {
      // Query jadwal based on kelas
      jadwal = await Model_Jadwal.getByKelas(kelasSearch);
    } else {
      // If no kelas is provided, fetch all jadwal
      jadwal = await Model_Jadwal.getAll();
    }

    // Kelompokkan data berdasarkan hari
    const groupedData = jadwal.reduce((acc, item) => {
      if (!acc[item.hari]) {
        acc[item.hari] = [];
      }
      acc[item.hari].push(item);
      return acc;
    }, {});

    res.render("jadwal/index", {
      groupedData: groupedData,  // <- ini wajib dikirim
      level: req.session.level,  // pastikan session ada
      kelasSearch: kelasSearch   // Kirimkan kelasSearch ke view untuk menampilkan kembali di input field
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan saat mengambil data jadwal.");
  }
});



router.get("/create",async function (req, res, next) {
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
    res.redirect("/jadwal")
  } catch {
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/jadwal")
  }
})

router.get("/edit/(:id)", async function (req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.params.id;
    let rows = await Model_Jadwal.getId(id); // Mengambil data jadwal saja
    let mapel = await Model_Mapel.getAll(); // Mengambil semua mata kuliah
    let guru = await Model_Guru.getAll(); // Mengambil semua guru
    let kelas = await Model_Kelas.getAll(); // Mengambil semua kelas
    res.render("jadwal/edit", {
      id:             rows[0].id_jadwal,
      hari:  rows[0].hari,
      id_mapel:  rows[0].id_mapel,
      id_guru:  rows[0].id_guru,
      jam_mulai:  rows[0].jam_mulai,
      jam_selesai:  rows[0].jam_selesai,
      id_kelas:  rows[0].id_kelas,
      data: mapel,
      data2: guru,
      data3: kelas,
      level: level_users,
    });
  } catch (error) {
    console.log(error); // Mencetak error jika terjadi kesalahan
    // Menangani kesalahan dengan memberikan respons yang sesuai kepada pengguna
    res.status(500).send("Terjadi kesalahan pada server.");
  }
});



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
    res.redirect("/jadwal")
  } catch(err)  {
    console.log(err)
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/jadwal")
  }
})

router.get("/delete/(:id)", async function (req, res) {
  
  let id = req.params.id;
  await Model_Jadwal.Delete(id);
  req.flash("success", "Data terhapus!");
  res.redirect("/jadwal")
});

router.get("/jadwal", async (req, res) => {
  try {
      const groupedJadwal = await Model_Jadwal.getGroupedByDay(); // Mengambil data yang sudah dikelompokkan
      res.render("jadwal/index", {
          groupedData: groupedJadwal,  // Pastikan 'groupedData' dikirimkan
          level: req.session.level     // Menambahkan level jika diperlukan
      });
  } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error fetching data");
  }
});



module.exports = router;
