import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'login_screens.dart'; // Import file LoginScreen

class IntroScreen extends StatelessWidget {
  const IntroScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Navigasi ke LoginScreen setelah 5 detik
    Future.delayed(const Duration(seconds: 5), () {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    });

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF2762F8), Color(0xFF5E9CFA)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 65),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Animasi Logo
              AnimatedContainer(
                duration: const Duration(seconds: 2),
                width: 200,
                height: 246,
                curve: Curves.easeInOut,
                child: Image.network(
                  'https://cdn.builder.io/api/v1/image/assets/TEMP/aedc2ba5ff8f7f0a6573d46fd159662b6cefa8890d8fdf0af46227d042222cb3',
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 61),

              // Teks dengan efek Shimmer
              Shimmer.fromColors(
                baseColor: Colors.white,
                highlightColor: Colors.blue.shade100,
                child: Text(
                  'E-Smato Siswa\nSMAN 1 Bluto Sumenep',
                  style: GoogleFonts.poppins(
                    fontSize: 24,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 1.2,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 60),

              // Deskripsi
              const Text(
                'Aplikasi Presensi dan Tugas Khusus bagi Siswa SMAN 1 Bluto\nKabupaten Sumenep',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 156),

              // Indikator Progres dengan Animasi
              const LinearProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                backgroundColor: Colors.blueAccent,
                minHeight: 4,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
