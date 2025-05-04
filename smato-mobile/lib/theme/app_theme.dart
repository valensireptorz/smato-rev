import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  
  static ThemeData get theme {
    return ThemeData(
      primaryColor: const Color(0xFF2762F8),
      scaffoldBackgroundColor: Colors.white,
      fontFamily: 'Poppins',
      textTheme: TextTheme(
        bodyLarge: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        bodyMedium: GoogleFonts.poppins(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: Colors.white,
        ),
        bodySmall: GoogleFonts.poppins(
          fontSize: 11,
          fontWeight: FontWeight.w400,
          color: Colors.black,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          foregroundColor: Colors.black, backgroundColor: Colors.white,
          elevation: 8,
          shadowColor: const Color(0x54C1C7D0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(99),
          ),
        ),
      ),
    );
  }

  static const Color primaryBlue = Color(0xFF2762F8);
  static const Color white = Colors.white;
  static const Color black = Colors.black;

  static const double defaultPadding = 15.0;

  static TextStyle get titleStyle => const TextStyle(
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: white,
  );
}
