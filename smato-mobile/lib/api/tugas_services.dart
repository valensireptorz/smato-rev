import 'dart:convert';
import 'package:http/http.dart' as http;

class TugasModel {
  final String idTugas;
  final String idMapel;
  final String namaTugas;
  final String deskripsi;
  final String deadline;
  final String kodeKelas; // Tambahkan field kodeKelas

  TugasModel({
    required this.idTugas,
    required this.idMapel,
    required this.namaTugas,
    required this.deskripsi,
    required this.deadline,
    required this.kodeKelas, // Tambahkan parameter ini
  });

  factory TugasModel.fromJson(Map<String, dynamic> json) {
    return TugasModel(
      idTugas: json['id_tugas'].toString(),
      idMapel: json['id_mapel'].toString(),
      namaTugas: json['nama_tugas'],
      deskripsi: json['deskripsi'],
      deadline: json['deadline'],
      kodeKelas: json['kode_kelas'] ?? '', // Tambahkan ini
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id_mapel': idMapel,
      'nama_tugas': namaTugas,
      'deskripsi': deskripsi,
      'deadline': deadline,
      'kode_kelas': kodeKelas, // Tambahkan ini
    };
  }
}

class TugasService {
  static const String baseUrl = 'http://192.168.154.120:3000/api/tugas';

  // Ambil semua data tugas
  static Future<List<Map<String, dynamic>>> getAllTugas() async {
    final response = await http.get(Uri.parse('$baseUrl/getall'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> tugasList = data['data'];
      return tugasList.map((item) => Map<String, dynamic>.from(item)).toList();
    } else {
      throw Exception('Gagal mengambil data tugas');
    }
  }

  // Ambil tugas berdasarkan ID
  static Future<TugasModel> getTugasById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/get/$id'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return TugasModel.fromJson(data['data'][0]); // asumsi data array
    } else {
      throw Exception('Tugas tidak ditemukan');
    }
  }

  // Tambah tugas
  static Future<bool> addTugas(Map<String, dynamic> tugasData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/store'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(tugasData),
    );

    return response.statusCode == 201;
  }

  // Update tugas
  static Future<bool> updateTugas(String id, Map<String, dynamic> tugasData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/update/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(tugasData),
    );

    return response.statusCode == 200;
  }

  // Hapus tugas
  static Future<bool> deleteTugas(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/delete/$id'));
    return response.statusCode == 200;
  }

  // Ambil tugas berdasarkan Kode Kelas
  static Future<List<Map<String, dynamic>>> getTugasByKelas(String kodeKelas) async {
    final response = await http.get(Uri.parse('$baseUrl/kelas/$kodeKelas'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> tugasList = data['data'];
      return tugasList.map((item) => Map<String, dynamic>.from(item)).toList();
    } else {
      throw Exception('Gagal mengambil data tugas berdasarkan kelas');
    }
  }

  // Method baru: Ambil tugas berdasarkan ID Siswa
  static Future<List<Map<String, dynamic>>> getTugasBySiswa(String idSiswa) async {
    final response = await http.get(Uri.parse('$baseUrl/mobile/siswa/$idSiswa'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> tugasList = data['data'];
      return tugasList.map((item) => Map<String, dynamic>.from(item)).toList();
    } else {
      throw Exception('Gagal mengambil data tugas untuk siswa');
    }
  }
}