  var express = require('express');
  var router = express.Router();

  const bcrypt = require('bcrypt');


  const Model_Mapel = require("../model/Model_Mapel.js");
  const Model_Guru_Kelas = require("../model/Model_Guru_Kelas.js");
  const Model_Users = require('../model/Model_Users'); // Pastikan Anda sudah mengimpor model yang benar
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

    router.get('/guru_list', async function (req, res) {
      try {
        // Ambil semua user dari database
        let semuaUsers = await Model_Users.getAll();
        // Filter hanya user dengan level_users == 'guru'
        let guruOnly = semuaUsers.filter(user => user.level_users === 'guru');

        // Kirim ke view, termasuk level dari session
        res.render('users/guru_list', {
          title: 'Daftar Guru',
          users: guruOnly,
          level: req.session.level,          // ✅ Tambahkan ini
          messages: req.flash()              // opsional, untuk feedback di halaman
        });
      } catch (error) {
        console.error(error);
        req.flash('error', 'Gagal mengambil data guru');
        res.redirect('/');
      }
    });


// Form untuk menambah guru (rubah rute ke folder users)
router.get('/create', async function (req, res) {
  try {
      let guruKelas = await Model_Guru_Kelas.getAll();
      let mapelList = await Model_Mapel.getAll();

      console.log('GuruKelas:', guruKelas);
      console.log('MapelList:', mapelList);

      res.render('users/create', {
          title: 'Tambah Guru',
          level: req.session.level,
          guruKelas,
          mapelList,
          messages: req.flash()
      });
  } catch (error) {
      console.error('Error occurred:', error); // Periksa log error
      req.flash('error', 'Gagal membuka form tambah guru');
      res.redirect('/guru_list'); // Pastikan /guru_list sudah ada dan valid
  }
});




// Route untuk menyimpan user baru
router.post('/store', function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      req.flash('error', 'Gagal mengunggah file');
      return res.redirect('/users/create');
    }
    next();
  });
}, async (req, res) => {
  try {
    const { username, password, level_users, id_guru, id_mapel } = req.body;

    // Debugging untuk pastikan data diterima
    console.log("req.body:", req.body);

    const id_users = id_guru; // gunakan id guru dari form sebagai id_users

    // Validasi id_users
    if (!id_users) {
      req.flash('error', 'ID Guru tidak ditemukan');
      return res.redirect('/users/create');
    }

    let fotoFile = null;
    if (req.file) {
      fotoFile = req.file.filename;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const userData = {
      id_users,              // ID guru dijadikan id_users
      username,
      password: hashedPassword,
      level_users,
      foto_users: fotoFile,
      id_guru: id_guru,                    // id guru (foreign key)
      id_mapel
    };

    console.log("Data yang akan disimpan:", userData);

    await Model_Users.Store(userData);

    req.flash('success', 'Data guru berhasil disimpan');
    res.redirect('/guru_list');
  } catch (error) {
    console.error('Error saving user:', error);
    req.flash('error', 'Gagal menyimpan data guru');
    res.redirect('/users/create');
  }
});
// Route untuk menampilkan form edit guru
router.get('/edit/:id', async function (req, res) {
  try {
    const id = req.params.id;
    
    // Ambil data user yang akan diedit
    const userData = await Model_Users.getId(id);
    
    if (userData.length === 0) {
      req.flash('error', 'Data guru tidak ditemukan');
      return res.redirect('/guru_list');
    }
    
    res.render('users/edit', {
      title: 'Edit Data Guru',
      user: userData[0],
      level: req.session.level,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error:', error);
    req.flash('error', 'Gagal membuka form edit guru');
    res.redirect('/guru_list');
  }
});

// Route untuk menyimpan perubahan data guru
router.post('/update/:id', function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err);
      req.flash('error', 'Gagal mengunggah file');
      return res.redirect(`/edit/${req.params.id}`);
    }
    next();
  });
}, async (req, res) => {
  try {
    const id = req.params.id;
    const { username, password, level_users, id_guru, id_mapel } = req.body;
    
    // Ambil data user saat ini untuk dicek
    const currentUser = await Model_Users.getId(id);
    
    if (currentUser.length === 0) {
      req.flash('error', 'Data guru tidak ditemukan');
      return res.redirect('/guru_list');
    }
    
    // Siapkan data update (hanya username yang selalu diupdate)
    const userData = {
      username
    };
    
    // Update password hanya jika diisi
    if (password && password.trim() !== '') {
      userData.password = bcrypt.hashSync(password, 10);
    }
    
    // Update foto hanya jika ada file baru
    if (req.file) {
      userData.foto_users = req.file.filename;
    }
    
    // Update data user (hanya username, password, dan foto)
    await Model_Users.Update(id, userData);
    
    req.flash('success', 'Data guru berhasil diperbarui');
    res.redirect('/guru_list');
  } catch (error) {
    console.error('Error updating user:', error);
    req.flash('error', 'Gagal memperbarui data guru');
    res.redirect(`/edit/${req.params.id}`);
  }
});

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
          foto_users: req.file.filename, // Simpan nama file foto ke dalam data pengguna
          level_users: 'guru' // otomatis set ke "guru"
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
      res.redirect('/');
    }
  });
});



module.exports = router;