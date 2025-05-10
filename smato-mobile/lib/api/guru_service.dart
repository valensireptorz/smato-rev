import 'dart:convert';
import 'package:http/http.dart' as http;

class GuruModel {
  final String idGuru;
  final String namaGuru;
  final String nip;

  GuruModel({
    required this.idGuru,
    required this.namaGuru,
    required this.nip,
  });

  factory GuruModel.fromJson(Map<String, dynamic> json) {
    return GuruModel(
      idGuru: json['id_guru'].toString(),
      namaGuru: json['nama_guru'],
      nip: json['nip'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nama_guru': namaGuru,
      'nip': nip,
    };
  }
}

class GuruService {
  static const String baseUrl = 'http://192.168.1.9:3000/api/guru';

  // Ambil semua data guru
  static Future<List<GuruModel>> getAllGuru() async {
    final response = await http.get(Uri.parse('$baseUrl/getall'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> guruList = data['data'];

      return guruList.map((item) => GuruModel.fromJson(item)).toList();
    } else {
      throw Exception('Gagal mengambil data guru');
    }
  }

  // Ambil guru berdasarkan ID
  static Future<GuruModel> getGuruById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/get/$id'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return GuruModel.fromJson(data['data']);
    } else {
      throw Exception('Guru tidak ditemukan');
    }
  }

  // Tambah guru
  static Future<bool> addGuru(Map<String, dynamic> guruData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/store'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(guruData),
    );

    return response.statusCode == 201;
  }

  // Update guru
  static Future<bool> updateGuru(String id, Map<String, dynamic> guruData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/update/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(guruData),
    );

    return response.statusCode == 200;
  }

  // Hapus guru
  static Future<bool> deleteGuru(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/delete/$id'));
    return response.statusCode == 200;
  }
}
