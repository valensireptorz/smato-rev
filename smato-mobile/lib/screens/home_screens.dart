import 'package:flutter/material.dart';
import '../widgets/sidebar_widget.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatelessWidget {
  final bool isOverlay;

  const HomeScreen({Key? key, this.isOverlay = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: isOverlay
          ? Colors.black.withOpacity(0.3) // semi-transparan jika overlay
          : AppTheme.white,
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Row(
            children: [
              const SidebarWidget(),
              Expanded(
                child: Container(
                  color: Colors.transparent, // biar tidak menimpa warna transparan
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
