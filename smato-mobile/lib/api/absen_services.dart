import 'dart:convert';
import 'package:http/http.dart' as http;

class AbsenModel {
  final String idAbsen;
  final String idMapel;
  final String namaMapel;
  final String namaGuru;
  final String nip;
  final String tanggal;
  final String jamMulai;
  final String jamSelesai;

  AbsenModel({
    required this.idAbsen,
    required this.idMapel,
    required this.namaMapel,
    required this.namaGuru,
    required this.nip,
    required this.tanggal,
    required this.jamMulai,
    required this.jamSelesai,
  });

  factory AbsenModel.fromJson(Map<String, dynamic> json) {
    return AbsenModel(
      idAbsen: json['id_absen'].toString(),
      idMapel: json['id_mapel'].toString(),
      namaMapel: json['nama_mapel'],
      namaGuru: json['nama_guru'],
      nip: json['nip'],
      tanggal: json['tanggal'],
      jamMulai: json['jam_mulai'],
      jamSelesai: json['jam_selesai'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id_mapel': idMapel,
      'nama_mapel': namaMapel,
      'nama_guru': namaGuru,
      'nip': nip,
      'tanggal': tanggal,
      'jam_mulai': jamMulai,
      'jam_selesai': jamSelesai,
    };
  }
}

class AbsenService {
  static const String baseUrl = 'http://192.168.154.120:3000/api/absen';

  // Method baru: Ambil data absen berdasarkan ID Siswa
static Future<List<Map<String, dynamic>>> getAbsenBySiswa(String idSiswa) async {
  final response = await http.get(Uri.parse('$baseUrl/mobile/siswa/$idSiswa'));

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final List<dynamic> absenList = data['data'];
    return absenList.map((item) => Map<String, dynamic>.from(item)).toList();
  } else {
    throw Exception('Gagal mengambil data absen untuk siswa');
  }
}

  // Ambil semua data absen
 // Bukan List<AbsenModel> lagi
static Future<List<Map<String, dynamic>>> getAllAbsen() async {
  final response = await http.get(Uri.parse('$baseUrl/getall'));

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final List<dynamic> absenList = data['data'];
    return absenList.map((item) => Map<String, dynamic>.from(item)).toList();
  } else {
    throw Exception('Gagal mengambil data absen');
  }
}


  // Ambil absen berdasarkan ID
  static Future<AbsenModel> getAbsenById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/get/$id'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return AbsenModel.fromJson(data['data'][0]); // asumsi data array
    } else {
      throw Exception('Absen tidak ditemukan');
    }
  }

  // Tambah absen
  static Future<bool> addAbsen(Map<String, dynamic> absenData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/store'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(absenData),
    );

    return response.statusCode == 201;
  }

  // Update absen
  static Future<bool> updateAbsen(String id, Map<String, dynamic> absenData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/update/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(absenData),
    );

    return response.statusCode == 200;
  }

  // Hapus absen
  static Future<bool> deleteAbsen(String id) async {
    final response = await http.delete(Uri.parse('$baseUrl/delete/$id'));
    return response.statusCode == 200;
  }

  // Ambil data absen berdasarkan ID Kelas
static Future<List<Map<String, dynamic>>> getAbsenByKelas(String idKelas) async {
  final response = await http.get(Uri.parse('$baseUrl/byKelas/$idKelas'));

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final List<dynamic> absenList = data['data'];
    return absenList.map((item) => Map<String, dynamic>.from(item)).toList();
  } else {
    throw Exception('Gagal mengambil data absen berdasarkan kelas');
  }
}


}
