import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as path;

class PengumpulanService {
  static const String baseUrl = 'http://192.168.1.15:3000/api/pengumpulan';

  // Kirim data pengumpulan (tanpa file)
  Future<Map<String, dynamic>> kirimPengumpulan(
    String idSiswa,
    String idMapel,
    String idTugas,
    String idGuru,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/pengumpulan'),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'id_siswa': idSiswa,
        'id_mapel': idMapel,
        'id_tugas': idTugas,
        'id_guru': idGuru,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal mengirim pengumpulan tugas');
    }
  }

  // Upload file pengumpulan
  Future<Map<String, dynamic>> uploadFilePengumpulan({
    required String idSiswa,
    required String idMapel,
    required String idTugas,
    required String idGuru,
    required File file,
  }) async {
    final uri = Uri.parse('$baseUrl/upload');
    final request = http.MultipartRequest('POST', uri);
    
    // Pastikan semua field terisi dengan benar
    request.fields['id_siswa'] = idSiswa;
    request.fields['id_mapel'] = idMapel;
    request.fields['id_tugas'] = idTugas; 
    request.fields['id_guru'] = idGuru;
    
    // Menentukan content type berdasarkan ekstensi file
    String extension = path.extension(file.path).toLowerCase();
    String mimeType;
    String mimeSubtype;
    
    switch (extension) {
      case '.pdf':
        mimeType = 'application';
        mimeSubtype = 'pdf';
        break;
      case '.doc':
      case '.docx':
        mimeType = 'application';
        mimeSubtype = extension == '.doc' ? 'msword' : 'vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.ppt':
      case '.pptx':
        mimeType = 'application';
        mimeSubtype = extension == '.ppt' ? 'vnd.ms-powerpoint' : 'vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      default:
        mimeType = 'application';
        mimeSubtype = 'octet-stream';
    }
    
    // Nama field harus 'file_tugas' untuk sesuai dengan backend
    request.files.add(await http.MultipartFile.fromPath(
      'file_tugas',
      file.path,
      contentType: MediaType(mimeType, mimeSubtype),
    ));

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print('Error status: ${response.statusCode}');
        print('Error body: ${response.body}');
        throw Exception('Gagal mengunggah file pengumpulan: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception during upload: $e');
      throw Exception('Gagal mengunggah file: $e');
    }
  }

  // Dapatkan riwayat pengumpulan berdasarkan id_siswa
  Future<List<Map<String, dynamic>>> getRiwayatPengumpulan(String idSiswa) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/riwayat?id_siswa=$idSiswa'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        List<dynamic> riwayat = data['riwayatPengumpulan'] ?? [];

        return riwayat.map<Map<String, dynamic>>((item) {
          return {
            'id_pengumpulan': item['id_pengumpulan'],
            'id_tugas': item['id_tugas'],
            'upload_time': item['upload_time'],
            'file_tugas': item['file_tugas'],
            'id_siswa': item['id_siswa'],
          };
        }).toList();
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  // Dapatkan riwayat pengumpulan berdasarkan id_siswa dan id_kelas
  Future<List<Map<String, dynamic>>> getUpdatedRiwayatPengumpulan(String idSiswa, String idKelas) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/riwayat?id_siswa=$idSiswa&id_kelas=$idKelas'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        List<dynamic> riwayat = data['riwayatPengumpulan'] ?? [];

        return riwayat.map<Map<String, dynamic>>((item) {
          return {
            'id_pengumpulan': item['id_pengumpulan'],
            'id_tugas': item['id_tugas'],
            'upload_time': item['upload_time'],
            'file_tugas': item['file_tugas'],
            'id_siswa': item['id_siswa'],
          };
        }).toList();
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }
}