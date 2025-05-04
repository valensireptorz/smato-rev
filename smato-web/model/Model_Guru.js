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

}

module.exports = Model_Guru;