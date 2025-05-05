var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var flash = require('express-flash');
var session = require('express-session');
const MemoryStore = require('session-memory-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var superusersRouter = require('./routes/superusers');
var megausersRouter = require('./routes/megausers');

var guruRouter = require('./routes/guru');
var kelasRouter = require('./routes/kelas');
var mapelRouter = require('./routes/mapel');
var jadwalRouter = require('./routes/jadwal');
var tugasRouter = require('./routes/tugas');
var pengumpulanRouter = require('./routes/pengumpulan');
var siswaRouter = require('./routes/siswa');
var absenRouter = require('./routes/absen');
var presensiRouter = require('./routes/presensi');
var apisiswaRouter = require('./routes/api/siswa');
var apimapelRouter = require('./routes/api/mapel');
var apipresensiRouter = require('./routes/api/presensi');
var apiabsenRouter = require('./routes/api/absen');
var apitugasRouter = require('./routes/api/tugas');
var apiguruRouter = require('./routes/api/guru');
var apikelasRouter = require('./routes/api/kelas');
var apipengumpulanRouter = require('./routes/api/pengumpulan');
var guru_kelasRouter = require('./routes/guru_kelas');






var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use(session({
  cookie: {
    maxAge: 60000000000,
    secure: false,
    httpOnly:true,
    sameSite: 'strict',
  },
  store: new MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: 'secret'
  }));
  app.use(flash()) // gunakan flashh express menggunakan use
  
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/superusers', superusersRouter);
  app.use('/megausers', megausersRouter);

  app.use('/guru', guruRouter);
  app.use('/kelas', kelasRouter);
  app.use('/mapel', mapelRouter);
  app.use('/jadwal', jadwalRouter);
  app.use('/tugas', tugasRouter);
  app.use('/pengumpulan', pengumpulanRouter);
  app.use('/siswa', siswaRouter);
  app.use('/absen', absenRouter);
  app.use('/presensi', presensiRouter);
  app.use('/api/siswa', apisiswaRouter);
  app.use('/api/mapel', apimapelRouter);
  app.use('/api/presensi', apipresensiRouter);
  app.use('/api/tugas', apitugasRouter);
  app.use('/api/absen', apiabsenRouter);
  app.use('/api/guru', apiguruRouter);
  app.use('/api/kelas', apikelasRouter);
  app.use('/api/pengumpulan', apipengumpulanRouter);
  app.use('/guru_kelas', guru_kelasRouter);

  







app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
