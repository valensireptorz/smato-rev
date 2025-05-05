import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;

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

  bool _showAbsenList = false;
  bool _showTugasList = false;
  bool _isRefreshing = false;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _loadSiswaData();
    _absenList = AbsenService.getAllAbsen();
    _tugasList = TugasService.getAllTugas();

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
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

  void _loadSiswaData() async {
    final prefs = await SharedPreferences.getInstance();
    String idSiswa = prefs.getString('id_siswa') ?? '1';
    setState(() {
      _siswaData = SiswaService().getSiswaById(idSiswa);
    });
  }

  void _refreshData() async {
    setState(() {
      _isRefreshing = true;
    });
    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _absenList = AbsenService.getAllAbsen();
      _tugasList = TugasService.getAllTugas();
      _isRefreshing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    GestureDetector(
                      onTap: () => _showSidebar(context),
                      child: const Icon(Icons.menu, size: 30, color: Colors.blueAccent),
                    ),
                    IconButton(
                      icon: _isRefreshing
                          ? const CircularProgressIndicator()
                          : const Icon(Icons.refresh, color: Colors.blueAccent),
                      onPressed: _refreshData,
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                FutureBuilder<Map<String, dynamic>>(
                  future: _siswaData,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const CircularProgressIndicator();
                    } else if (snapshot.hasError || !snapshot.hasData) {
                      return const Text("Gagal memuat data siswa");
                    }
                    var siswa = snapshot.data!['data'];
                    _idSiswa = siswa['id_siswa'].toString();
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Halo, ${siswa['nama_siswa'] ?? 'Siswa'} 👋',
                          style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 5),
                        Text('ID: ${siswa['id_siswa']}',
                            style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey)),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildMenuButton(Icons.access_time, 'Absensi', () {
                      setState(() => _showAbsenList = !_showAbsenList);
                    }),
                    _buildMenuButton(Icons.assignment, 'Tugas', () {
                      setState(() => _showTugasList = !_showTugasList);
                    }),
                  ],
                ),
                const SizedBox(height: 20),
                if (_showAbsenList) _buildAbsenList(),
                if (_showTugasList) _buildTugasList(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuButton(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.blueAccent.withOpacity(0.15),
            child: Icon(icon, color: Colors.blueAccent, size: 28),
          ),
          const SizedBox(height: 6),
          Text(label, style: GoogleFonts.poppins(fontSize: 12, color: Colors.black)),
        ],
      ),
    );
  }

  Widget _buildAbsenList() {
    return FutureBuilder<List<Map<String, dynamic>>>( 
      future: _absenList,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return const Text("Tidak ada data absen.");
        }
        return Column(
          children: snapshot.data!.map((absen) {
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(vertical: 10),
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
                ),
                child: SubjectCard(
                  title: absen['nama_mapel'],
                  imageUrl: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6df8e9989b87bd8f60b47a6b3e513432886bb730613aff9afd63933074797b3d',
                  semester: absen['nama_guru'],
                  year: _formatDateWithTimezone(absen['tanggal']),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildTugasList() {
    return FutureBuilder<List<Map<String, dynamic>>>( 
      future: _tugasList,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return const Text("Tidak ada data tugas.");
        }
        return Column(
          children: snapshot.data!.map((tugas) {
            DateTime deadline = DateTime.parse(tugas['deadline']);
            if (DateTime.now().isAfter(deadline)) return const SizedBox.shrink();
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(vertical: 10),
              child: GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => TugasWidget(
                      tugas: tugas,
                      idSiswa: int.parse(_idSiswa!),
                      onClose: () {},
                    ),
                  ),
                ),
                child: SubjectCard(
                  title: tugas['nama_tugas'],
                  imageUrl: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6df8e9989b87bd8f60b47a6b3e513432886bb730613aff9afd63933074797b3d',
                  semester: tugas['nama_mapel'],
                  year: _formatDeadline(tugas['deadline']),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  void _showSidebar(BuildContext context) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        pageBuilder: (_, __, ___) => const _SidebarOverlay(),
        transitionsBuilder: (_, animation, __, child) {
          return SlideTransition(
            position: Tween(begin: const Offset(-1, 0), end: Offset.zero).animate(animation),
            child: child,
          );
        },
      ),
    );
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

    return DateFormat('dd MMM yyyy – kk:mm').format(jakartaDateTime);
  }
}

class _SidebarOverlay extends StatelessWidget {
  const _SidebarOverlay({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black.withOpacity(0.3),
      body: Row(
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
    );
  }
}
