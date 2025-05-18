const connection = require('../config/database');

class Model_Guru {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM guru ORDER BY id_guru DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Store(Data) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO guru SET ?', Data, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM guru WHERE id_guru = ?', [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE guru SET ? WHERE id_guru = ?', [Data, id], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM guru WHERE id_guru = ?', [id], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    // Metode baru untuk memeriksa apakah NIP sudah ada di database
    static async checkNipExists(nip) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM guru WHERE nip = ?', [nip], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    // Jika count > 0, berarti NIP sudah ada
                    resolve(result[0].count > 0);
                }
            })
        });
    }

    // Metode baru untuk memeriksa apakah NIP sudah ada, kecuali untuk guru dengan ID tertentu
    static async checkNipExistsExcept(nip, id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM guru WHERE nip = ? AND id_guru != ?', [nip, id], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    // Jika count > 0, berarti NIP digunakan oleh guru lain
                    resolve(result[0].count > 0);
                }
            })
        });
    }

    // ✅ BARU: Method untuk mendapatkan guru berdasarkan nama (untuk debugging)
    static async getByName(nama_guru) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM guru WHERE nama_guru = ?', [nama_guru], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // ✅ BARU: Method untuk mendapatkan semua guru dengan informasi jadwal
    static async getAllWithJadwal() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT g.*, 
                       COUNT(j.id_jadwal) as total_jadwal,
                       GROUP_CONCAT(DISTINCT j.hari) as hari_mengajar
                FROM guru g
                LEFT JOIN jadwal j ON g.id_guru = j.id_guru
                GROUP BY g.id_guru
                ORDER BY g.nama_guru ASC
            `;
            connection.query(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = Model_Guru;