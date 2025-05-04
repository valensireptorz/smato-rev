const connect = require('../config/database');

class Model_Pengumpulan {

  // ✅ Ambil semua data pengumpulan (khusus admin)
  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pengumpulan.*, 
          siswa.nama_siswa, 
          mapel.nama_mapel 
        FROM pengumpulan
        LEFT JOIN siswa ON pengumpulan.id_siswa = siswa.id_siswa
        LEFT JOIN mapel ON pengumpulan.id_mapel = mapel.id_mapel
        ORDER BY pengumpulan.upload_time DESC
      `;
      connect.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ✅ Ambil semua pengumpulan berdasarkan id_siswa
  static async getAllPengumpulan(id_siswa) {
    return new Promise((resolve, reject) => {
      connect.query(
        'SELECT * FROM pengumpulan WHERE id_siswa = ?',
        [id_siswa],
        (err, rows) => {
          if (err) {
            console.error("❌ Error query:", err);
            reject(err);
          } else {
            console.log("📦 Hasil query pengumpulan:", rows);
            resolve(rows);
          }
        }
      );
    });
  }

  // ✅ Ambil data pengumpulan berdasarkan id_tugas dan id_siswa
  static async getAllByid_tugas_and_id_siswa(id_tugas, id_siswa) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pengumpulan.*, 
          siswa.nama_siswa, 
          mapel.nama_mapel 
        FROM pengumpulan
        LEFT JOIN siswa ON pengumpulan.id_siswa = siswa.id_siswa
        LEFT JOIN mapel ON pengumpulan.id_mapel = mapel.id_mapel
        WHERE pengumpulan.id_tugas = ? AND pengumpulan.id_siswa = ?
      `;
      connect.query(query, [id_tugas, id_siswa], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ✅ Ambil data pengumpulan berdasarkan id_pengumpulan
  static async getId(id_pengumpulan) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pengumpulan.*, 
          siswa.nama_siswa, 
          mapel.nama_mapel 
        FROM pengumpulan
        LEFT JOIN siswa ON pengumpulan.id_siswa = siswa.id_siswa
        LEFT JOIN mapel ON pengumpulan.id_mapel = mapel.id_mapel
        WHERE pengumpulan.id_pengumpulan = ?
      `;
      connect.query(query, [id_pengumpulan], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ✅ Simpan data pengumpulan baru
  static async Store(data) {
    return new Promise((resolve, reject) => {
      connect.query('INSERT INTO pengumpulan SET ?', data, (err, result) => {
        if (err) {
          console.error("Gagal menyimpan pengumpulan:", err.sqlMessage);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // ✅ Cek apakah siswa sudah mengumpulkan tugas pada hari tertentu dan mapel tertentu
  static async getPengumpulan(id_siswa, tanggal_pengumpulan, id_mapel) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM pengumpulan 
        WHERE id_siswa = ? AND tanggal_pengumpulan = ? AND id_mapel = ?
      `;
      connect.query(query, [id_siswa, tanggal_pengumpulan, id_mapel], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Model_Pengumpulan;
