const connection = require('../config/database');

class Model_Mapel {


    // Model_Mapel.js

static async getBySiswaId(siswaId) {
    return new Promise((resolve, reject) => {
        connection.query(`
            SELECT m.id_mapel, m.nama_mapel, m.jenis_mapel
            FROM mapel m
            JOIN siswa_mapel sm ON sm.id_mapel = m.id_mapel
            WHERE sm.id_siswa = ?
        `, [siswaId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

    static async getAll() {
        return new Promise((resolve, reject) =>{
            connection.query('select * from mapel order by id_mapel desc', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async getByKelas(id_kelas) {
        return new Promise((resolve, reject) => {
          connection.query(`
            SELECT * FROM mapel
            WHERE id_kelas = ?
          `, [id_kelas], (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
      }
      

    static async Store(Data) {
        return new Promise((resolve, reject) => {
            connection.query('insert into mapel set ?', Data, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) =>{
            connection.query('select * from mapel where id_mapel= ' + id, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update mapel set ? where id_mapel= ' + id, Data, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from mapel where id_mapel = ' + id, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getByNama(nama_mapel) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM mapel WHERE nama_mapel = ?', [nama_mapel], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]); // hanya ambil 1 mapel
                }
            });
        });
    }
    

}

module.exports = Model_Mapel;