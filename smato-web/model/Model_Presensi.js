const connect = require('../config/database');
const Model_Siswa = require('./Model_Siswa');
class Model_Presensi {
    // Add this new method to Model_Presensi.js


static async getAbsentStudents(id_absen) {
    return new Promise(async (resolve, reject) => {
        try {
            // First get the absen info to determine the class
            const absenInfo = await this.getAbsenInfo(id_absen);
            
            if (!absenInfo || !absenInfo.kode_kelas) {
                console.error("❌ Invalid absen info or missing kode_kelas");
                return resolve([]);
            }
            
            console.log(`🔍 Mencari siswa yang tidak hadir untuk kelas: ${absenInfo.kode_kelas}`);
            
            // Get all students in this class using the existing Model_Siswa method
            const allStudents = await Model_Siswa.getByKelas(absenInfo.kode_kelas);
            
            if (!allStudents || allStudents.length === 0) {
                console.log(`⚠️ Tidak ada siswa yang ditemukan di kelas ${absenInfo.kode_kelas}`);
                return resolve([]);
            }
            
            console.log(`📋 Total siswa di kelas ${absenInfo.kode_kelas}: ${allStudents.length}`);
            
            // Get students who have already attended
            const presentQuery = `
                SELECT id_siswa
                FROM presensi
                WHERE id_absen = ?
            `;
            
            connect.query(presentQuery, [id_absen], (err, presentStudents) => {
                if (err) {
                    console.error("❌ Error getting present students:", err);
                    return reject(err);
                }
                
                // Create a set of present student IDs for quick lookup
                const presentStudentIds = new Set(presentStudents.map(s => s.id_siswa));
                console.log(`✅ Jumlah siswa yang sudah presensi: ${presentStudentIds.size}`);
                
                // Filter out students who are present to get absent students
                const absentStudents = allStudents.filter(student => !presentStudentIds.has(student.id_siswa));
                
                console.log(`⚠️ Jumlah siswa yang belum presensi: ${absentStudents.length}`);
                console.log(`📋 Detail siswa yang belum presensi:`, absentStudents.map(s => s.nama_siswa));
                
                resolve(absentStudents);
            });
        } catch (error) {
            console.error("❌ Error in getAbsentStudents:", error);
            reject(error);
        }
    });
}

    static async getAllPresensiAdmin() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    presensi.*, 
                    siswa.nama_siswa, 
                    siswa.nis,
                    mapel.nama_mapel,
                    kelas.kode_kelas
                FROM presensi
                LEFT JOIN siswa ON presensi.id_siswa = siswa.id_siswa
                LEFT JOIN mapel ON presensi.id_mapel = mapel.id_mapel
                LEFT JOIN kelas ON siswa.id_kelas = kelas.id_kelas
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

    // ✅ Method baru: Ambil presensi berdasarkan mata pelajaran
    static async getByMapel(id_mapel) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    presensi.*,
                    siswa.nama_siswa,
                    siswa.nis,
                    mapel.nama_mapel,
                    kelas.kode_kelas,
                    CONCAT(presensi.tanggal_presensi, ' ', presensi.jam_presensi) as waktu_presensi
                FROM presensi
                LEFT JOIN siswa ON presensi.id_siswa = siswa.id_siswa
                LEFT JOIN mapel ON presensi.id_mapel = mapel.id_mapel
                LEFT JOIN kelas ON siswa.id_kelas = kelas.id_kelas
                WHERE presensi.id_mapel = ?
                ORDER BY presensi.tanggal_presensi DESC, presensi.jam_presensi DESC
            `;
            connect.query(query, [id_mapel], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Presensi.getByMapel():", err);
                    reject(err);
                } else {
                    console.log("Jumlah presensi ditemukan untuk mapel:", rows.length);
                    resolve(rows);
                }
            });
        });
    }

    // ✅ Method baru: Ambil detail presensi berdasarkan id_absen (HANYA untuk sesi absen tertentu)
    static async getDetailByAbsen(id_absen) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    presensi.*,
                    siswa.nama_siswa,
                    siswa.nis,
                    CONCAT(presensi.tanggal_presensi, ' ', presensi.jam_presensi) as waktu_presensi
                FROM presensi
                LEFT JOIN siswa ON presensi.id_siswa = siswa.id_siswa
                WHERE presensi.id_absen = ?
                ORDER BY presensi.jam_presensi ASC
            `;
            console.log("🔍 Query getDetailByAbsen untuk id_absen:", id_absen);
            connect.query(query, [id_absen], (err, rows) => {
                if (err) {
                    console.error("❌ Error in Model_Presensi.getDetailByAbsen():", err);
                    reject(err);
                } else {
                    console.log("✅ Jumlah siswa yang presensi untuk sesi ini:", rows.length);
                    console.log("📋 Detail siswa yang presensi:", rows.map(r => r.nama_siswa));
                    resolve(rows);
                }
            });
        });
    }

    // ✅ Method baru: Ambil info absen berdasarkan id_absen
    static async getAbsenInfo(id_absen) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    a.*,
                    m.nama_mapel,
                    k.kode_kelas
                FROM absen a
                LEFT JOIN mapel m ON a.id_mapel = m.id_mapel
                LEFT JOIN kelas k ON a.id_kelas = k.id_kelas
                WHERE a.id_absen = ?
            `;
            connect.query(query, [id_absen], (err, rows) => {
                if (err) {
                    console.error("Error in Model_Presensi.getAbsenInfo():", err);
                    reject(err);
                } else {
                    resolve(rows[0] || {});
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