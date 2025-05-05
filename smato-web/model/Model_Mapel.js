const connection = require('../config/database');

class Model_Mapel {

    static async getById(id_mapel) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM mapel WHERE id_mapel = ?', [id_mapel], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.length > 0 ? rows[0] : null);
                }
            });
        });
    }

    // Ambil semua mapel
    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT id_mapel, nama_mapel,jenis_mapel FROM mapel ORDER BY id_mapel DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows); // Mengembalikan data id_mapel dan nama_mapel
                }
            });
        });
    }

    // Ambil mapel berdasarkan id_siswa
    static async getBySiswaId(siswaId) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT m.id_mapel, m.nama_mapel, m.jenis_mapel
                FROM mapel m
                JOIN siswa_mapel sm ON sm.id_mapel = m.id_mapel
                WHERE sm.id_siswa = ?
            `, [siswaId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Ambil mapel berdasarkan id_kelas
    static async getByKelas(id_kelas) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT * FROM mapel
                WHERE id_kelas = ?
            `, [id_kelas], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Simpan data mapel baru
    static async Store(Data) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO mapel SET ?', Data, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Ambil data mapel berdasarkan id_mapel
    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM mapel WHERE id_mapel = ?', [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Update data mapel
    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE mapel SET ? WHERE id_mapel = ?', [Data, id], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Hapus data mapel
    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM mapel WHERE id_mapel = ?', [id], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Ambil mapel berdasarkan nama_mapel
    static async getByNama(nama_mapel) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM mapel WHERE nama_mapel = ?', [nama_mapel], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]); // hanya ambil 1 mapel
                }
            });
        });
    }
}

module.exports = Model_Mapel;
