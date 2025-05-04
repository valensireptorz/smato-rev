const connection = require('../config/database');

class Model_Kelas {

    static async getAll() {
        return new Promise((resolve, reject) =>{
            connection.query('select * from kelas order by id_kelas desc', (err, rows) => {
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
            connection.query('insert into kelas set ?', Data, function(err, result) {
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
            connection.query('select * from kelas where id_kelas= ' + id, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // ✅ Tambahan: getById versi aman (untuk login siswa)
    static async getById(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM kelas WHERE id_kelas = ?', [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]); // hanya return 1 objek
                }
            });
        });
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update kelas set ? where id_kelas= ' + id, Data, function(err, result) {
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
            connection.query('delete from kelas where id_kelas = ' + id, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}

module.exports = Model_Kelas;