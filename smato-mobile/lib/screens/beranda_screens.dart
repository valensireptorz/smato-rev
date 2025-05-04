import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../widgets/subject_card.dart';
import '../api/absen_services.dart'; 
import '../api/tugas_services.dart'; 
import '../api/siswa_service.dart';
import 'presensi_screens.dart';
import '../widgets/sidebar_widget.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../widgets/tugas_widget.dart'; // Tambahkan import untuk halaman Tugas
import 'package:intl/intl.dart';

class BerandaScreen extends StatefulWidget {
  const BerandaScreen({Key? key}) : super(key: key);

  @override
  State<BerandaScreen> createState() => _BerandaScreenState();
}

class _BerandaScreenState extends State<BerandaScreen> {
  late String? _idKelas;
  late String? _idSiswa;
  late Future<List<Map<String, dynamic>>> _absenList;
  late Future<List<Map<String, dynamic>>> _tugasList;
  late Future<Map<String, dynamic>> _siswaData;
  bool _isLoading = false;
  bool _showAbsenList = false;
  bool _showTugasList = false;
  bool _isRefreshing = false;  // Flag to manage refresh state

  @override
  void initState() {
    super.initState();
    _loadSiswaData();
    _absenList = AbsenService.getAllAbsen();
    _tugasList = TugasService.getAllTugas();
  }

  void _loadSiswaData() async {
    final prefs = await SharedPreferences.getInstance();
    String idSiswa = prefs.getString('id_siswa') ?? '1';
    setState(() {
      _siswaData = SiswaService().getSiswaById(idSiswa);
    });
  }

