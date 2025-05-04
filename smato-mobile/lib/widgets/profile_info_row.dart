import 'package:flutter/material.dart';
import '../theme/app_text_styles.dart';

class ProfileInfoRow extends StatelessWidget {
  final String label;
  final String value;

  const ProfileInfoRow({
    Key? key,
    required this.label,
    required this.value,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 39),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: AppTextStyles.profileText,
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Text(
              ': $value',
              style: AppTextStyles.profileText,
            ),
          ),
        ],
      ),
    );
  }
}