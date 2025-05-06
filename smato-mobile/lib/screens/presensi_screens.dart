import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui';

import '../theme/app_colors.dart';
import '../widgets/presensi_button.dart';
import '../api/presensi_service.dart';
import 'beranda_screens.dart';

class PresensiScreen extends StatefulWidget {
  final int idSiswa, idMapel, idAbsen, idGuru;
  final String namaMapel, namaGuru, jamSelesai;

  const PresensiScreen({
    Key? key,
    required this.idSiswa,
    required this.idMapel,
    required this.namaMapel,
    required this.idAbsen,
    required this.idGuru,
    required this.namaGuru,
    required this.jamSelesai,
  }) : super(key: key);

  @override
  _PresensiScreenState createState() => _PresensiScreenState();
}

class _PresensiScreenState extends State<PresensiScreen> with TickerProviderStateMixin {
  late Future<Map<String, dynamic>> riwayatPresensi;
  bool _isLoading = false;
  bool _isRefreshing = false;
  bool _hasPresensiToday = false;
  String? _presensiTimestamp; // Untuk menyimpan waktu presensi
  late AnimationController _buttonAnimationController;
  late Animation _buttonAnimation;
  
  // Animasi tambahan untuk UI yang lebih interaktif
  late AnimationController _cardAnimationController;
  late Animation<double> _cardAnimation;

  // Key untuk SharedPreferences
  late String _presensiKey;
  late String _timestampKey;

  bool _isPresensiClosed = false; // Flag untuk menandakan presensi sudah ditutup

  @override
  void initState() {
    super.initState();
    tzdata.initializeTimeZones(); // Initialize timezone data
    
    // Set key untuk SharedPreferences berdasarkan idSiswa dan idAbsen
    _presensiKey = 'presensi_${widget.idSiswa}_${widget.idAbsen}';
    _timestampKey = 'timestamp_${widget.idSiswa}_${widget.idAbsen}';
    
    // Load data lokal terlebih dahulu
    _loadLocalPresensiStatus();
    
    // Kemudian load dari API
    _loadRiwayatPresensi();
    
    // Animasi untuk tombol presensi
    _buttonAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _buttonAnimation = Tween(begin: 1.0, end: 0.95).animate(CurvedAnimation(
      parent: _buttonAnimationController,
      curve: Curves.easeInOut,
    ));
    
    // Animasi untuk kartu
    _cardAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _cardAnimation = CurvedAnimation(
      parent: _cardAnimationController,
      curve: Curves.easeOutQuint,
    );
    _cardAnimationController.forward();

    _checkPresensiStatus(); // Memanggil fungsi untuk mengecek apakah presensi sudah lewat
  }
  
  @override
  void dispose() {
    _buttonAnimationController.dispose();
    _cardAnimationController.dispose();
    super.dispose();
  }

