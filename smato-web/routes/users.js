var express = require("express");
const Model_Users = require("../model/Model_Users"); // Import Model_Users
var router = express.Router();

router.get("/", async function (req, res, next) {
  try {
    let level_users = req.session.level; // Mendapatkan level dari sesi
    let id = req.session.userId; // Mendapatkan id pengguna dari sesi

    // Mengambil data user berdasarkan id dari sesi
    let Data = await Model_Users.getId(id); 

    if (Data.length > 0) { // Memeriksa apakah data user ada
      if (Data[0].level_users !== "siswa") {
        // Jika level bukan siswa, arahkan ke logout
        res.redirect("/logout");
      } else {
        // Jika level adalah siswa, render halaman dengan data pengguna
        res.render("users/index", {
          title: "Users Home",
          username: Data[0].username,
          foto_users: Data[0].foto_users,
          level: level_users,
        });
      }
    } else {
      res.status(401).json({ error: "User tidak ada" }); // Menampilkan error jika user tidak ditemukan
    }
  } catch (error) {
    console.error(error);
    res.status(501).json("Butuh akses login");
  }
});

module.exports = router;
