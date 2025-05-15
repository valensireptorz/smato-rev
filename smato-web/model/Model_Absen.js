const connection = require('../config/database');
const Model_Mapel = require("../model/Model_Mapel.js");

class Model_Absen {
    // Add this new method to Model_Absen.js

static async getByMonth(month, year) {
    return new Promise((resolve, reject) => {
        // Create date range for the selected month
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
        
        console.log(`Filtering absen from ${startDate} to ${endDate}`);
        
        const query = `
            SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
            FROM absen a
            LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
            LEFT JOIN guru g ON a.id_guru = g.id_guru
            LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
            WHERE a.tanggal BETWEEN ? AND ?
            ORDER BY a.tanggal DESC
        `;
        
        connection.query(query, [startDate, endDate], (err, rows) => {
            if (err) {
                console.error("Error in Model_Absen.getByMonth():", err);
                reject(err);
            } else {
                console.log("Jumlah data absen bulan ini:", rows.length);
                resolve(rows);
            }
        });
    });
}

// Add method to filter by both month and mapel
static async getByMonthAndMapel(month, year, id_mapel) {
    return new Promise((resolve, reject) => {
        // Create date range for the selected month
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
        
        console.log(`Filtering absen for mapel ${id_mapel} from ${startDate} to ${endDate}`);
        
        const query = `
            SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
            FROM absen a
            LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
            LEFT JOIN guru g ON a.id_guru = g.id_guru
            LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
            WHERE a.tanggal BETWEEN ? AND ? AND a.id_mapel = ?
            ORDER BY a.tanggal DESC
        `;
        
        connection.query(query, [startDate, endDate, id_mapel], (err, rows) => {
            if (err) {
                console.error("Error in Model_Absen.getByMonthAndMapel():", err);
                reject(err);
            } else {
                console.log("Jumlah data absen bulan ini untuk mapel tersebut:", rows.length);
                resolve(rows);
            }
        });
    });
}

// Add method to filter by both month and kelas
static async getByMonthAndKelas(month, year, kode_kelas) {
    return new Promise((resolve, reject) => {
        // Create date range for the selected month
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
        
        console.log(`Filtering absen for kelas ${kode_kelas} from ${startDate} to ${endDate}`);
        
        const query = `
            SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
            FROM absen a
            LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
            LEFT JOIN guru g ON a.id_guru = g.id_guru
            LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
            WHERE a.tanggal BETWEEN ? AND ? AND k.kode_kelas = ?
            ORDER BY a.tanggal DESC
        `;
        
        connection.query(query, [startDate, endDate, kode_kelas], (err, rows) => {
            if (err) {
                console.error("Error in Model_Absen.getByMonthAndKelas():", err);
                reject(err);
            } else {
                console.log("Jumlah data absen bulan ini untuk kelas tersebut:", rows.length);
                resolve(rows);
            }
        });
    });
}
    
   static async getByKelas(kode_kelas) {
    return new Promise((resolve, reject) => {
        console.log("Mencari absen untuk kelas:", kode_kelas); // Log untuk debug
        const query = `
            SELECT a.*, m.nama_mapel, g.nama_guru, g.nip, k.kode_kelas
            FROM absen a
            LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
            LEFT JOIN guru g ON a.id_guru = g.id_guru
            LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
            WHERE k.kode_kelas = ?
            ORDER BY a.tanggal DESC
        `;
        
        connection.query(query, [kode_kelas], (err, rows) => {
            if (err) {
                console.error("Error in Model_Absen.getByKelas():", err);
                reject(err);
            } else {
                console.log("Jumlah data absen ditemukan:", rows.length); // Log untuk debug
                console.log("Data absen:", JSON.stringify(rows, null, 2)); // Log untuk debug
                resolve(rows);
            }
        });
    });
}

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