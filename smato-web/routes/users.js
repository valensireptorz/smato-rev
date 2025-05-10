var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");

const Model_Users = require("../model/Model_Users");
const Model_Mapel = require("../model/Model_Mapel");
const Model_Guru_Kelas = require("../model/Model_Guru_Kelas");

// Konfigurasi multer (UPLOAD FOTO)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/upload");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage }); // ✅ Upload middleware siap digunakan


// POST /users/store - Simpan data guru
router.post('/store', upload.single('foto_users'), async (req, res) => {
  try {
    const { username, password, level_users, id_guru, id_mapel } = req.body;

    // Tangani file foto
    let fotoFile = null;
    if (req.file) {
      fotoFile = req.file.filename;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const userData = {
      username,
      password: hashedPassword,
      level_users,
      foto_users: fotoFile,
      id_guru,
      id_mapel
    };

    await Model_Users.Store(userData);

    req.flash('success', 'Data guru berhasil disimpan');
    res.redirect('/guru_list');
  } catch (error) {
    console.error('Error saving user:', error);
    req.flash('error', 'Gagal menyimpan data guru');
    res.redirect('/users/create');
  }
});



router.get('/guru_list', async function (req, res) {
  try {
    const guruOnly = await Model_Users.getAllWithRelasi();
    res.render('users/guru_list', {
      title: 'Daftar Guru',
      users: guruOnly,
      level: req.session.level,
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal mengambil data guru');
    res.redirect('/');
  }
});


module.exports = router;
