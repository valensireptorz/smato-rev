// lib/api/mapel_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

class MapelModel {
  final String idMapel;
  final String namaMapel;
  final String jenisMapel;

  MapelModel({
    required this.idMapel,
    required this.namaMapel,
    required this.jenisMapel,
  });

  factory MapelModel.fromJson(Map<String, dynamic> json) {
    return MapelModel(
      idMapel: json['id_mapel'].toString(),
      namaMapel: json['nama_mapel'],
      jenisMapel: json['jenis_mapel'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nama_mapel': namaMapel,
      'jenis_mapel': jenisMapel,
    };
  }
}

class MapelService {
  static const String baseUrl = 'http://192.168.1.15:3000/api/mapel';

  // Ambil semua data mapel
  static Future<List<MapelModel>> getAllMapel() async {
    final response = await http.get(Uri.parse('$baseUrl/getall'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> mapelList = data['data'];

      return mapelList.map((item) => MapelModel.fromJson(item)).toList();
    } else {
      throw Exception('Gagal mengambil data mapel');
    }
  }

  // Ambil mapel berdasarkan ID siswa
  static Future<List<MapelModel>> getMapelBySiswaId(String siswaId) async {
    final response = await http.get(Uri.parse('$baseUrl/getbysiswa/$siswaId')); // URL baru untuk mapel berdasarkan siswa ID

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> mapelList = data['data'];

      return mapelList.map((item) => MapelModel.fromJson(item)).toList();
    } else {
      throw Exception('Gagal mengambil data mapel untuk siswa');
    }
  }

  // Tambah mapel baru
  static Future<bool> addMapel(String namaMapel, String jenisMapel) async {
    final response = await http.post(
      Uri.parse('$baseUrl/add'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nama_mapel': namaMapel,
        'jenis_mapel': jenisMapel,
      }),
    );

    return response.statusCode == 200;
  }

  // Update mapel
  static Future<bool> updateMapel(String id, String namaMapel, String jenisMapel) async {
    final response = await http.put(
      Uri.parse('$baseUrl/update/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nama_mapel': namaMapel,
        'jenis_mapel': jenisMapel,
      }),
    );

    return response.statusCode == 200;
  }

  // Hapus mapel
  static Future<bool> deleteMapel(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/delete/$id'));
    return response.statusCode == 200;
  }
}
