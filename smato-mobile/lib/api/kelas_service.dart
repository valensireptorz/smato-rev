import 'dart:convert';
import 'package:http/http.dart' as http;

class KelasModel {
  final String idKelas;
  final String kodeKelas;

  KelasModel({
    required this.idKelas,
    required this.kodeKelas,
  });

  factory KelasModel.fromJson(Map<String, dynamic> json) {
    return KelasModel(
      idKelas: json['id_kelas'].toString(),
      kodeKelas: json['kode_kelas'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'kode_kelas': kodeKelas,
    };
  }
}

class KelasService {
  static const String baseUrl = 'http://192.168.1.15:3000/api/kelas';

  // Ambil semua data kelas
  static Future<List<KelasModel>> getAllKelas() async {
    final response = await http.get(Uri.parse('$baseUrl/getall'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> kelasList = data['data'];
      return kelasList.map((item) => KelasModel.fromJson(item)).toList();
    } else {
      throw Exception('Gagal mengambil data kelas');
    }
  }

  // Ambil kelas berdasarkan ID
  static Future<KelasModel> getKelasById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/get/$id'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return KelasModel.fromJson(data['data']);
    } else {
      throw Exception('Data kelas tidak ditemukan');
    }
  }

  // Tambah kelas
  static Future<bool> addKelas(Map<String, dynamic> kelasData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/store'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(kelasData),
    );

    return response.statusCode == 201;
  }

  // Update kelas
  static Future<bool> updateKelas(String id, Map<String, dynamic> kelasData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/update/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(kelasData),
    );

    return response.statusCode == 200;
  }

  // Hapus kelas
  static Future<bool> deleteKelas(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/delete/$id'));
    return response.statusCode == 200;
  }
}
