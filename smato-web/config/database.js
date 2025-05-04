let mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tugas_akhir',
});

connection.connect(function(error){
    if(!!error){
        console.log(error)
    }else{
        console.log('connection success')
    }
});

module.exports = connection;