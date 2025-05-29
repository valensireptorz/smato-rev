import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../api/siswa_service.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({Key? key}) : super(key: key);

  @override
  _ChangePasswordScreenState createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _nisController = TextEditingController();
  final _oldPasswordController = TextEditingController(); // Tambahkan controller untuk password lama
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _isOldPasswordVisible = false;
  bool _isNewPasswordVisible = false;
  bool _isLoading = false;

  void _toggleOldPasswordVisibility() {
    setState(() {
      _isOldPasswordVisible = !_isOldPasswordVisible;
    });
  }

  void _toggleNewPasswordVisibility() {
    setState(() {
      _isNewPasswordVisible = !_isNewPasswordVisible;
    });
  }

  void _handleChangePassword() async {
    final nis = _nisController.text.trim();
    final oldPassword = _oldPasswordController.text.trim();
    final newPassword = _newPasswordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    // Validasi input
    if (nis.isEmpty) {
      _showMessage('NIS wajib diisi', isError: true);
      return;
    }

    if (oldPassword.isEmpty) {
      _showMessage('Password lama wajib diisi', isError: true);
      return;
    }

    if (newPassword.isEmpty) {
      _showMessage('Password baru wajib diisi', isError: true);
      return;
    }

    if (newPassword != confirmPassword) {
      _showMessage('Konfirmasi password tidak cocok', isError: true);
      return;
    }

    if (newPassword.length < 6) {
      _showMessage('Password minimal 6 karakter', isError: true);
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Proses change password di backend
      final result = await SiswaService().changePassword(
        nis: nis,
        oldPassword: oldPassword, // Tambahkan parameter oldPassword
        newPassword: newPassword,
      );

      _showMessage('Password berhasil diubah', isSuccess: true);
      
      // Kembali ke halaman login setelah beberapa saat
      await Future.delayed(const Duration(seconds: 2));
      Navigator.pop(context);

    } catch (e) {
      _showMessage(e.toString(), isError: true);
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showMessage(String message, {bool isError = false, bool isSuccess = false}) {
    Color backgroundColor = isError 
        ? Colors.red.shade700 
        : isSuccess 
            ? Colors.green.shade700 
            : Colors.grey.shade800;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError 
                  ? Icons.error_outline 
                  : isSuccess 
                      ? Icons.check_circle_outline 
                      : Icons.info_outline,
              color: Colors.white,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: const EdgeInsets.all(10),
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

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('Ubah Password'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.black87,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ubah Password',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF1A4D8C),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Masukkan detail akun untuk mengubah password',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 30),

              // NIS Input
              _buildInputField(
                label: 'Nomor Induk Siswa (NIS)',
                controller: _nisController,
                prefixIcon: Icons.badge_outlined,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),

              // Old Password Input
              _buildInputField(
                label: 'Password Lama',
                controller: _oldPasswordController,
                prefixIcon: Icons.lock_outline_rounded,
                obscureText: !_isOldPasswordVisible,
                suffixIcon: IconButton(
                  icon: Icon(
                    _isOldPasswordVisible
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: Colors.grey.shade500,
                  ),
                  onPressed: _toggleOldPasswordVisibility,
                ),
              ),
              const SizedBox(height: 20),

              // New Password Input
              _buildInputField(
                label: 'Password Baru',
                controller: _newPasswordController,
                prefixIcon: Icons.lock_outline_rounded,
                obscureText: !_isNewPasswordVisible,
                suffixIcon: IconButton(
                  icon: Icon(
                    _isNewPasswordVisible
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: Colors.grey.shade500,
                  ),
                  onPressed: _toggleNewPasswordVisibility,
                ),
              ),
              const SizedBox(height: 20),

              // Confirm Password Input
              _buildInputField(
                label: 'Konfirmasi Password Baru',
                controller: _confirmPasswordController,
                prefixIcon: Icons.lock_outline_rounded,
                obscureText: !_isNewPasswordVisible,
              ),
              const SizedBox(height: 30),

              // Change Password Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleChangePassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A4D8C),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey.shade300,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'Ubah Password',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required IconData prefixIcon,
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
    Widget? suffixIcon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.grey.shade700,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.grey.shade200,
              width: 1,
            ),
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            keyboardType: keyboardType,
            style: TextStyle(
              fontSize: 15,
              color: Colors.grey.shade900,
            ),
            decoration: InputDecoration(
              prefixIcon: Icon(
                prefixIcon,
                color: Colors.grey.shade500,
                size: 20,
              ),
              suffixIcon: suffixIcon,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 16,
              ),
              hintStyle: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 15,
              ),
            ),
          ),
        ),
      ],
    );
  }
}