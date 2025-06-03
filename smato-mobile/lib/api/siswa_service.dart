import 'dart:convert';
import 'package:http/http.dart' as http;

class SiswaService {
  static const String baseUrl = 'https://esmato.kabupatensumenep.com/api/siswa';

  Future<Map<String, dynamic>> changePassword({
  required String nis,
  required String oldPassword,
  required String newPassword,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/change-password'),
    headers: <String, String>{
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'nis': nis,
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    }),
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 401) {
    throw Exception('Password lama salah');
  } else if (response.statusCode == 400) {
    throw Exception('Data tidak valid');
  } else {
    throw Exception('Terjadi kesalahan saat mengubah password');
  }
}

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