  void _showSidebar(BuildContext context) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        pageBuilder: (_, __, ___) => const _SidebarOverlay(),
        transitionsBuilder: (_, animation, __, child) {
          final offsetAnimation = Tween<Offset>(begin: const Offset(-1.0, 0.0), end: Offset.zero)
              .animate(CurvedAnimation(parent: animation, curve: Curves.easeOut));
          return SlideTransition(position: offsetAnimation, child: child);
        },
      ),
    );
  }

  void _refreshData() async {
    setState(() {
      _isRefreshing = true; // Start refreshing
    });

    // Simulate network request to refresh data
    await Future.delayed(const Duration(seconds: 2)); // Simulate a 2-second delay for refreshing

    setState(() {
      _absenList = AbsenService.getAllAbsen(); // Refresh the attendance list
      _isRefreshing = false; // End refreshing
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: const Color(0xFF2762F8),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 480),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 21),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 35),
                  GestureDetector(
                    onTap: () => _showSidebar(context),
                    child: Image.asset(
                      'assets/images/options.png',
                      width: 22,
                      height: 32,
                    ),
                  ),
                  const SizedBox(height: 28),
                  FutureBuilder<Map<String, dynamic>>(
                    future: _siswaData,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      } else if (snapshot.hasError) {
                        return const Text('Gagal memuat data siswa', style: TextStyle(color: Colors.white));
                      } else if (!snapshot.hasData || snapshot.data!['data'] == null) {
                        return const Text('Data siswa tidak ditemukan', style: TextStyle(color: Colors.white));
                      }

                      var siswa = snapshot.data!['data'];
                      _idSiswa = siswa['id_siswa'].toString();

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hi, ${siswa['nama_siswa'] ?? 'Unknown'}',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                              height: 35 / 18,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'ID Siswa: ${siswa['id_siswa'] ?? 'Unknown'}',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 28),
                  Text(
                    'Menu',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Column(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.access_time, color: Colors.white),
                            onPressed: () {
                              setState(() {
                                _showAbsenList = !_showAbsenList;
                              });
                            },
                          ),
                          const Text(
                            'Absensi',
                            style: TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(width: 30), // Spasi antar tombol
                      Column(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.assignment, color: Colors.white),
                            onPressed: () {
                              setState(() {
                                _showTugasList = !_showTugasList;
                              });
                            },
                          ),
                          const Text(
                            'Tugas',
                            style: TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 23),
                  _showAbsenList
                      ? FutureBuilder<List<Map<String, dynamic>>>( // Absensi list display
                          future: _absenList,
                          builder: (context, snapshot) {
                            if (snapshot.connectionState == ConnectionState.waiting) {
                              return const Center(child: CircularProgressIndicator());
                            } else if (snapshot.hasError) {
                              return const Text(
                                'Gagal memuat data absen',
                                style: TextStyle(color: Colors.white),
                              );
                            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                              return const Text(
                                'Belum ada absen',
                                style: TextStyle(color: Colors.white),
                              );
                            }

                            return Column(
                              children: snapshot.data!.map((absen) {
                                String jamSelesai = absen['jam_selesai'];
                                DateTime now = DateTime.now();
                                DateTime jamSelesaiTime = DateTime.parse(absen['tanggal'] + ' ' + jamSelesai);

                                if (now.isAfter(jamSelesaiTime)) {
                                  String idAbsen = absen['id_absen'].toString();
                                  AbsenService.deleteAbsen(idAbsen);
                                  _absenList = AbsenService.getAllAbsen();
                                }

                                return Column(
                                  children: [
                                    GestureDetector(
                                      onTap: () {
                                        if (_idSiswa != null) {
                                          int idMapel = int.parse(absen['id_mapel'].toString());
                                          int idAbsen = int.parse(absen['id_absen'].toString());
                                          int idGuru = int.parse(absen['id_guru'].toString());

                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => PresensiScreen(
                                                idSiswa: int.parse(_idSiswa!),
                                                namaMapel: absen['nama_mapel'],
                                                idMapel: idMapel,
                                                idAbsen: idAbsen,
                                                idGuru: idGuru,
                                                namaGuru: absen['nama_guru'],
                                                jamSelesai: absen['jam_selesai'],
                                              ),
                                            ),
                                          );
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(content: Text('ID Siswa tidak tersedia')),
                                          );
                                        }
                                      },
                                      child: SubjectCard(
                                        title: absen['nama_mapel'],
                                        imageUrl: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6df8e9989b87bd8f60b47a6b3e513432886bb730613aff9afd63933074797b3d',
                                        semester: absen['nama_guru'],
                                        year: absen['tanggal'],
                                      ),
                                    ),
                                    Text(
                                      'Jam selesai: $jamSelesai',
                                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                    ),
                                    const SizedBox(height: 20),
                                  ],
                                );
                              }).toList(),
                            );
                          },
                        )
                      : const SizedBox.shrink(), // Absensi tidak ditampilkan jika tidak dipilih
                  _showTugasList
                      ? FutureBuilder<List<Map<String, dynamic>>>( // Tugas list display
                          future: _tugasList,
                          builder: (context, snapshot) {
                            if (snapshot.connectionState == ConnectionState.waiting) {
                              return const Center(child: CircularProgressIndicator());
                            } else if (snapshot.hasError) {
                              return const Text(
                                'Gagal memuat data tugas',
                                style: TextStyle(color: Colors.white),
                              );
                            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                              return const Text(
                                'Belum ada tugas',
                                style: TextStyle(color: Colors.white),
                              );
                            }

                            return Column(
                              children: snapshot.data!.map((tugas) {
                                DateTime deadline = DateTime.parse(tugas['deadline']);

                                if (DateTime.now().isAfter(deadline)) {
                                  // Jika tugas sudah melewati deadline, bisa diproses logika khusus jika perlu
                                  return const SizedBox.shrink(); // tidak ditampilkan
                                }

                                return Column(
                                  children: [
                                    GestureDetector(
                                      onTap: () {
                                        if (_idSiswa != null) {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => TugasWidget(
                                                tugas: tugas,
                                                idSiswa: int.parse(_idSiswa!),
                                                onClose: () {},
                                              ),
                                            ),
                                          );
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            const SnackBar(content: Text('ID Siswa tidak tersedia')),
                                          );
                                        }
                                      },
                                      child: SubjectCard(
                                        title: tugas['nama_tugas'] ?? 'Judul tidak tersedia',
                                        imageUrl: 'https://cdn.builder.io/api/v1/image/assets/TEMP/6df8e9989b87bd8f60b47a6b3e513432886bb730613aff9afd63933074797b3d',
                                        semester: tugas['nama_mapel'] ?? '',
                                        year: tugas['deadline'] ?? '',
                                      ),
                                    ),
                                    Text(
                                      'Deadline: ${_formatDeadline(tugas['deadline'])}',
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                    ),
                                    const SizedBox(height: 20),
                                  ],
                                );
                              }).toList(),
                            );
                          },
                        )
                      : const SizedBox.shrink(), // Tugas tidak ditampilkan jika tidak dipilih
                  const SizedBox(height: 20),
                  Center(
                    child: IconButton(
                      icon: _isRefreshing
                          ? const CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            )
                          : const Icon(Icons.refresh, color: Colors.white),
                      onPressed: _refreshData, // Refresh data saat icon di-klik
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Fungsi format tanggal
String _formatDeadline(String deadline) {
  if (deadline == null || deadline.isEmpty) return '';

  DateTime dateTime = DateTime.tryParse(deadline) ?? DateTime.now();

  // Format: YYYY-MM-DD - HH:MM
  String formattedDate = "${dateTime.year}-${_twoDigits(dateTime.month)}-${_twoDigits(dateTime.day)}";
  String formattedTime = "${_twoDigits(dateTime.hour)}:${_twoDigits(dateTime.minute)}";

  return "$formattedDate - $formattedTime";
}

String _twoDigits(int n) => n.toString().padLeft(2, '0');

// Sidebar Overlay
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
