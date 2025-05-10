import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'dart:ui';

import '../api/absen_services.dart';
import '../api/tugas_services.dart';
import '../api/siswa_service.dart';
import '../widgets/sidebar_widget.dart';
import '../widgets/tugas_widget.dart';
import '../widgets/subject_card.dart';
import 'presensi_screens.dart';

class BerandaScreen extends StatefulWidget {
  const BerandaScreen({Key? key}) : super(key: key);

  @override
  State<BerandaScreen> createState() => _BerandaScreenState();
}

class _BerandaScreenState extends State<BerandaScreen>
    with SingleTickerProviderStateMixin {
  late String? _idSiswa;
  late Future<List<Map<String, dynamic>>> _absenList;
  late Future<List<Map<String, dynamic>>> _tugasList;
  late Future<Map<String, dynamic>> _siswaData;
  
  // Map untuk menyimpan status pengumpulan tugas
  Map<String, bool> _submissionStatus = {};
  
  // Map untuk menyimpan status presensi
  Map<String, bool> _presensiStatus = {};

  bool _showAbsenList = true; // Set to true to always show by default
  bool _showTugasList = true; // Set to true to always show by default
  bool _isRefreshing = false;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _loadSiswaData();
    _absenList = AbsenService.getAllAbsen();
    _tugasList = TugasService.getAllTugas();
    
    // Load submission status
    _loadSubmissionStatus();
    
    // Load presensi status
    _loadPresensiStatus();

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();
  }
  

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Load presensi status dari SharedPreferences
  Future<void> _loadPresensiStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Pastikan _idSiswa tersedia
      if (_idSiswa == null) {
        // Tunggu hingga data siswa selesai dimuat
        await _loadSiswaData();
        if (_idSiswa == null) {
          // Jika masih null, gunakan nilai default
          _idSiswa = '1';
        }
      }
      
      // Load absen list terlebih dahulu
      final absenList = await _absenList;
      
      // Periksa presensi status untuk setiap absen
      for (var absen in absenList) {
        String idAbsen = absen['id_absen'].toString();
        String presensiKey = 'presensi_${_idSiswa}_$idAbsen';
        bool isPresent = prefs.getBool(presensiKey) ?? false;
        
        setState(() {
          _presensiStatus[idAbsen] = isPresent;
        });
      }
    } catch (e) {
      print("Error loading presensi status: $e");
    }
  }

  // Load submission status dari SharedPreferences
  Future<void> _loadSubmissionStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Pastikan _idSiswa tersedia
      if (_idSiswa == null) {
        // Tunggu hingga data siswa selesai dimuat
        await _loadSiswaData();
        if (_idSiswa == null) {
          // Jika masih null, gunakan nilai default
          _idSiswa = '1';
        }
      }
      
      // Load tugas list terlebih dahulu
      final tugasList = await _tugasList;
      
      // Periksa submission status untuk setiap tugas
      for (var tugas in tugasList) {
        String idTugas = tugas['id_tugas'].toString();
        String submissionKey = 'submission_${_idSiswa}_$idTugas';
        bool isSubmitted = prefs.getBool(submissionKey) ?? false;
        
        setState(() {
          _submissionStatus[idTugas] = isSubmitted;
        });
      }
    } catch (e) {
      print("Error loading submission status: $e");
    }
  }

  // Fungsi untuk memuat data siswa
  Future<void> _loadSiswaData() async {
    final prefs = await SharedPreferences.getInstance();
    String idSiswa = prefs.getString('id_siswa') ?? '1';
    setState(() {
      _idSiswa = idSiswa;
      _siswaData = SiswaService().getSiswaById(idSiswa);
    });
  }

  // Fungsi untuk refresh data
  void _refreshData() async {
    setState(() {
      _isRefreshing = true;
    });
    
    await Future.delayed(const Duration(seconds: 1));
    
    // Refresh all data
    _absenList = AbsenService.getAllAbsen();
    _tugasList = TugasService.getAllTugas();
    await _loadSubmissionStatus();
    await _loadPresensiStatus();
    
    setState(() {
      _isRefreshing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFC),
      body: Stack(
        children: [
          // Background gradient overlay
          Positioned(
            top: -screenSize.height * 0.15,
            right: -screenSize.width * 0.25,
            child: Container(
              width: screenSize.width * 0.7,
              height: screenSize.width * 0.7,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF3575E3).withOpacity(0.2),
                    const Color(0xFF3575E3).withOpacity(0.0),
                  ],
                  stops: const [0.1, 1.0],
                ),
              ),
            ),
          ),
          
          // Content
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: CustomScrollView(
                slivers: [
                  // App Bar
                  SliverAppBar(
                    backgroundColor: Colors.transparent,
                    elevation: 0,
                    floating: true,
                    snap: true,
                    leading: GestureDetector(
                      onTap: () => _showSidebar(context),
                      child: Container(
                        margin: const EdgeInsets.only(left: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.menu, color: Color(0xFF2762F8), size: 24),
                      ),
                    ),
                    actions: [
                      Container(
                        margin: const EdgeInsets.only(right: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: IconButton(
                          icon: _isRefreshing
                              ? SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      const Color(0xFF2762F8),
                                    ),
                                  ),
                                )
                              : const Icon(Icons.refresh, color: Color(0xFF2762F8), size: 24),
                          onPressed: _refreshData,
                        ),
                      ),
                    ],
                  ),
                  
                  // Header Content
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Student Information
                          FutureBuilder<Map<String, dynamic>>(
                            future: _siswaData,
                            builder: (context, snapshot) {
                              if (snapshot.connectionState == ConnectionState.waiting) {
                                return _buildProfileSkeleton();
                              } else if (snapshot.hasError || !snapshot.hasData) {
                                return _buildErrorProfile();
                              }
                              var siswa = snapshot.data!['data'];
                              _idSiswa = siswa['id_siswa'].toString();
                              
                              return Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF2762F8), Color(0xFF5E9CFA)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF2762F8).withOpacity(0.2),
                                      blurRadius: 15,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    // Profile Avatar
                                    Container(
                                      width: 60,
                                      height: 60,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(0.1),
                                            blurRadius: 8,
                                            spreadRadius: 1,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Center(
                                        child: Text(
                                          _getInitials(siswa['nama_siswa'] ?? 'Siswa'),
                                          style: GoogleFonts.montserrat(
                                            fontSize: 24,
                                            fontWeight: FontWeight.w600,
                                            color: const Color(0xFF2762F8),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 15),
                                    // Student Info
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Halo, ${siswa['nama_siswa'] ?? 'Siswa'} 👋',
                                            style: GoogleFonts.montserrat(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 4,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withOpacity(0.2),
                                              borderRadius: BorderRadius.circular(20),
                                            ),
                                            child: Text(
                                              'ID: ${siswa['id_siswa']}',
                                              style: GoogleFonts.montserrat(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                          
                          const SizedBox(height: 25),
                          
                          // Menu Options
                          Row(
                            children: [
                              Expanded(
                                child: _buildMenuCard(
                                  Icons.access_time_rounded,
                                  'Absensi',
                                  'Lihat daftar absensi kelas',
                                  Colors.blue.shade700,
                                  () {
                                    setState(() => _showAbsenList = !_showAbsenList);
                                  },
                                  _showAbsenList,
                                ),
                              ),
                              const SizedBox(width: 15),
                              Expanded(
                                child: _buildMenuCard(
                                  Icons.assignment_rounded,
                                  'Tugas',
                                  'Kelola tugas-tugas kelas',
                                  Colors.orange.shade700,
                                  () {
                                    setState(() => _showTugasList = !_showTugasList);
                                  },
                                  _showTugasList,
                                ),
                              ),
                            ],
                          ),
                          
                          const SizedBox(height: 25),
                        ],
                      ),
                    ),
                  ),
                  
                  // Attendance List
                  SliverToBoxAdapter(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: _showAbsenList ? Padding(
                        padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
                        child: _buildAbsenList(),
                      ) : const SizedBox.shrink(),
                    ),
                  ),
                  
                  // Assignment List
                  SliverToBoxAdapter(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: _showTugasList ? Padding(
                        padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
                        child: _buildTugasList(),
                      ) : const SizedBox.shrink(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Profile skeleton loading animation
  Widget _buildProfileSkeleton() {
    return Container(
      height: 100,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.grey.shade300, Colors.grey.shade200],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.grey.shade400,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120,
                height: 20,
                decoration: BoxDecoration(
                  color: Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: 80,
                height: 16,
                decoration: BoxDecoration(
                  color: Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Error profile display
  Widget _buildErrorProfile() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.red.shade200, width: 1),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red.shade400, size: 40),
          const SizedBox(width: 15),
          Expanded(
            child: Text(
              "Gagal memuat data siswa. Silakan coba lagi nanti.",
              style: GoogleFonts.montserrat(
                fontSize: 14,
                color: Colors.red.shade700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Enhanced menu card
  Widget _buildMenuCard(
    IconData icon,
    String title,
    String subtitle,
    Color color,
    VoidCallback onTap,
    bool isActive,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(
            color: isActive ? color.withOpacity(0.3) : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: GoogleFonts.montserrat(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.black.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: GoogleFonts.montserrat(
                fontSize: 12,
                fontWeight: FontWeight.w400,
                color: Colors.black.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 4,
                    decoration: BoxDecoration(
                      color: isActive ? color.withOpacity(0.7) : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAbsenList() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _absenList,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildLoadingSkeleton();
        } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return _buildEmptyState("Tidak ada data absensi saat ini", Icons.assignment_late_outlined);
        }
        
        // Kelompokkan absen berdasarkan status jam_selesai
        List<Map<String, dynamic>> activeAbsens = [];
        List<Map<String, dynamic>> expiredAbsens = [];
        
        for (var absen in snapshot.data!) {
          bool isExpired = false;
          
          // Cek apakah jam_selesai sudah lewat
          if (absen['jam_selesai'] != null) {
            try {
              final DateTime now = DateTime.now();
              
              // Ambil tanggal dari data absen
              DateTime tanggalAbsen = DateTime.parse(absen['tanggal']);
              
              // Parse jam_selesai (asumsi format "HH:MM:SS" atau "HH:MM")
              final List<String> jamParts = absen['jam_selesai'].split(':');
              final int jam = int.parse(jamParts[0]);
              final int menit = int.parse(jamParts[1]);
              final int detik = jamParts.length > 2 ? int.parse(jamParts[2]) : 0;
              
              // Buat DateTime dengan tanggal dari absen dan jam dari jam_selesai
              DateTime jamSelesai = DateTime(
                tanggalAbsen.year,
                tanggalAbsen.month,
                tanggalAbsen.day,
                jam,
                menit,
                detik,
              );
              
              isExpired = now.isAfter(jamSelesai);
            } catch (e) {
              print('Error parsing jam_selesai: $e');
              isExpired = false;
            }
          }
          
          if (isExpired) {
            expiredAbsens.add(absen);
          } else {
            activeAbsens.add(absen);
          }
        }
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            
            // Section title
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2762F8).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.access_time_filled_rounded,
                    color: Color(0xFF2762F8),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Daftar Absensi',
                  style: GoogleFonts.montserrat(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black.withOpacity(0.8),
                  ),
                ),
              ],
            ),
            
            if (activeAbsens.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: Colors.green.shade500,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Absensi Aktif',
                      style: GoogleFonts.montserrat(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.green.shade700,
                      ),
                    ),
                  ],
                ),
              ),
              ...activeAbsens.map((absen) => _buildAbsenCard(absen, false)),
            ],
            
            if (expiredAbsens.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.only(top: 24.0, bottom: 16.0),
                child: Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Colors.grey,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Absensi Selesai',
                      style: GoogleFonts.montserrat(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
              ),
              ...expiredAbsens.map((absen) => _buildAbsenCard(absen, true)),
            ],
          ],
        );
      },
    );
  }
  
  Widget _buildAbsenCard(Map<String, dynamic> absen, bool isExpired) {
    final String idAbsen = absen['id_absen'].toString();
    final bool isPresent = _presensiStatus[idAbsen] ?? false;
    
    // Definisikan warna dan status teks berdasarkan status presensi dan expired
    Color statusColor;
    String statusText;
    
    if (isPresent) {
      statusColor = Colors.green;
      statusText = 'Sudah Presensi';
    } else if (isExpired) {
      statusColor = Colors.grey;
      statusText = 'Selesai';
    } else {
      statusColor = Colors.green;
      statusText = 'Aktif';
    }
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 16),
      child: GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PresensiScreen(
              idSiswa: int.parse(_idSiswa!),
              namaMapel: absen['nama_mapel'],
              idMapel: int.parse(absen['id_mapel'].toString()),
              idAbsen: int.parse(absen['id_absen'].toString()),
              idGuru: int.parse(absen['id_guru'].toString()),
              namaGuru: absen['nama_guru'],
              jamSelesai: absen['jam_selesai'],
            ),
          ),
        ).then((_) => _refreshData()), // Refresh data setelah halaman ditutup
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isPresent 
                  ? Colors.green.shade200
                  : (isExpired ? Colors.grey.shade200 : Colors.blue.shade100),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: isPresent
                    ? Colors.green.withOpacity(0.1)
                    : (isExpired 
                        ? Colors.grey.withOpacity(0.1) 
                        : Colors.blue.withOpacity(0.1)),
                blurRadius: 10,
                spreadRadius: 0,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              children: [
                // Pattern background
                Positioned.fill(
                  child: Opacity(
                    opacity: 0.04,
                    child: Image.network(
                      'https://cdn.builder.io/api/v1/image/assets/TEMP/6df8e9989b87bd8f60b47a6b3e513432886bb730613aff9afd63933074797b3d',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                
                // Content
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      // Left color indicator
                      Container(
                        width: 4,
                        height: 60,
                        decoration: BoxDecoration(
                          color: isPresent
                              ? Colors.green
                              : (isExpired ? Colors.grey : const Color(0xFF2762F8)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(width: 16),
                      
                      // Content
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    absen['nama_mapel'],
                                    style: GoogleFonts.montserrat(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: isPresent
                                          ? Colors.green.shade800
                                          : (isExpired 
                                              ? Colors.grey.shade700 
                                              : Colors.black.withOpacity(0.8)),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8, 
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: statusColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (isPresent)
                                        Icon(
                                          Icons.check_circle_outline,
                                          size: 10,
                                          color: statusColor,
                                        ),
                                      if (isPresent)
                                        const SizedBox(width: 4),
                                      Text(
                                        statusText,
                                        style: GoogleFonts.montserrat(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w500,
                                          color: statusColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(
                                  Icons.person_outline,
                                  size: 14,
                                  color: isPresent
                                      ? Colors.green.shade600
                                      : (isExpired 
                                          ? Colors.grey.shade500 
                                          : Colors.blue.shade700),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  absen['nama_guru'],
                                  style: GoogleFonts.montserrat(
                                    fontSize: 13,
                                    color: isPresent
                                        ? Colors.green.shade600
                                        : (isExpired 
                                            ? Colors.grey.shade500 
                                            : Colors.blue.shade700),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Icon(
                                  isPresent
                                      ? Icons.check_circle_outline
                                      : Icons.calendar_today_outlined,
                                  size: 14,
                                  color: isPresent
                                      ? Colors.green.shade600
                                      : (isExpired 
                                          ? Colors.grey.shade500 
                                          : Colors.blue.shade700),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  isPresent
                                      ? "Presensi berhasil tercatat"
                                      : _formatDateWithTimezone(absen['tanggal']),
                                  style: GoogleFonts.montserrat(
                                    fontSize: 13,
                                    color: isPresent
                                        ? Colors.green.shade600
                                        : (isExpired 
                                            ? Colors.grey.shade500 
                                            : Colors.blue.shade700),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      
                      // Arrow or Check icon
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isPresent
                              ? Colors.green.shade50
                              : (isExpired 
                                  ? Colors.grey.shade100 
                                  : Colors.blue.shade50),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isPresent
                              ? Icons.check_circle
                              : Icons.arrow_forward_ios,
                          size: 14,
                          color: isPresent
                              ? Colors.green.shade600
                              : (isExpired 
                                  ? Colors.grey.shade500 
                                  : Colors.blue.shade700),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTugasList() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _tugasList,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildLoadingSkeleton();
        } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return _buildEmptyState("Tidak ada tugas saat ini", Icons.note_alt_outlined);
        }
        
        // Kelompokkan tugas berdasarkan status deadline
        List<Map<String, dynamic>> activeAssignments = [];
        List<Map<String, dynamic>> pastAssignments = [];
        
        for (var tugas in snapshot.data!) {
          DateTime deadline = DateTime.parse(tugas['deadline']);
          if (DateTime.now().isAfter(deadline)) {
            pastAssignments.add(tugas);
          } else {
            activeAssignments.add(tugas);
          }
        }
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            
            // Section title
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade700.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.assignment_rounded,
                    color: Colors.orange.shade700,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Daftar Tugas',
                  style: GoogleFonts.montserrat(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black.withOpacity(0.8),
                  ),
                ),
              ],
            ),
            
            if (activeAssignments.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: Colors.blue.shade500,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Tugas Aktif',
                      style: GoogleFonts.montserrat(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.blue.shade700,
                      ),
                    ),
                  ],
                ),
              ),
              ...activeAssignments.map((tugas) => _buildTugasCard(tugas, false)),
            ],
            
            if (pastAssignments.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.only(top: 24.0, bottom: 16.0),
                child: Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: Colors.red.shade400,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Tugas Lewat Deadline',
                      style: GoogleFonts.montserrat(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.red.shade700,
                      ),
                    ),
                  ],
                ),
              ),
              ...pastAssignments.map((tugas) => _buildTugasCard(tugas, true)),
            ],
          ],
        );
      },
    );
  }

  Widget _buildTugasCard(Map<String, dynamic> tugas, bool isPastDeadline) {
    final String idTugas = tugas['id_tugas'].toString();
    final bool isSubmitted = _submissionStatus[idTugas] ?? false;
    
    Color statusColor;
    String statusText;
    
    if (isSubmitted) {
      statusColor = Colors.green;
      statusText = 'Sudah Mengumpulkan';
    } else if (isPastDeadline) {
      statusColor = Colors.red;
      statusText = 'Terlambat';
    } else {
      statusColor = Colors.blue;
      statusText = 'Aktif';
    }
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 16),
      child: GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TugasWidget(
              tugas: tugas,
              idSiswa: int.parse(_idSiswa!),
              onClose: () {
                // Refresh data saat kembali dari halaman tugas
                _refreshData();
              },
            ),
          ),
        ).then((_) => _refreshData()), // Refresh data setelah halaman ditutup
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSubmitted 
                  ? Colors.green.shade200 
                  : (isPastDeadline ? Colors.red.shade100 : Colors.blue.shade100),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: isSubmitted 
                    ? Colors.green.withOpacity(0.1)
                    : (isPastDeadline 
                        ? Colors.red.withOpacity(0.08) 
                        : Colors.blue.withOpacity(0.1)),
                blurRadius: 10,
                spreadRadius: 0,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              children: [
                // Pattern background
                Positioned.fill(
                  child: Opacity(
                    opacity: 0.04,
                    child: Image.network(
                      'https://cdn.builder.io/api/v1/image/assets/TEMP/6df8e9989b87bd8f60b47a6b3e513432886bb730613aff9afd63933074797b3d',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                
                // Content
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      // Left color indicator
                      Container(
                        width: 4,
                        height: 75,
                        decoration: BoxDecoration(
                          color: isSubmitted 
                              ? Colors.green.shade500
                              : (isPastDeadline ? Colors.red.shade400 : Colors.blue.shade500),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(width: 16),
                      
                      // Content
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    tugas['nama_tugas'],
                                    style: GoogleFonts.montserrat(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: isSubmitted
                                          ? Colors.green.shade800
                                          : (isPastDeadline 
                                              ? Colors.red.shade800 
                                              : Colors.black.withOpacity(0.8)),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8, 
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: statusColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (isSubmitted)
                                        Icon(
                                          Icons.check_circle_outline,
                                          size: 10,
                                          color: statusColor,
                                        ),
                                      if (isSubmitted)
                                        const SizedBox(width: 4),
                                      Text(
                                        statusText,
                                        style: GoogleFonts.montserrat(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w500,
                                          color: statusColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(
                                  Icons.book_outlined,
                                  size: 14,
                                  color: isSubmitted
                                      ? Colors.green.shade600
                                      : (isPastDeadline 
                                          ? Colors.red.shade400 
                                          : Colors.blue.shade700),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  tugas['nama_mapel'],
                                  style: GoogleFonts.montserrat(
                                    fontSize: 13,
                                    color: isSubmitted
                                        ? Colors.green.shade600
                                        : (isPastDeadline 
                                            ? Colors.red.shade400 
                                            : Colors.blue.shade700),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Icon(
                                  isSubmitted 
                                      ? Icons.check_circle_outline
                                      : Icons.access_time_rounded,
                                  size: 14,
                                  color: isSubmitted
                                      ? Colors.green.shade600
                                      : (isPastDeadline 
                                          ? Colors.red.shade400 
                                          : Colors.blue.shade700),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  isSubmitted
                                      ? "Tugas telah dikumpulkan"
                                      : "Deadline: ${_formatDeadline(tugas['deadline'])}",
                                  style: GoogleFonts.montserrat(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: isSubmitted
                                        ? Colors.green.shade600
                                        : (isPastDeadline 
                                            ? Colors.red.shade400 
                                            : Colors.blue.shade700),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      
                      // Arrow
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isSubmitted
                              ? Colors.green.shade50
                              : (isPastDeadline 
                                  ? Colors.red.shade50 
                                  : Colors.blue.shade50),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isSubmitted
                              ? Icons.check_circle
                              : Icons.arrow_forward_ios,
                          size: 14,
                          color: isSubmitted
                              ? Colors.green.shade600
                              : (isPastDeadline 
                                  ? Colors.red.shade400 
                                  : Colors.blue.shade700),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Loading skeleton for lists
  Widget _buildLoadingSkeleton() {
    return Column(
      children: List.generate(3, (index) => Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 60,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: 150,
                    height: 14,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 180,
                    height: 14,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      )),
    );
  }

  // Empty state display
  Widget _buildEmptyState(String message, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.only(top: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 50,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: GoogleFonts.montserrat(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showSidebar(BuildContext context) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        pageBuilder: (_, __, ___) => const _SidebarOverlay(),
        transitionsBuilder: (_, animation, __, child) {
          return SlideTransition(
            position: Tween(begin: const Offset(-1, 0), end: Offset.zero).animate(
              CurvedAnimation(
                parent: animation,
                curve: Curves.easeOutQuart,
              ),
            ),
            child: child,
          );
        },
      ),
    );
  }

  // Get initials from name
  String _getInitials(String name) {
    List<String> nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return '${nameParts[0][0]}${nameParts[1][0]}';
    }
    return name.isNotEmpty ? name[0] : 'S';
  }

  // Format deadline with zone time (WIB)
  String _formatDeadline(String deadlineString) {
    // Initialize timezone data
    tz.initializeTimeZones();
    final jakarta = tz.getLocation('Asia/Jakarta');
    
    DateTime dt = DateTime.parse(deadlineString);
    final jakartaDateTime = tz.TZDateTime.from(dt, jakarta);

    return DateFormat('dd MMM yyyy – kk:mm').format(jakartaDateTime);
  }

  // Format tanggal dengan zona waktu WIB
  String _formatDateWithTimezone(String dateString) {
    // Initialize timezone data
    tz.initializeTimeZones();
    final jakarta = tz.getLocation('Asia/Jakarta');
    
    DateTime dt = DateTime.parse(dateString);
    final jakartaDateTime = tz.TZDateTime.from(dt, jakarta);

    return DateFormat('dd MMM yyyy').format(jakartaDateTime);
  }
}

class _SidebarOverlay extends StatelessWidget {
  const _SidebarOverlay({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Blur background
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
              child: Container(
                color: Colors.black.withOpacity(0.3),
              ),
            ),
          ),
          
          // Sidebar and tap area
          Row(
            children: [
              const SidebarWidget(),
              Expanded(
                child: GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}