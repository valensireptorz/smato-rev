import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_text_styles.dart';
import '../widgets/profile_info_row.dart';
import 'home_screens.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String namaSiswa = '';
  String nis = '';
  String kodeKelas = '';
  String alamat = '';
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSiswaData();
  }

  Future<void> _loadSiswaData() async {
    final prefs = await SharedPreferences.getInstance();

    setState(() {
      namaSiswa = prefs.getString('nama_siswa') ?? '-';
      nis = prefs.getString('nis') ?? '-';
      kodeKelas = prefs.getString('kode_kelas') ?? '-';
      alamat = prefs.getString('alamat') ?? '-';
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 480),
            margin: const EdgeInsets.symmetric(horizontal: 15),
            padding: const EdgeInsets.fromLTRB(29, 28, 29, 420),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with PNG icon and Title
                SizedBox(
                  width: 250,
                  child: Column(
                    children: [
                      Align(
                        alignment: Alignment.centerLeft,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              PageRouteBuilder(
                                opaque: false,
                                pageBuilder: (context, animation, secondaryAnimation) =>
                                    const HomeScreen(isOverlay: true),
                                transitionsBuilder: (context, animation, secondaryAnimation, child) {
                                  final offsetAnimation = Tween(
                                    begin: const Offset(-1.0, 0.0),
                                    end: Offset.zero,
                                  ).chain(CurveTween(curve: Curves.ease)).animate(animation);

                                  return SlideTransition(
                                    position: offsetAnimation,
                                    child: child,
                                  );
                                },
                              ),
                            );
                          },
                          child: Image.asset(
                            'assets/images/options.png',
                            width: 22,
                            height: 22,
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),
                      // Person icon as PNG
                      Image.asset(
                        'assets/images/man.png', // Ganti dengan path gambar PNG Anda
                        width: 100,
                        height: 100,
                      ),
                      const SizedBox(height: 20),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text(
                          'Profil Siswa',
                          style: AppTextStyles.title.copyWith(
                            fontSize: 25,
                            color: AppTheme.primaryBlue,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),

                isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildProfileInfoCard('Nama', namaSiswa),
                          const SizedBox(height: 15),
                          _buildProfileInfoCard('NIS', nis),
                          const SizedBox(height: 15),
                          _buildProfileInfoCard('Kelas', kodeKelas),
                          const SizedBox(height: 15),
                          _buildProfileInfoCard('Alamat', alamat),
                        ],
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileInfoCard(String label, String value) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      elevation: 8,
      shadowColor: const Color(0x54C1C7D0),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
        child: Row(
          children: [
            Icon(Icons.info_outline, color: AppTheme.primaryBlue),
            const SizedBox(width: 15),
            Expanded(
              child: Text(
                '$label: $value',
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: AppTheme.primaryBlue,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
