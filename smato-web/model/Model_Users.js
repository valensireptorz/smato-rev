const connection = require('../config/database');

class Model_Users{
    static async getAll() {
        return new Promise((resolve, reject) =>{
            connection.query('select * from users order by id_users desc', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Login(username) {
        return new Promise((resolve, reject) => {
            connection.query('select * from users where username = ?', [username], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }
    static async Store(Data) {
        return new Promise((resolve, reject) => {
            connection.query('insert into users set ?', Data, function(err, result) {
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
            connection.query('select * from users where id_users= ' + id, (err, rows) => {
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
            connection.query('update users set ? where id_users = ' + id, Data, function(err, result) {
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
            connection.query('delete from users where id_users = ' + id, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}

module.exports = Model_Users;