  // Load status presensi dari SharedPreferences
  Future<void> _loadLocalPresensiStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      setState(() {
        _hasPresensiToday = prefs.getBool(_presensiKey) ?? false;
        _presensiTimestamp = prefs.getString(_timestampKey);
      });
    } catch (e) {
      print("Error loading local attendance status: $e");
    }
  }

  // Simpan status presensi ke SharedPreferences
  Future<void> _saveLocalPresensiStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final now = DateTime.now();
      final formattedTime = DateFormat('dd MMMM yyyy, HH:mm:ss').format(now);
      
      await prefs.setBool(_presensiKey, true);
      await prefs.setString(_timestampKey, formattedTime);
      
      setState(() {
        _hasPresensiToday = true;
        _presensiTimestamp = formattedTime;
      });
    } catch (e) {
      print("Error saving local attendance status: $e");
    }
  }

  // Fungsi untuk mengecek apakah waktu presensi sudah lewat
  void _checkPresensiStatus() {
    try {
      final now = DateTime.now();
      final currentTime = DateTime(now.year, now.month, now.day, now.hour, now.minute);
      
      // Parse jam_selesai (format HH:MM)
      final parts = widget.jamSelesai.split(':');
      final hour = int.parse(parts[0]);
      final minute = int.parse(parts[1]);
      
      final presensiEndTime = DateTime(now.year, now.month, now.day, hour, minute);
      
      if (currentTime.isAfter(presensiEndTime)) {
        setState(() {
          _isPresensiClosed = true; // Menandakan bahwa presensi sudah ditutup
        });
      }
    } catch (e) {
      print("Error checking presensi status: $e");
    }
  }

  Future<void> _loadRiwayatPresensi() async {
    setState(() => _isLoading = true);
    try {
      riwayatPresensi = PresensiService().getRiwayatPresensi(widget.idSiswa.toString());
      final result = await riwayatPresensi;
      
      // Check if student has attendance today
      final List riwayat = result['riwayatPresensi'] ?? [];
      final today = DateTime.now();
      final formattedToday = DateFormat('yyyy-MM-dd').format(today);
      
      bool hasAttendanceFromAPI = riwayat.any((item) {
        final tanggal = DateTime.parse(item['tanggal_presensi']);
        final formattedTanggal = DateFormat('yyyy-MM-dd').format(tanggal);
        return formattedTanggal == formattedToday && item['id_absen'].toString() == widget.idAbsen.toString();
      });
      
      // Jika API menunjukkan bahwa siswa sudah presensi, simpan ke lokal
      if (hasAttendanceFromAPI && !_hasPresensiToday) {
        await _saveLocalPresensiStatus();
      }
      
      setState(() {
        // Prioritaskan status lokal, tapi jika API menunjukkan telah presensi, update status lokal
        if (hasAttendanceFromAPI) {
          _hasPresensiToday = true;
        }
      });
    } catch (e) {
      print("Error loading attendance history: $e");
      // Jika tidak berhasil mendapatkan data dari API, tetap gunakan data lokal
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _kirimPresensi() async {
    if (_isPresensiClosed) {
      _showSnackBar('Presensi sudah ditutup', isError: true);
      return;
    }
    
    if (_hasPresensiToday) {
      _showSnackBar('Anda sudah melakukan presensi hari ini', isWarning: true);
      return;
    }

    _buttonAnimationController.forward();
    setState(() => _isLoading = true);
    
    try {
      final response = await PresensiService().kirimPresensi(
        widget.idSiswa.toString(),
        widget.idMapel.toString(),
        widget.idAbsen.toString(),
        widget.idGuru.toString(),
      );

      if (response['success']) {
        // Simpan status presensi ke penyimpanan lokal
        await _saveLocalPresensiStatus();
        
        await _loadRiwayatPresensi();
        _showSnackBar('Berhasil melakukan presensi');
      } else {
        _showSnackBar(response['message'], isError: true);
      }
    } catch (e) {
      print("Error submitting attendance: $e");
      _showSnackBar('Gagal mengirim presensi. Silakan coba lagi.', isError: true);
    } finally {
      setState(() => _isLoading = false);
      _buttonAnimationController.reverse();
    }
  }

  // Custom SnackBar dengan warna berbeda berdasarkan tipe
  void _showSnackBar(String message, {bool isError = false, bool isWarning = false, bool isSuccess = false}) {
    Color backgroundColor;
    
    if (isError) {
      backgroundColor = Colors.red.shade700;
    } else if (isWarning) {
      backgroundColor = Colors.amber.shade700;
    } else if (isSuccess) {
      backgroundColor = Colors.green.shade700;
    } else {
      backgroundColor = const Color(0xFF48C9B0);
    }
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.montserrat(
            fontWeight: FontWeight.w500,
          ),
        ),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'OK',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }

  Future<void> _refreshData() async {
    setState(() => _isRefreshing = true);
    try {
      await _loadRiwayatPresensi();
    } catch (e) {
      print("Error refreshing data: $e");
    } finally {
      setState(() => _isRefreshing = false);
    }
  }

  // Tampilan kartu presensi yang lebih modern
  Widget _buildPresensiCard() {
    final Color cardColor = _isPresensiClosed 
        ? Colors.blueGrey.withOpacity(0.15) 
        : (_hasPresensiToday ? Colors.green.withOpacity(0.15) : Colors.white.withOpacity(0.15));
        
    final Color borderColor = _isPresensiClosed 
        ? Colors.blueGrey.withOpacity(0.3) 
        : (_hasPresensiToday ? Colors.green.withOpacity(0.3) : Colors.white.withOpacity(0.25));
    
    return FadeTransition(
      opacity: _cardAnimation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.1),
          end: Offset.zero,
        ).animate(_cardAnimation),
        child: Container(
          width: double.infinity,
          margin: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: borderColor, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 15,
                offset: const Offset(0, 8),
                spreadRadius: 1,
              )
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            widget.namaMapel,
                            style: GoogleFonts.montserrat(
                              fontSize: 22,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _buildStatusBadge(),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.person, color: Colors.white70, size: 18),
                        const SizedBox(width: 10),
                        Text(
                          widget.namaGuru,
                          style: GoogleFonts.montserrat(
                            fontSize: 15,
                            color: Colors.white.withOpacity(0.85),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.access_time_rounded, color: Colors.white70, size: 18),
                        const SizedBox(width: 10),
                        Text(
                          'Batas Presensi: ${widget.jamSelesai} WIB',
                          style: GoogleFonts.montserrat(
                            fontSize: 15,
                            color: Colors.white.withOpacity(0.85),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    
                    // Tambahkan waktu presensi jika sudah melakukan presensi
                    if (_hasPresensiToday && _presensiTimestamp != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.check_circle_outline, color: Colors.green, size: 18),
                          const SizedBox(width: 10),
                          Text(
                            'Presensi pada: $_presensiTimestamp',
                            style: GoogleFonts.montserrat(
                              fontSize: 10,
                              color: Colors.green,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                    
                    const SizedBox(height: 30),
                    
                    // Jika sudah presensi, tampilkan informasi bahwa presensi sudah dilakukan
                    if (_hasPresensiToday)
                      _buildAttendanceConfirmation()
                    else
                      Center(
                        child: ScaleTransition(
                          scale: _buttonAnimation as Animation<double>,
                          child: _buildPresenceButton(),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
  
  // Widget untuk menampilkan konfirmasi presensi
  Widget _buildAttendanceConfirmation() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.green.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.check_circle,
            color: Colors.green,
            size: 50,
          ),
          const SizedBox(height: 16),
          Text(
            'Presensi Berhasil',
            style: GoogleFonts.montserrat(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.green,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Anda telah melakukan presensi untuk kelas ini.',
            style: GoogleFonts.montserrat(
              fontSize: 14,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
  
  // Status badge yang menunjukkan status presensi
  Widget _buildStatusBadge() {
    Color badgeColor;
    String statusText;
    IconData iconData;
    
    if (_isPresensiClosed) {
      badgeColor = Colors.blueGrey;
      statusText = 'Ditutup';
      iconData = Icons.lock_outline;
    } else if (_hasPresensiToday) {
      badgeColor = Colors.green;
      statusText = 'Sudah Presensi';
      iconData = Icons.check_circle_outline;
    } else {
      badgeColor = Colors.orange;
      statusText = 'Belum Presensi';
      iconData = Icons.pending_outlined;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: badgeColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: badgeColor.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(iconData, size: 14, color: badgeColor),
          const SizedBox(width: 4),
          Text(
            statusText,
            style: GoogleFonts.montserrat(
              fontSize: 12,
              color: badgeColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
  
  // Tombol presensi yang diperbarui dengan animasi
  Widget _buildPresenceButton() {
    Color buttonColor;
    String buttonText;
    IconData iconData;
    
    if (_isPresensiClosed) {
      buttonColor = Colors.blueGrey;
      buttonText = 'Presensi Ditutup';
      iconData = Icons.lock_outline;
    } else if (_hasPresensiToday) {
      buttonColor = Colors.green;
      buttonText = 'Sudah Presensi';
      iconData = Icons.check_circle_outline;
    } else {
      buttonColor = const Color(0xFF48C9B0);
      buttonText = 'Presensi Sekarang';
      iconData = Icons.touch_app_outlined;
    }
    
    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            buttonColor,
            buttonColor.withBlue(buttonColor.blue + 20),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: buttonColor.withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: _isPresensiClosed || _hasPresensiToday || _isLoading ? null : _kirimPresensi,
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_isLoading)
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                else
                  Icon(iconData, color: Colors.white),
                const SizedBox(width: 10),
                Text(
                  buttonText,
                  style: GoogleFonts.montserrat(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Kartu riwayat presensi yang diperbarui
  Widget _buildHistoryCard() {
    return FadeTransition(
      opacity: _cardAnimation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.2),
          end: Offset.zero,
        ).animate(_cardAnimation),
        child: Container(
          width: double.infinity,
          margin: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.15),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.25), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 15,
                offset: const Offset(0, 8),
                spreadRadius: 1,
              )
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: FutureBuilder<Map<String, dynamic>>(
                  future: riwayatPresensi,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting || _isLoading) {
                      return _buildLoadingSkeleton();
                    } else if (snapshot.hasError) {
                      return _buildErrorState(snapshot.error.toString());
                    } else if (!snapshot.hasData || snapshot.data!['riwayatPresensi'] == null) {
                      // Jika data kosong dari API tapi sudah presensi secara lokal
                      if (_hasPresensiToday) {
                        return _buildLocalAttendanceState();
                      }
                      return _buildEmptyState();
                    }

                    final List riwayat = snapshot.data!['riwayatPresensi'];
                    final isKosong = riwayat.isEmpty;

                    // Jika data kosong dari API tapi sudah presensi secara lokal
                    if (isKosong && _hasPresensiToday) {
                      return _buildLocalAttendanceState();
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.history, color: Colors.white, size: 20),
                                const SizedBox(width: 10),
                                Text(
                                  'Riwayat Presensi',
                                  style: GoogleFonts.montserrat(
                                    fontSize: 18,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              '${riwayat.length} total',
                              style: GoogleFonts.montserrat(
                                fontSize: 12,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white24, height: 30),
                        if (!isKosong)
                          Column(
                            children: [
                              SizedBox(
                                height: 200,
                                child: ListView.separated(
                                  physics: const BouncingScrollPhysics(),
                                  itemCount: riwayat.length,
                                  separatorBuilder: (_, __) => const Divider(color: Colors.white12, height: 20),
                                  itemBuilder: (context, index) {
                                    final item = riwayat[index];
                                    return _buildHistoryItem(item);
                                  },
                                ),
                              ),
                            ],
                          )
                        else
                          _buildEmptyState(),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Tampilan untuk presensi yang tersimpan secara lokal
  Widget _buildLocalAttendanceState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.history, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Text(
              'Riwayat Presensi',
              style: GoogleFonts.montserrat(
                fontSize: 18,
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const Divider(color: Colors.white24, height: 30),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.green.withOpacity(0.3),
              width: 1,
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_circle_outline,
                      color: Colors.green,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Presensi Hari Ini',
                          style: GoogleFonts.montserrat(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        if (_presensiTimestamp != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Waktu: $_presensiTimestamp',
                            style: GoogleFonts.montserrat(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    'Presensi berhasil tercatat',
                    style: GoogleFonts.montserrat(
                      fontSize: 14,
                      color: Colors.green,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Item riwayat presensi yang lebih terstruktur
  Widget _buildHistoryItem(Map<String, dynamic> item) {
    final tanggal = formatDateToWIB(item['tanggal_presensi']);
    
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white24,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                item['id_absen'].toString(),
                style: GoogleFonts.montserrat(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Presensi ID#${item['id_absen']}',
                  style: GoogleFonts.montserrat(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 12, color: Colors.white70),
                    const SizedBox(width: 4),
                    Text(
                      tanggal,
                      style: GoogleFonts.montserrat(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.check_circle, color: Colors.green, size: 18),
        ],
      ),
    );
  }
  
  // Loading skeleton untuk riwayat
  Widget _buildLoadingSkeleton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: Colors.white30,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
            Container(
              width: 140,
              height: 20,
              decoration: BoxDecoration(
                color: Colors.white30,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ],
        ),
        const Divider(color: Colors.white24, height: 30),
        ...List.generate(3, (index) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white10,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 130,
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.white30,
                        borderRadius: BorderRadius.circular(7),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 80,
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.white30,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }
  
  // State error untuk riwayat
  Widget _buildErrorState(String error) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.error_outline, color: Colors.red, size: 40),
        const SizedBox(height: 16),
        Text(
          'Terjadi kesalahan saat memuat data',
          style: GoogleFonts.montserrat(
            fontSize: 16,
            color: Colors.white,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'Tarik untuk refresh atau coba lagi nanti',
          style: GoogleFonts.montserrat(
            fontSize: 14,
            color: Colors.white70,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
  
  // State kosong untuk riwayat
  Widget _buildEmptyState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(height: 20),
        const Icon(Icons.history_outlined, color: Colors.white70, size: 40),
        const SizedBox(height: 16),
        Text(
          'Belum ada riwayat presensi',
          style: GoogleFonts.montserrat(
            fontSize: 16,
            color: Colors.white,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'Riwayat presensi Anda akan muncul di sini',
          style: GoogleFonts.montserrat(
            fontSize: 14,
            color: Colors.white70,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  String formatDateToWIB(String dateString) {
    final date = DateTime.parse(dateString);
    final indonesiaTimeZone = tz.getLocation('Asia/Jakarta');
    final indonesiaDate = tz.TZDateTime.from(date, indonesiaTimeZone);
    final dateFormat = DateFormat('dd MMMM yyyy, HH:mm');
    return dateFormat.format(indonesiaDate);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const BerandaScreen()),
              ),
            ),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: _isRefreshing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Icon(Icons.refresh, color: Colors.white),
                onPressed: _isRefreshing ? null : _refreshData,
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background gradient dengan efek mendalam
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF1A3980),
                  Color(0xFF2A5298),
                  Color(0xFF2C418F),
                ],
                stops: [0.1, 0.5, 0.9],
              ),
            ),
          ),
          
          // Efek bubble di latar belakang untuk kedalaman
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Colors.white.withOpacity(0.1),
                    Colors.white.withOpacity(0.0),
                  ],
                  stops: const [0.1, 1.0],
                ),
              ),
            ),
          ),
          
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Colors.white.withOpacity(0.08),
                    Colors.white.withOpacity(0.0),
                  ],
                  stops: const [0.1, 1.0],
                ),
              ),
            ),
          ),
          
          // Pola latar belakang
          Positioned.fill(
            child: Opacity(
              opacity: 0.03,
              child: Container(
                decoration: const BoxDecoration(
                  image: DecorationImage(
                    image: NetworkImage('https://www.transparenttextures.com/patterns/cubes.png'),
                    repeat: ImageRepeat.repeat,
                  ),
                ),
              ),
            ),
          ),
          
          // Konten utama
          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 480),
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 20),
                    FadeTransition(
                      opacity: _cardAnimation,
                      child: Column(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white.withOpacity(0.4), width: 2),
                            ),
                            child: Icon(
                              _hasPresensiToday 
                                  ? Icons.check_circle_outline 
                                  : Icons.touch_app_outlined,
                              size: 30, 
                              color: _hasPresensiToday 
                                  ? Colors.green 
                                  : Colors.white,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _hasPresensiToday 
                                ? 'Presensi Berhasil' 
                                : 'Presensi Kelas',
                            style: GoogleFonts.montserrat(
                              fontSize: 24,
                              color: _hasPresensiToday 
                                  ? Colors.green
                                  : Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            _hasPresensiToday
                                ? 'Anda sudah melakukan presensi untuk kelas ini'
                                : 'Silakan lakukan presensi untuk kelas ini',
                            style: GoogleFonts.montserrat(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildPresensiCard(),
                    _buildHistoryCard(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}