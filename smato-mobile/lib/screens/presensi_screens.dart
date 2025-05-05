import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tzdata;

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
  late AnimationController _buttonAnimationController;
  late Animation _buttonAnimation;

  @override
  void initState() {
    super.initState();
    tzdata.initializeTimeZones();  // Initialize timezone data
    _loadRiwayatPresensi();
    _buttonAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _buttonAnimation = Tween(begin: 1.0, end: 0.9).animate(CurvedAnimation(
      parent: _buttonAnimationController,
      curve: Curves.easeInOut,
    ));
  }

  Future<void> _loadRiwayatPresensi() async {
    setState(() => _isLoading = true);
    try {
      riwayatPresensi = PresensiService().getRiwayatPresensi(widget.idSiswa.toString());
      await riwayatPresensi;
    } catch (e) {
      print("Error loading attendance history: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _kirimPresensi() async {
    _buttonAnimationController.forward();
    try {
      final response = await PresensiService().kirimPresensi(
        widget.idSiswa.toString(),
        widget.idMapel.toString(),
        widget.idAbsen.toString(),
        widget.idGuru.toString(),
      );

      if (response['success']) {
        await _loadRiwayatPresensi();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response['message'])));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(response['message'])));
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gagal mengirim presensi')));
    } finally {
      _buttonAnimationController.reverse();
    }
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

  TextStyle _textStyle() {
    return GoogleFonts.poppins(
      fontSize: 13,
      color: Colors.white,
      fontWeight: FontWeight.w500,
    );
  }

  String formatDateToWIB(String dateString) {
    final date = DateTime.parse(dateString);

    // Get the Indonesia timezone (WIB)
    final indonesiaTimeZone = tz.getLocation('Asia/Jakarta');
    
    // Convert the date to the Indonesia timezone (WIB)
    final indonesiaDate = tz.TZDateTime.from(date, indonesiaTimeZone);
    
    // Format the date in Indonesian date format (dd MMM yyyy)
    final dateFormat = DateFormat('dd MMM yyyy');
    
    // Return formatted date
    return dateFormat.format(indonesiaDate);
  }

  Widget _buildGlassCard({required Widget child}) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: child,
    );
  }

  Widget _buildPresensiCard() {
    return _buildGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.namaMapel,
              style: GoogleFonts.poppins(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('Guru: ${widget.namaGuru}', style: _textStyle()),
          const SizedBox(height: 4),
          Text('Batas Presensi: ${widget.jamSelesai}', style: _textStyle()),
          const SizedBox(height: 30),
          Center(
            child: ScaleTransition(
              scale: _buttonAnimation as Animation<double>,
              child: PresensiButton(
                text: _hasPresensiToday ? 'Sudah Presensi' : 'Presensi Sekarang',
                backgroundColor: _hasPresensiToday ? Colors.grey : const Color(0xFF48C9B0),
                onPressed: _hasPresensiToday ? null : _kirimPresensi,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard() {
    return FutureBuilder<Map<String, dynamic>>(
      future: riwayatPresensi,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        } else if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}', style: _textStyle());
        } else if (!snapshot.hasData || snapshot.data!['riwayatPresensi'] == null) {
          return Text('Tidak ada riwayat presensi', style: _textStyle());
        }

        final List riwayat = snapshot.data!['riwayatPresensi'];
        final isKosong = riwayat.isEmpty;

        return _buildGlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Riwayat Presensi', style: _textStyle()),
              const SizedBox(height: 12),
              if (!isKosong)
                SizedBox(
                  height: 150,
                  child: ListView.separated(
                    itemCount: riwayat.length,
                    separatorBuilder: (_, __) => const Divider(color: Colors.white24),
                    itemBuilder: (context, index) {
                      final item = riwayat[index];
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("ID: ${item['id_absen']}", style: _textStyle()),
                          Text(
                            formatDateToWIB(item['tanggal_presensi']),  // Display formatted date
                            style: _textStyle(),
                          ),
                        ],
                      );
                    },
                  ),
                )
              else
                const Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text('Belum melakukan presensi', style: TextStyle(color: Colors.white70)),
                ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF1E3C72),
              Color(0xFF2A5298),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 480),
              padding: const EdgeInsets.fromLTRB(29, 30, 29, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: GestureDetector(
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const BerandaScreen()),
                      ),
                      child: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 35),
                  Text(
                    'Ketuk Untuk Presensi',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildPresensiCard(),
                  const SizedBox(height: 20),
                  _buildHistoryCard(),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _isRefreshing ? null : _refreshData,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    child: _isRefreshing
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: Colors.black, strokeWidth: 3),
                          )
                        : const Text('Refresh Data'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
