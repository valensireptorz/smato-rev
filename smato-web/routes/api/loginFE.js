const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Model_Users = require("../../model/Model_Users");

router.post("/", async function(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
        }

        // Cari user berdasarkan username
        const Data = await Model_Users.Login(username);
        if (Data.length === 0) {
            return res.status(404).json({ success: false, message: 'Akun tidak ditemukan!' });
        }

        const user = Data[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Username atau password salah!' });
        }

            // Simpan info pengguna ke dalam session
        req.session.userId = user.id_users;
        req.session.level = user.level_users;
        req.session.username = user.username;
        req.session.foto_users = user.foto_users;

        console.log("Session after login:", req.session);


        // Kirim respons ke frontend
        res.json({
            success: true,
            message: 'Login berhasil!',
            userId: user.id_users,
            level: user.level_users,
            username: user.username,
            foto_users: user.foto_users
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server!' });
    }
});

module.exports = router;
