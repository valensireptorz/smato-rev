var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

var Model_Users = require('../model/Model_Users');
const e = require('express');


const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/upload");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage }).single('foto_users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Schedule' });
});
router.get('/register', function(req, res, next) {
  res.render('auth/register');
});
router.get('/login', function(req, res, next) {
  res.render('auth/login');
});

router.post('/saveusers', async (req, res) => {
  upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
          // Jika terjadi kesalahan multer
          console.error(err);
          return res.status(500).json({ error: 'Multer Error' });
      } else if (err) {
          // Jika terjadi kesalahan lain
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      
      // Proses penyimpanan data pengguna
      let { username, password } = req.body;
      let enkripsi = await bcrypt.hash(password, 10);
      let Data = {
          username,
          password: enkripsi,
          foto_users: req.file.filename // Simpan nama file foto ke dalam data pengguna
      };
      
      try {
          await Model_Users.Store(Data);
          req.flash('success', 'Berhasil Register!');
          res.redirect('/login');
      } catch (error) {
          console.error(error);
          req.flash('error', 'Gagal menyimpan data pengguna');
          res.redirect('/register');
      }
  });
});

router.post('/log', async (req, res) => {
    let { username, password } = req.body;
    try {
        let Data = await Model_Users.Login(username);
        if (Data.length > 0) {
            let enkripsi = Data[0].password;
            let cek = await bcrypt.compare(password, enkripsi);
            if (cek) {
                req.session.level = Data[0].level_users;
                req.session.userId = Data[0].id_users;
                req.session.username = Data[0].username; // Simpan username ke dalam sesi
                req.session.foto_users = Data[0].foto_users; // Simpan foto_users ke dalam sesi
                //menambahkan kondisi pengecekan level pada user 
                if (Data[0].level_users == 'admin') {
                    req.flash('success', 'berhasil login');
                    res.redirect('/superusers');
                } else if (Data[0].level_users == 'siswa') {
                    req.flash('success', 'Berhasil login!');
                    res.redirect('/users');
                } else if (Data[0].level_users == 'guru') {
                    req.flash('success', 'Berhasil login!');
                    res.redirect('/megausers');
                } else {
                    res.redirect('login');
                }
                // ahir kondisi
            } else {
                req.flash('error', 'username atau password salah!');
                res.redirect('/login');
            }
        } else {
            req.flash('error', 'akun Tidak Ditemukan!');
            res.redirect('/login');
        }
    } catch (err) {
        res.redirect('/login');
        req.flash('error', 'error pada fungsi');
        console.log(err);
    }
});


router.get('/logout', function (req, res) {
  req.session.destroy(function(err) {
    if(err) {
      console.error(err);
    } else {
      res.redirect('/login');
    }
  });
});



module.exports = router;