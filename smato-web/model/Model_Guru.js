const connection = require('../config/database');

class Model_Guru {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM guru", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
    static async getAll() {
        return new Promise((resolve, reject) =>{
            connection.query('select * from guru order by id_guru desc', (err, rows) => {
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
            connection.query('insert into guru set ?', Data, function(err, result) {
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
            connection.query('select * from guru  where id_guru = ' + id, (err, rows) => {
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
            connection.query('update guru set ? where id_guru= ' + id, Data, function(err, result) {
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
            connection.query('delete from guru where id_guru = ' + id, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    // Metode baru untuk memeriksa apakah NIP sudah ada di database
    static async checkNipExists(nip) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM guru WHERE nip = ?', [nip], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    // Jika count > 0, berarti NIP sudah ada
                    resolve(result[0].count > 0);
                }
            })
        });
    }

    // Metode baru untuk memeriksa apakah NIP sudah ada, kecuali untuk guru dengan ID tertentu
    static async checkNipExistsExcept(nip, id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM guru WHERE nip = ? AND id_guru != ?', [nip, id], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    // Jika count > 0, berarti NIP digunakan oleh guru lain
                    resolve(result[0].count > 0);
                }
            })
        });
    }
}

module.exports = Model_Guru;