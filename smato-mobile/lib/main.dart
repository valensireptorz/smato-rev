import 'package:flutter/material.dart';
import 'package:smato/widgets/tugas_widget.dart';

import 'screens/intro_screens.dart'; // Impor file IntroScreen
//import 'screens/login_screens.dart';
//import 'screens/home_screens.dart';
//import 'screens/beranda_screens.dart';
//import 'screens/presensi_screens.dart';
//import 'widgets/tugas_widget.dart';
//import 'screens/profile_screens.dart';


void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: IntroScreen(), // Ganti dengan IntroScreen
    );
  }
}
