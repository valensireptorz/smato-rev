const connection = require('../config/database');

class Model_Guru_Kelas {
    
    static async getByGuru(id_guru) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT k.id_kelas, k.kode_kelas 
                FROM guru_kelas gk
                JOIN kelas k ON gk.id_kelas = k.id_kelas
                WHERE gk.id_guru = ?
                ORDER BY k.kode_kelas ASC
            `;
            connection.query(query, [id_guru], (err, rows) => {
                if (err) {
                    console.error('Error in getByGuru:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Method baru untuk mendapatkan data guru_kelas berdasarkan id_users
    static async getByUserId(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT gk.*, g.nama_guru, k.kode_kelas, k.nama_kelas
                FROM guru_kelas gk
                JOIN guru g ON g.id_guru = gk.id_guru
                JOIN kelas k ON k.id_kelas = gk.id_kelas
                WHERE g.id_users = ?
                ORDER BY gk.id DESC
            `;
            connection.query(query, [userId], (err, results) => {
                if (err) {
                    console.error('Error in getByUserId:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // Method baru untuk mendapatkan data guru_kelas berdasarkan id_guru
    static async getByGuruId(id_guru) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT gk.*, k.kode_kelas, k.nama_kelas
                FROM guru_kelas gk
                JOIN kelas k ON k.id_kelas = gk.id_kelas
                WHERE gk.id_guru = ?
                ORDER BY gk.id DESC
            `;
            connection.query(query, [id_guru], (err, results) => {
                if (err) {
                    console.error('Error in getByGuruId:', err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // Method baru untuk mendapatkan data guru_kelas berdasarkan id_guru dan id_kelas
    static async getByGuruAndKelas(id_guru, id_kelas) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT gk.* 
                FROM guru_kelas gk
                WHERE gk.id_guru = ? AND gk.id_kelas = ?
                LIMIT 1
            `;
            connection.query(query, [id_guru, id_kelas], (err, results) => {
                if (err) {
                    console.error('Error in getByGuruAndKelas:', err);
                    reject(err);
                } else {
                    resolve(results.length > 0 ? results[0] : null);
                }
            });
        });
    }

    // [Kode yang sudah ada tetap dipertahankan tanpa perubahan]
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT gk.id, g.id_guru, g.nama_guru, k.kode_kelas, g.nip
                FROM guru_kelas gk
                JOIN guru g ON gk.id_guru = g.id_guru
                JOIN kelas k ON gk.id_kelas = k.id_kelas
                ORDER BY gk.id DESC
            `;
            connection.query(query, (err, rows) => {
                if (err) {
                    console.error('Error executing query in getAll():', err);
                    reject(err);
                } else {
                    console.log('Query result in getAll():', rows);
                    resolve(rows);
                }
            });
        });
    }

    static async Store(data) {
        try {
            return new Promise((resolve, reject) => {
                connection.query('INSERT INTO guru_kelas SET ?', data, (err, result) => {
                    if (err) {
                        console.error('Error in Store Guru_Kelas:', err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            console.error('Error in Store Guru_Kelas (try-catch):', error);
            throw error;
        }
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM guru_kelas WHERE id = ?', [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async getKelas(id) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT b.id_kelas, b.kode_kelas FROM guru_kelas a
                join kelas b on b.id_kelas=a.id_kelas
                WHERE id_guru = ?`, [id], (err, rows) => {
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
            connection.query('UPDATE guru_kelas SET ? WHERE id = ?', [data, id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM guru_kelas WHERE id = ?', [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

module.exports = Model_Guru_Kelas;