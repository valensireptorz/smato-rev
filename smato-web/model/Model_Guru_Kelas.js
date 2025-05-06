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

    // [Kode yang sudah ada tetap dipertahankan tanpa perubahan]
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT gk.id, g.nama_guru, k.kode_kelas 
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