const connection = require('../config/database');
const bcrypt = require('bcrypt');
class Model_Siswa {
  
  // Di Model_Siswa.js
static async changePassword(nis, oldPassword, newPassword) {
  return new Promise((resolve, reject) => {
    // Pertama, cari siswa berdasarkan NIS
    const findUserQuery = 'SELECT * FROM siswa WHERE nis = ?';
    connection.query(findUserQuery, [nis], async (err, rows) => {
      if (err) {
        return reject(err);
      }

      // Jika siswa tidak ditemukan
      if (rows.length === 0) {
        return reject(new Error('Siswa tidak ditemukan'));
      }

      const siswa = rows[0];

      try {
        // Verifikasi password lama
        const isPasswordValid = await bcrypt.compare(oldPassword, siswa.password);
        
        if (!isPasswordValid) {
          return reject(new Error('Password lama salah'));
        }

        // Hash password baru
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password di database
        const updateQuery = 'UPDATE siswa SET password = ? WHERE nis = ?';
        connection.query(updateQuery, [hashedNewPassword, nis], (updateErr, result) => {
          if (updateErr) {
            return reject(updateErr);
          }

          // Cek apakah update berhasil
          if (result.affectedRows === 0) {
            return reject(new Error('Gagal mengubah password'));
          }

          resolve({
            success: true,
            message: 'Password berhasil diubah'
          });
        });

      } catch (bcryptErr) {
        reject(bcryptErr);
      }
    });
  });
}

// Menambahkan metode untuk menaikkan kelas siswa
static async promoteToNewClass(id_siswa, newClass) {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE siswa SET id_kelas = ? WHERE id_siswa = ?';
    connection.query(query, [newClass, id_siswa], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}



 // Mengambil semua data siswa beserta kode_kelas
static async getAll() {
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


  static async getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, k.kode_kelas
        FROM siswa s
        LEFT JOIN kelas k ON s.id_kelas = k.id_kelas
        WHERE s.id_siswa = ?
      `;
      connection.query(query, [id], (err, rows) => {
        if (err) {
          console.error("Error in Model_Siswa.getById():", err);
          reject(err);
        } else {
          console.log("Data siswa dari getById:", JSON.stringify(rows[0], null, 2));
          resolve(rows.length > 0 ? rows[0] : null);
        }
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

  // ✅ Update method ini untuk mendukung update password yang opsional
  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      // Jika password kosong/undefined, hapus dari data yang akan diupdate
      const updateData = { ...Data };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }

      // Jika tidak ada data untuk diupdate
      if (Object.keys(updateData).length === 0) {
        return resolve({ affectedRows: 0, message: 'No data to update' });
      }

      connection.query('UPDATE siswa SET ? WHERE id_siswa = ?', [updateData, id], (err, result) => {
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

 // ✅ Update method login untuk mendukung bcrypt
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
      WHERE siswa.nis = ?
    `;

    // Hanya cari berdasarkan NIS
    connection.query(sql, [nis], async (err, results) => {
      if (err) return reject(err);

      // Cek apakah siswa ditemukan
      if (results.length === 0) {
        return reject(new Error('NIS atau password salah'));
      }

      // Ambil password dari hasil query
      const siswa = results[0];

      // Bandingkan password yang diinput dengan password hash yang ada di database
      const isPasswordValid = await bcrypt.compare(password, siswa.password);

      if (isPasswordValid) {
        // Jika password valid, kembalikan data siswa tanpa password
        const { password: _, ...siswaWithoutPassword } = siswa;
        resolve(siswaWithoutPassword);
      } else {
        // Jika password tidak valid, beri error
        reject(new Error('NIS atau password salah'));
      }
    });
  });
}


  // ✅ Tambahkan method baru untuk mendapatkan siswa berdasarkan NIS saja
  static async getByNIS(nis) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          siswa.id_siswa,
          siswa.nama_siswa,
          siswa.nis,
          siswa.password,
          siswa.alamat,
          siswa.id_kelas,
          kelas.kode_kelas
        FROM siswa
        LEFT JOIN kelas ON siswa.id_kelas = kelas.id_kelas
        WHERE siswa.nis = ?
      `;
      
      connection.query(sql, [nis], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
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

  // ✅ Validasi cek NIS duplikat
  static async isNisExist(nis) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM siswa WHERE nis = ?', [nis], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.length > 0);
      });
    });
  }

  // ✅ Method baru untuk cek NIS duplikat saat update (exclude ID yang sedang diupdate)
  static async isNisExistForUpdate(nis, excludeId) {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM siswa WHERE nis = ? AND id_siswa != ?', 
        [nis, excludeId], 
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.length > 0);
        }
      );
    });
  }

}

module.exports = Model_Siswa;