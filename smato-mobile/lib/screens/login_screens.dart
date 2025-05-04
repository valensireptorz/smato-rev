import 'package:flutter/material.dart';
import '../api/siswa_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/frame_back.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _nisnController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _nisnController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final nis = _nisnController.text.trim();
    final password = _passwordController.text.trim();

    if (nis.isEmpty || password.isEmpty) {
      _showMessage('NIS dan Password wajib diisi');
      return;
    }

    try {
      final response = await SiswaService().login(nis, password);
      if (response['message'] == 'Login berhasil') {
        final siswa = response['data'];
        final prefs = await SharedPreferences.getInstance();

        // ✅ Simpan semua data ke SharedPreferences
        await prefs.setString('id_siswa', siswa['id_siswa'].toString());
        await prefs.setString('nama_siswa', siswa['nama_siswa']);
        await prefs.setString('nis', siswa['nis'].toString());
        await prefs.setString('kode_kelas', siswa['kode_kelas'] ?? '-');
        await prefs.setString('alamat', siswa['alamat'] ?? '-');

        _showMessage('Login berhasil');
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const FrameBack()),
        );
      } else {
        _showMessage(response['message']);
      }
    } catch (e) {
      _showMessage('Terjadi kesalahan: $e');
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SingleChildScrollView(
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 480),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue.shade700, Colors.blue.shade300],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(40),
            ),
            child: Column(
              children: [
                // Animasi Background dengan Gradient
                AnimatedContainer(
                  duration: const Duration(seconds: 2),
                  height: 400,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: NetworkImage('https://cdn.builder.io/api/v1/image/assets/TEMP/435a691d6ea903ef9ffbddc2535ec9af2ae975860bfcb5448b4abf0db447436a'),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Image.asset(
                        'assets/images/frame.png',
                        fit: BoxFit.contain,
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 54, top: 34),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Title Animasi
                            AnimatedOpacity(
                              opacity: 1.0,
                              duration: const Duration(seconds: 2),
                              child: Text('Masuk', style: AppTextStyles.title),
                            ),
                            const SizedBox(height: 37),
                            AnimatedOpacity(
                              opacity: 1.0,
                              duration: const Duration(seconds: 2),
                              child: Text('Selamat Datang,', style: AppTextStyles.subtitle),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(37, 5, 27, 19),
                  child: Column(
                    children: [
                      // TextField Custom
                      CustomTextField(
                        label: 'Nomor Induk Siswa',
                        controller: _nisnController,
                        prefixIcon: Image.asset(
                          'assets/images/id-card.png',
                          width: 18,
                          height: 18,
                        ),
                      ),
                      const SizedBox(height: 35),
                      CustomTextField(
                        label: 'Password',
                        controller: _passwordController,
                        obscureText: true,
                        prefixIcon: Image.asset(
                          'assets/images/reset-password.png',
                          width: 18,
                          height: 18,
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Forgot Password Button
                      TextButton(
                        onPressed: () {},
                        child: Text(
                          'Lupa Password?',
                          style: AppTextStyles.forgotPassword,
                        ),
                      ),
                      const SizedBox(height: 4),
                      // Masuk Button dengan animasi
                      ElevatedButton(
                      onPressed: _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white, // Use backgroundColor instead of primary
                        padding: const EdgeInsets.symmetric(horizontal: 100, vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(99),
                        ),
                        elevation: 10,
                        shadowColor: Colors.blue.shade300.withOpacity(0.5),
                      ),
                      child: Text(
                        'Masuk',
                        style: AppTextStyles.loginButton.copyWith(color: Colors.blue.shade700),
                      ),
                    ),

                      const SizedBox(height: 50),
                      // Copyright Text
                      RichText(
                        text: TextSpan(
                          text: 'Copyright by ',
                          style: AppTextStyles.copyright,
                          children: [
                            TextSpan(
                              text: 'Farrel',
                              style: AppTextStyles.copyrightHighlight,
                            ),
                          ],
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
}
