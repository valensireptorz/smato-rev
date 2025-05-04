import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';

class PresensiButton extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final VoidCallback? onPressed; // nullable sekarang

  const PresensiButton({
    Key? key,
    required this.text,
    required this.backgroundColor,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bool isDisabled = onPressed == null;

    return GestureDetector(
      onTap: isDisabled ? null : onPressed,
      child: Container(
        width: 200,
        height: 46,
        decoration: BoxDecoration(
          color: isDisabled ? Colors.grey[400] : backgroundColor,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isDisabled
              ? []
              : [
                  BoxShadow(
                    color: const Color(0xFFC1C7D0).withOpacity(0.33),
                    offset: const Offset(0, 2),
                    blurRadius: 20,
                  ),
                ],
        ),
        child: Center(
          child: Text(
            text,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: isDisabled ? Colors.grey[700] : AppColors.black,
            ),
          ),
        ),
      ),
    );
  }
}
