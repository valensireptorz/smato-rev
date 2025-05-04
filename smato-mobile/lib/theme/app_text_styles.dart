import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTextStyles {
  // Adding bodyMedium style
  static TextStyle get bodyMedium => GoogleFonts.poppins(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: Colors.black,
      );
  static TextStyle get title => GoogleFonts.poppins(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: AppColors.textDark,
  );

  static TextStyle get subtitle => GoogleFonts.poppins(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textGrey,
    height: 1.93,
  );

  static TextStyle get inputLabel => GoogleFonts.poppins(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.labelGrey,
    letterSpacing: -0.2,
  );

  static TextStyle get forgotPassword => GoogleFonts.poppins(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: const Color(0xFF324A59),
    letterSpacing: -0.2,
    decoration: TextDecoration.underline,
  );

  static TextStyle get loginButton => GoogleFonts.poppins(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: AppColors.white,
  );

  static TextStyle get copyright => GoogleFonts.poppins(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textGrey,
    height: 1.93,
  );

  static TextStyle get copyrightHighlight => GoogleFonts.poppins(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.linkBlue,
    height: 1.93,
  );

 static const TextStyle base = TextStyle(
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: FontWeight.w500,
    color: AppColors.text,
  );

  static final TextStyle titletugas = base.copyWith(
    fontSize: 17,
  );

  static final TextStyle label = base.copyWith(
    fontSize: 10,
  );


 static const double uploadButtonMaxWidth = 149.0;
  static const double uploadButtonBorderRadius = 5.0;
  static const double uploadButtonIconSize = 36.0;
  static const double uploadButtonFontSize = 15.0;

  static const EdgeInsets uploadButtonPadding = EdgeInsets.fromLTRB(30, 20, 30, 12);

  static const BoxShadow uploadButtonShadow = BoxShadow(
    color: Colors.white,
    offset: Offset(4, 4),
    blurRadius: 7,
  );


  static TextStyle get profileText => GoogleFonts.poppins(
    fontSize: 24,
    fontWeight: FontWeight.w500,
    color: AppColors.primaryBlue,
  );
}