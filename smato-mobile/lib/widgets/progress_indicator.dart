import 'package:flutter/material.dart';

class CustomProgressIndicator extends StatelessWidget {
  const CustomProgressIndicator({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 33,
          height: 10,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(50),
          ),
        ),
        const SizedBox(width: 20),
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: const Color(0x33324A59),
            borderRadius: BorderRadius.circular(50),
          ),
        ),
      ],
    );
  }
}