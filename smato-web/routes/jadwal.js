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
    const kelasSearch = req.query.kelas || '';
    let jadwal;

    if (kelasSearch) {
      jadwal = await Model_Jadwal.getByKelas(kelasSearch);
    } else {
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

    // ✅ Auto-detect hari saat ini
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = days[today.getDay()];
    
    console.log("🗓️ Hari ini adalah:", currentDay);

    // ✅ FITUR BARU: Dapatkan data guru yang sedang login dari database
    let currentGuru = null;
    let currentGuruId = null;
    
    if (req.session.level === 'guru' && req.session.userId) { // ✅ Gunakan userId sesuai login route
      try {
        // Ambil data user berdasarkan session
        const userData = await Model_Users.getId(req.session.userId); // ✅ Gunakan userId
        
        if (userData && userData.length > 0 && userData[0].id_guru) {
          const guruId = userData[0].id_guru;
          
          // Ambil data guru berdasarkan id_guru dari users table
          const guruData = await Model_Guru.getId(guruId);
          
          if (guruData && guruData.length > 0) {
            currentGuru = guruData[0].nama_guru;
            currentGuruId = guruData[0].id_guru;
            console.log("👩‍🏫 Guru yang login:", currentGuru, "(ID:", currentGuruId, ")");
          }
        }
      } catch (error) {
        console.error("❌ Error mendapatkan data guru:", error);
      }
    }

    res.render("jadwal/index", {
      groupedData: groupedData,
      level: req.session.level,
      kelasSearch: kelasSearch,
      currentDay: currentDay,
      currentGuru: currentGuru,        // ✅ Nama guru dari database
      currentGuruId: currentGuruId     // ✅ ID guru untuk matching jadwal
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
    let rows = await Model_Jadwal.getId(id);
    let mapel = await Model_Mapel.getAll();
    let guru = await Model_Guru.getAll();
    let kelas = await Model_Kelas.getAll();
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
    console.log(error);
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
      const groupedJadwal = await Model_Jadwal.getGroupedByDay();
      res.render("jadwal/index", {
          groupedData: groupedJadwal,
          level: req.session.level
      });
  } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error fetching data");
  }
});

module.exports = router;