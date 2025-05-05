var express = require("express");
var router = express.Router();
const moment = require("moment-timezone");

const Model_Tugas = require("../model/Model_Tugas.js");
  const Model_Mapel = require("../model/Model_Mapel.js");
  const Model_Users = require("../model/Model_Users.js");

  // router.get("/", async (req, res) => {
  //   const nama_mapel = req.query.nama_mapel;

  //   try {
  //     const dataMapel = await Model_Mapel.getAll();
  //     let dataTugas = [];
  //     let id_mapel = null;

  //     if (nama_mapel) {
  //       const mapel = await Model_Mapel.getByNama(nama_mapel);
  //       if (mapel) {
  //         id_mapel = mapel.id_mapel;
  //         dataTugas = await Model_Tugas.getByMapel(id_mapel);
  //       }
  //     }

  //     res.render("tugas/index", {
  //       dataMapel,
  //       dataTugas,
  //       nama_mapel,
  //       id_mapel,
  //       level: req.session.level
  //     });

  //   } catch (err) {
  //     res.status(500).send("Terjadi kesalahan: " + err.message);
  //   }
  // });

// Modifikasi router.get("/")
router.get("/", async (req, res) => {
  // Gunakan 'let' untuk nama_mapel karena nilainya mungkin diubah nanti
  let nama_mapel = req.query.nama_mapel;
  const userLevel = req.session.level;
  const userId = req.session.userId;

  try {
    let dataMapel = [];
    let dataTugas = [];
    let id_mapel = null;

    // Jika user adalah guru, filter berdasarkan mata pelajaran yang diampu
    if (userLevel === 'guru') {
      const guruData = await Model_Users.getGuruMapel(userId);
      
      if (guruData && guruData.length > 0) {
        // Guru hanya melihat mapel yang diampu
        const guruMapelId = guruData[0].id_mapel;
        if (guruMapelId) {
          // Set id_mapel dari data guru
          id_mapel = guruMapelId;
          
          // Dapatkan data mapel yang diampu
          const mapelGuru = await Model_Mapel.getById(id_mapel);
          if (mapelGuru) {
            dataMapel = [mapelGuru]; // Hanya tampilkan mata pelajaran yang diampu
            
            // Set nama_mapel default dari mata pelajaran guru
            if (!nama_mapel) {
              nama_mapel = mapelGuru.nama_mapel;
            }
            
            // Ambil tugas berdasarkan mata pelajaran guru
            dataTugas = await Model_Tugas.getByMapel(id_mapel);
          }
        }
      }
    } else {
      // Jika bukan guru, tampilkan semua mapel
      dataMapel = await Model_Mapel.getAll();
      
      // Filter berdasarkan mata pelajaran yang dipilih
      if (nama_mapel) {
        const mapel = await Model_Mapel.getByNama(nama_mapel);
        if (mapel) {
          id_mapel = mapel.id_mapel;
          dataTugas = await Model_Tugas.getByMapel(id_mapel);
        }
      }
    }

    res.render("tugas/index", {
      dataMapel,
      dataTugas,
      nama_mapel,
      id_mapel,
      level: userLevel
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Terjadi kesalahan: " + err.message);
  }
});



// GET CREATE
router.get("/create/:id_mapel", async function (req, res) {
  const id_mapel = req.params.id_mapel;

  if (!id_mapel || isNaN(id_mapel)) {
    req.flash("error", "ID Mata Pelajaran tidak valid");
    return res.redirect("/tugas");
  }

  const mapel = await Model_Mapel.getId(id_mapel);
  if (!mapel || mapel.length === 0) {
    req.flash("error", "Mata Pelajaran tidak ditemukan");
    return res.redirect("/tugas");
  }

  const users = await Model_Users.getAll();
  const now = moment().tz('Asia/Jakarta').format("YYYY-MM-DDTHH:mm");

  res.render("tugas/create", {
    id_mapel: mapel[0].id_mapel,
    nama_mapel: mapel[0].nama_mapel,
    nama_tugas: "",
    deskripsi: "",
    deadline: now,
    dataUsers: users,
    level: req.session.level
  });
});


// POST STORE
router.post("/store", async function (req, res) {
  try {
    const { id_mapel, nama_tugas, deskripsi, deadline } = req.body;
    const Data = { id_mapel, nama_tugas, deskripsi, deadline };
    await Model_Tugas.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    res.redirect("/tugas");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/tugas");
  }
});


// GET EDIT
router.get("/edit/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const rows = await Model_Tugas.getId(id);
    const mapel = await Model_Mapel.getAll();
    const users = await Model_Users.getAll();

    res.render("tugas/edit", {
      id: rows[0].id_tugas,
      id_mapel: rows[0].id_mapel,
      nama_mapel: rows[0].nama_mapel,
      nama_tugas: rows[0].nama_tugas,
      deskripsi: rows[0].deskripsi,
      deadline: rows[0].deadline,
      dataMapel: mapel,
      dataUsers: users,
      level: req.session.level
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Gagal memuat data tugas");
    res.redirect("/tugas");
  }
});


// POST UPDATE
router.post("/update/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const { id_mapel, nama_tugas, deskripsi, deadline } = req.body;
    const Data = { id_mapel, nama_tugas, deskripsi, deadline };
    await Model_Tugas.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/tugas");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/tugas");
  }
});


// GET DELETE
router.get("/delete/:id", async function (req, res) {
  try {
    const id = req.params.id;
    await Model_Tugas.Delete(id);
    req.flash("success", "Data terhapus!");
    res.redirect("/tugas");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan saat menghapus");
    res.redirect("/tugas");
  }
});

module.exports = router;
