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
    backgroundColor: const Color(0xFFF6F9FF),
    body: SafeArea(
      child: SingleChildScrollView(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          margin: const EdgeInsets.symmetric(horizontal: 15),
          padding: const EdgeInsets.fromLTRB(20, 28, 20, 60),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
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
                    child: const Icon(Icons.arrow_back_ios_new, size: 22, color: Colors.black54),
                  ),
                  Text(
                    'Profil Siswa 👤',
                    style: AppTextStyles.title.copyWith(
                      fontSize: 24,
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 22), // Spacer
                ],
              ),
              const SizedBox(height: 30),

              // Avatar dan Nama
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.withOpacity(0.2),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                        gradient: const LinearGradient(
                          colors: [Color(0xFF60A3FF), Color(0xFF3793FF)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: const CircleAvatar(
                        backgroundImage: AssetImage('assets/images/man.png'),
                        radius: 55,
                        backgroundColor: Colors.transparent,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Halo, $namaSiswa 👋',
                      style: AppTextStyles.title.copyWith(
                        fontSize: 22,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40),

              isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : Column(
                      children: [
                        _buildProfileInfoCard('Nama', namaSiswa, Icons.person),
                        const SizedBox(height: 15),
                        _buildProfileInfoCard('NIS', nis, Icons.badge),
                        const SizedBox(height: 15),
                        _buildProfileInfoCard('Kelas', kodeKelas, Icons.class_),
                        const SizedBox(height: 15),
                        _buildProfileInfoCard('Alamat', alamat, Icons.home),
                      ],
                    ),
            ],
          ),
        ),
      ),
    ),
  );
}

Widget _buildProfileInfoCard(String label, String value, IconData icon) {
  return AnimatedContainer(
    duration: const Duration(milliseconds: 300),
    curve: Curves.easeInOut,
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      boxShadow: [
        BoxShadow(
          color: Colors.grey.withOpacity(0.1),
          blurRadius: 20,
          offset: const Offset(0, 10),
        ),
      ],
    ),
    child: ListTile(
      leading: CircleAvatar(
        backgroundColor: AppTheme.primaryBlue.withOpacity(0.1),
        child: Icon(icon, color: AppTheme.primaryBlue),
      ),
      title: Text(
        label,
        style: AppTextStyles.bodyMedium.copyWith(
          fontSize: 14,
          color: Colors.grey[700],
        ),
      ),
      subtitle: Text(
        value,
        style: AppTextStyles.bodyMedium.copyWith(
          fontWeight: FontWeight.bold,
          fontSize: 16,
          color: Colors.black,
        ),
      ),
    ),
  );
}
}