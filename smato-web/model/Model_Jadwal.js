const connection = require("../config/database");

class Model_Jadwal {

  static getByKelas(kelas) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT j.*, m.nama_mapel, g.nama_guru, k.kode_kelas
                   FROM jadwal j
                   JOIN mapel m ON m.id_mapel = j.id_mapel
                   JOIN guru g ON g.id_guru = j.id_guru
                   JOIN kelas k ON k.id_kelas = j.id_kelas
                   WHERE k.kode_kelas LIKE ?
                   ORDER BY j.hari, j.jam_mulai ASC`;

      connection.query(sql, [`%${kelas}%`], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
  
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT j.*, m.nama_mapel, g.nama_guru, k.kode_kelas
                   FROM jadwal j
                   JOIN mapel m ON m.id_mapel = j.id_mapel
                   JOIN guru g ON g.id_guru = j.id_guru
                   JOIN kelas k ON k.id_kelas = j.id_kelas
                   ORDER BY j.hari, j.jam_mulai ASC`;
  
      connection.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
  

  static async Store(Data) {
    return new Promise((resolve, reject) => {
      console.log("Data yang disimpan:", Data); // Debugging
      connection.query("INSERT INTO jadwal SET ?", Data, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async getId(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT a.*, b.nama_mapel, c.nama_guru, d.kode_kelas 
         FROM jadwal AS a 
         LEFT JOIN mapel AS b ON b.id_mapel = a.id_mapel 
         LEFT JOIN guru AS c ON c.id_guru = a.id_guru
         LEFT JOIN kelas AS d ON d.id_kelas = a.id_kelas 
         WHERE a.id_jadwal = ?`,
        [id],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static async Update(id, Data) {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE jadwal SET ? WHERE id_jadwal = ?",
        [Data, id],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  static async getGroupedByDay() {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT j.*, m.nama_mapel, g.nama_guru, k.kode_kelas FROM jadwal j ' +
            'JOIN mapel m ON m.id_mapel = j.id_mapel ' +
            'JOIN guru g ON g.id_guru = j.id_guru ' +
            'JOIN kelas k ON k.id_kelas = j.id_kelas ' +
            'ORDER BY j.hari, j.jam_mulai ASC', 
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Mengelompokkan data berdasarkan hari
                    const groupedData = rows.reduce((acc, item) => {
                        if (!acc[item.hari]) {
                            acc[item.hari] = [];
                        }
                        acc[item.hari].push(item);
                        return acc;
                    }, {});

                    resolve(groupedData);  // Mengembalikan data yang sudah dikelompokkan
                }
            }
        );
    });
}




  static async Delete(id) {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM jadwal WHERE id_jadwal = ?", [id], function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}



module.exports = Model_Jadwal;
