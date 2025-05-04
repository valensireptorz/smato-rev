const connection = require('../config/database');
const Model_Matkul = require("../model/Model_Mapel.js"); 
const Model_Users = require("../model/Model_Users.js");

class Model_Tugas {
    // Get all tugas with mapel and guru info
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT t.*, m.nama_mapel, g.nama_guru 
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
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

    // Store new tugas
    static async Store(data) {
        return new Promise((resolve, reject) => {
            // Validate required fields
            if (!data.id_mapel || !data.nama_tugas || !data.deskripsi || !data.deadline) {
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
                SELECT t.*, m.nama_mapel, g.nama_guru
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
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
                SELECT t.*, m.nama_mapel, g.nama_guru
                FROM tugas t
                LEFT JOIN mapel m ON t.id_mapel = m.id_mapel
                LEFT JOIN guru g ON t.id_guru = g.id_guru
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