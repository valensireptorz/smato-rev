import 'package:flutter/material.dart';
import '../theme/app_text_styles.dart';
import '../theme/app_colors.dart';

class CustomTextField extends StatelessWidget {
  final String label;
  final String? hintText;
  final bool obscureText;
  final TextEditingController controller;
  final Widget? prefixIcon;
  final Widget? suffixIcon;

  const CustomTextField({
    Key? key,
    required this.label,
    this.hintText,
    this.obscureText = false,
    required this.controller,
    this.prefixIcon,
    this.suffixIcon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 33),
          child: Row(
            children: [
              if (prefixIcon != null) ...[
                prefixIcon!,
                const SizedBox(width: 9),
              ],
              Text(label, style: AppTextStyles.inputLabel),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.labelGrey.withOpacity(0.3)),
            borderRadius: BorderRadius.circular(8),
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            decoration: InputDecoration(
              hintText: hintText,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              suffixIcon: suffixIcon,
            ),
            style: AppTextStyles.inputLabel.copyWith(
              color: AppColors.textDark,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}