import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SubjectCard extends StatelessWidget {
  final String title;
  final String imageUrl;
  final String semester;
  final String year;

  const SubjectCard({
    Key? key,
    required this.title,
    required this.imageUrl,
    required this.semester,
    required this.year,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(17, 17, 17, 41),
      decoration: BoxDecoration(
        color: const Color(0xFF00B2FF),
        borderRadius: BorderRadius.circular(8),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(193, 199, 208, 0.59),
            offset: Offset(0, 2),
            blurRadius: 16,
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 19),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$semester',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      color: Colors.black,
                    ),
                  ),
                  Text(
                    year,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
            ],
          ),
          Container(
            margin: const EdgeInsets.only(top: 17),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(255, 255, 255, 0.75),
                  offset: Offset(-2, -2),
                  blurRadius: 5,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Image.network(
                imageUrl,
                width: 64,
                height: 62,
                fit: BoxFit.contain,
              ),
            ),
          ),
        ],
      ),
    );
  }
}