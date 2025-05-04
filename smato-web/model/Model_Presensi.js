const connect = require('../config/database');

class Model_Presensi {

    static async getAllPresensiAdmin() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    presensi.*, 
                    siswa.nama_siswa, 
                    mapel.nama_mapel 
                FROM presensi
                LEFT JOIN siswa ON presensi.id_siswa = siswa.id_siswa
                LEFT JOIN mapel ON presensi.id_mapel = mapel.id_mapel
                ORDER BY presensi.tanggal_presensi DESC
            `;
            connect.query(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    

    static async getPresensi(id_siswa, tanggal_presensi, id_mapel) {
    return new Promise((resolve, reject) => {
        connect.query(
            'SELECT * FROM presensi WHERE id_siswa = ? AND tanggal_presensi = ? AND id_mapel = ?', // ✅ Cek berdasarkan siswa, tanggal, mapel
            [id_siswa, tanggal_presensi, id_mapel],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}
    

    static async getPresensiByPresensiAndSiswa(id_mapel, id_siswa) {
        return new Promise((resolve, reject) => {
            connect.query('SELECT siswa.nama, DATE_FORMAT(tanggal_presensi, "%d-%m-%Y") AS tanggal_presensi, jam_presensi, status FROM presensi JOIN siswa ON presensi.id_siswa = siswa.id_siswa WHERE id_mapel = ? AND id_siswa = ?', [id_mapel, id_siswa], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async getAllPresensi(id_siswa) {
        return new Promise((resolve, reject) => {
            connect.query('SELECT * FROM presensi WHERE id_siswa = ?', [id_siswa], (err, rows) => {
                if (err) {
                    console.error("❌ Error query:", err);  // Log error jika ada
                    reject(err);
                } else {
                    console.log("📦 Hasil query presensi:", rows);  // Log hasil query
                    resolve(rows);
                }
            });
        });
    }
    

    static async Store(data) {
        return new Promise((resolve, reject) => {
            connect.query('INSERT INTO presensi SET ?', data, function (err, result) {
                if (err) {
                    console.error("Gagal menyimpan presensi:", err.sqlMessage);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
    
}

module.exports = Model_Presensi;
