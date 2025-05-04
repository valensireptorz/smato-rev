import 'package:flutter/material.dart';
import '../screens/beranda_screens.dart';
import '../screens/profile_screens.dart';
import '../screens/login_screens.dart';
import '../theme/app_theme.dart';

class SidebarWidget extends StatelessWidget {
  final bool isOverlay;
  const SidebarWidget({Key? key, this.isOverlay = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryBlue, AppTheme.primaryBlue.withOpacity(0.9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.horizontal(right: Radius.circular(40)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile section
          ClipRRect(
            borderRadius: BorderRadius.circular(50),
            child: Image.network(
              'https://cdn.builder.io/api/v1/image/assets/TEMP/3aedf3d81aae4520b759f5861584b0016130a69299fdd5f206e6d76a9266ba31',
              width: 75,
              height: 75,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'E-Smato Siswa\nSMAN 1 Bluto',
            style: AppTheme.titleStyle.copyWith(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 30),
          // Divider line
          Divider(color: Colors.white.withOpacity(0.6)),
          const SizedBox(height: 20),

          // Navigation items with icons
          _buildNavItem(
            context,
            title: 'Beranda',
            icon: Icons.home,
            onTap: () {
              Navigator.push(
                context,
                _createPageRoute(const BerandaScreen()),
              );
            },
          ),
          _buildNavItem(
            context,
            title: 'Profil',
            icon: Icons.person,
            onTap: () {
              Navigator.push(
                context,
                _createPageRoute(const ProfileScreen()),
              );
            },
          ),
          _buildNavItem(
            context,
            title: 'Keluar',
            icon: Icons.exit_to_app,
            onTap: () {
              _showLogoutDialog(context);
            },
          ),
        ],
      ),
    );
  }

  // Create custom page route for smoother transition
  PageRouteBuilder _createPageRoute(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(-1.0, 0.0);
        const end = Offset.zero;
        const curve = Curves.ease;
        final tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
        final offsetAnimation = animation.drive(tween);
        return SlideTransition(position: offsetAnimation, child: child);
      },
    );
  }

  // Widget to build each navigation item with icon
  Widget _buildNavItem(BuildContext context,
      {required String title, required IconData icon, VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 25),
            const SizedBox(width: 15),
            Text(
              title,
              style: AppTheme.titleStyle.copyWith(
                fontSize: 16,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Show logout confirmation dialog
  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: AppTheme.primaryBlue,
          title: const Text(
            'Konfirmasi',
            style: TextStyle(color: Colors.white),
          ),
          content: const Text(
            'Apakah Anda yakin ingin logout?',
            style: TextStyle(color: Colors.white),
          ),
          actions: [
            TextButton(
              child: const Text('Batal', style: TextStyle(color: Colors.white)),
              onPressed: () {
                Navigator.of(context).pop(); // Close the dialog
              },
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Ya, Logout'),
              onPressed: () {
                Navigator.of(context).pop(); // Close the dialog
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                );
              },
            ),
          ],
        );
      },
    );
  }
}
