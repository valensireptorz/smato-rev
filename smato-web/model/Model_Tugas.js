const connection = require('../config/database');
const Model_Mapel = require("../model/Model_Mapel.js"); 
const Model_Users = require("../model/Model_Users.js");

class Model_Tugas {
    // Add this method to Model_Tugas.js

// Get tugas by mapel, date filter (bulan dan tahun), and kelas
static async getByMapelDateAndKelas(id_mapel, bulan, tahun, kode_kelas) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
            FROM tugas t
            LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
            LEFT JOIN guru g ON t.id_guru = g.id_guru
            LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
            WHERE t.id_mapel = ? AND MONTH(t.deadline) = ? AND YEAR(t.deadline) = ? AND k.kode_kelas = ?
            ORDER BY t.deadline ASC
        `;
        
        connection.query(query, [id_mapel, bulan, tahun, kode_kelas], (err, rows) => {
            if (err) {
                console.error("Error in Model_Tugas.getByMapelDateAndKelas():", err);
                reject(err);
            } else {
                console.log(`Found ${rows.length} tasks for mapel ${id_mapel}, class ${kode_kelas}, month ${bulan}/${tahun}`);
                resolve(rows);
            }
        });
    });
}

// Add a method to filter by date and kelas (without mapel filter)
static async getByDateAndKelas(bulan, tahun, kode_kelas) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
            FROM tugas t
            LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
            LEFT JOIN guru g ON t.id_guru = g.id_guru
            LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
            WHERE MONTH(t.deadline) = ? AND YEAR(t.deadline) = ? AND k.kode_kelas = ?
            ORDER BY t.deadline ASC
        `;
        
        connection.query(query, [bulan, tahun, kode_kelas], (err, rows) => {
            if (err) {
                console.error("Error in Model_Tugas.getByDateAndKelas():", err);
                reject(err);
            } else {
                console.log(`Found ${rows.length} tasks for class ${kode_kelas}, month ${bulan}/${tahun}`);
                resolve(rows);
            }
        });
    });
}
    // Get tugas by mapel and date filter (bulan dan tahun)
    static async getByMapelAndDate(id_mapel, bulan, tahun) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
                LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
                WHERE t.id_mapel = ? AND MONTH(t.deadline) = ? AND YEAR(t.deadline) = ?
                ORDER BY t.deadline ASC
            `;
            
            connection.query(query, [id_mapel, bulan, tahun], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Tugas.getByMapelAndDate():", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get all tugas with date filter (bulan dan tahun)
    static async getAllAndDate(bulan, tahun) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
                LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
                WHERE MONTH(t.deadline) = ? AND YEAR(t.deadline) = ?
                ORDER BY t.deadline ASC
            `;
            
            connection.query(query, [bulan, tahun], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Tugas.getAllAndDate():", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get tugas by kelas kode
    static async getByKelas(kode_kelas) {
        return new Promise((resolve, reject) => {
            console.log("Mencari tugas untuk kelas:", kode_kelas); // Log untuk debug
            const query = `
                SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
                LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
                WHERE k.kode_kelas = ?
                ORDER BY t.deadline ASC
            `;
            
            connection.query(query, [kode_kelas], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Tugas.getByKelas():", err);
                    reject(err);
                } else {
                    console.log("Jumlah data tugas ditemukan:", rows.length); // Log untuk debug
                    console.log("Data tugas pertama:", rows.length > 0 ? JSON.stringify(rows[0], null, 2) : "Tidak ada data"); // Log untuk debug
                    resolve(rows);
                }
            });
        });
    }

    // Get all tugas
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
                LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
                ORDER BY t.id_tugas DESC
            `;
            
            connection.query(query, (err, rows) => {
                if (err) {
                    console.error("Error in Model_Tugas.getAll():", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Store tugas
    static async Store(data) {
        return new Promise((resolve, reject) => {
            // Validate required fields
            if (!data.id_mapel || !data.id_guru || !data.id_kelas || !data.nama_tugas || !data.deskripsi || !data.deadline) {
                const error = new Error("Missing required fields");
                console.error("Validation error:", error);
                reject(error);
                return;
            }

            connection.query('INSERT INTO tugas SET ?', data, (err, result) => {
                if (err) {
                    console.error("Error in Model_Tugas.Store():", err);
                    console.error("SQL:", err.sql);
                    reject(err);
                } else {
                    console.log("Tugas created with ID:", result.insertId);
                    resolve(result);
                }
            });
        });
    }

    // Get tugas by ID
    static async getId(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
                LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
                WHERE t.id_tugas = ?
            `;
            
            connection.query(query, [id], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Tugas.getId():", err);
                    reject(err);
                } else {
                    resolve(rows.length > 0 ? rows[0] : null);
                }
            });
        });
    }

    // Get tugas by course name
    static async getByCourse(courseName) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT t.*, m.nama_mapel
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                WHERE m.nama_mapel = ?
            `, [courseName], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Tugas.getByCourse():", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get tugas by mapel ID
    static async getByMapel(id_mapel) {
        return new Promise((resolve, reject) => {
            connection.query(`
                SELECT t.*, m.nama_mapel, g.nama_guru, k.id_kelas, k.kode_kelas
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
                LEFT JOIN kelas k ON t.id_kelas = k.id_kelas
                WHERE t.id_mapel = ?
                ORDER BY t.deadline ASC
            `, [id_mapel], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Tugas.getByMapel():", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Update tugas
    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE tugas SET ? WHERE id_tugas = ?', [Data, id], (err, result) => {
                if (err) {
                    console.error("Error in Model_Tugas.Update():", err);
                    console.error("SQL:", err.sql);
                    reject(err);
                } else {
                    console.log("Tugas updated, affected rows:", result.affectedRows);
                    resolve(result);
                }
            });
        });
    }

    // Delete tugas
    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM tugas WHERE id_tugas = ?', [id], (err, result) => {
                if (err) {
                    console.error("Error in Model_Tugas.Delete():", err);
                    reject(err);
                } else {
                    console.log("Tugas deleted, affected rows:", result.affectedRows);
                    resolve(result);
                }
            });
        });
    }
}

module.exports = Model_Tugas;
