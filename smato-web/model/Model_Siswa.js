const connection = require('../config/database');

class Model_Siswa {

  static async getAll() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM siswa ORDER BY id_siswa DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getById(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM siswa WHERE id_siswa = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0] || null);
      });
    });
  }

  static async getId(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM siswa WHERE id_siswa = ?', [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO siswa SET ?', Data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE siswa SET ? WHERE id_siswa = ?', [Data, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async Delete(id) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM siswa WHERE id_siswa = ?', [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async getAllWithKelas() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT siswa.*, kelas.kode_kelas 
        FROM siswa 
        JOIN kelas ON siswa.id_kelas = kelas.id_kelas
        ORDER BY siswa.id_siswa DESC
      `;
      connection.query(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async login(nis, password) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          siswa.id_siswa,
          siswa.nama_siswa,
          siswa.nis,
          siswa.password,
          siswa.alamat,
          kelas.kode_kelas
        FROM siswa
        JOIN kelas ON siswa.id_kelas = kelas.id_kelas
        WHERE siswa.nis = ? AND siswa.password = ?
      `;
  
      connection.query(sql, [nis, password], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static async getByKelas(kodeKelas) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT siswa.*, kelas.kode_kelas 
        FROM siswa 
        JOIN kelas ON siswa.id_kelas = kelas.id_kelas 
        WHERE kelas.kode_kelas LIKE ?
        ORDER BY siswa.id_siswa DESC
      `;
      connection.query(sql, [`%${kodeKelas}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ✅ Tambahkan validasi cek NIS duplikat
  static async isNisExist(nis) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM siswa WHERE nis = ?', [nis], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.length > 0);
      });
    });
  }

}

module.exports = Model_Siswa;
