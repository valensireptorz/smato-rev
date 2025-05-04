import 'dart:convert';
import 'package:http/http.dart' as http;

class SiswaService {
  static const String baseUrl = 'http://192.168.1.68:3000/api/siswa';

  Future<Map<String, dynamic>> login(String nis, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'nis': nis,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('NIS atau password salah');
    } else {
      throw Exception('Terjadi kesalahan saat login');
    }
  }

  Future<Map<String, dynamic>> getSiswaById(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/get/$id'),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 404) {
      throw Exception('Siswa dengan ID $id tidak ditemukan');
    } else {
      throw Exception('Terjadi kesalahan saat mengambil data siswa');
    }
  }
}
