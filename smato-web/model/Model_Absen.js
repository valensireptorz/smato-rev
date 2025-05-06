const connection = require('../config/database');
const Model_Mapel = require("../model/Model_Mapel.js");

class Model_Absen {
    

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
                FROM absen a
                LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
                LEFT JOIN guru g ON a.id_guru = g.id_guru
                LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getByMapel(id_mapel) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT a.*, m.nama_mapel, k.kode_kelas
                FROM absen a
                LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
                LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
                WHERE a.id_mapel = ?
                ORDER BY a.tanggal DESC
            `, [id_mapel], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Absen.getByMapel():", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    // // Pastikan juga fungsi getAll() ada untuk menampilkan semua data absen
    // static async getAll() {
    //     return new Promise((resolve, reject) => {
    //         connection.query(`
    //             SELECT a.*, m.nama_mapel, k.kode_kelas
    //             FROM absen a
    //             LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
    //             LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
    //             ORDER BY a.tanggal DESC
    //         `, (err, rows) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(rows);
    //             }
    //         });
    //     });
    // }

    static async Store(data) {
        return new Promise((resolve, reject) => {
            const { id_mapel, id_guru, id_kelas, tanggal, jam_mulai, jam_selesai } = data;
            connection.query(
                'INSERT INTO absen SET ?',
                { id_mapel, id_guru, id_kelas, tanggal, jam_mulai, jam_selesai },
                function(err, result) {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
                FROM absen a
                LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
                LEFT JOIN guru g ON a.id_guru = g.id_guru
                LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
                WHERE a.id_absen = ?
            `, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getByCourse(courseName) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
                FROM absen a
                LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
                LEFT JOIN guru g ON a.id_guru = g.id_guru
                LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
                WHERE m.nama_mapel = ?
            `, [courseName], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Update(id, data) {
        return new Promise((resolve, reject) => {
            const { id_mapel, id_guru, id_kelas, tanggal, jam_mulai, jam_selesai } = data;
            connection.query(
                'UPDATE absen SET ? WHERE id_absen = ?',
                [{ id_mapel, id_guru, id_kelas, tanggal, jam_mulai, jam_selesai }, id],
                function(err, result) {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM absen WHERE id_absen = ?', [id], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async getByMapelId(id_mapel) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
                FROM absen a
                LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
                LEFT JOIN guru g ON a.id_guru = g.id_guru
                LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
                WHERE a.id_mapel = ?
            `, [id_mapel], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
}



module.exports = Model_Absen;