// lib/services/presensi_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

class PresensiService {
  static const String baseUrl = 'http://192.168.1.17:3000/api/presensi';

  // Kirim Presensi
  Future<Map<String, dynamic>> kirimPresensi(String idSiswa, String idMapel, String idAbsen,String idGuru) async {
    final response = await http.post(
      Uri.parse('$baseUrl/presensi'),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'id_siswa': idSiswa,
        'id_mapel': idMapel,
        'id_absen': idAbsen,
      }),
    );

    if (response.statusCode == 200) {
      // Mengambil data riwayat presensi yang terbaru setelah presensi dilakukan
      return jsonDecode(response.body);
    } else {
      throw Exception('Gagal mengirim presensi');
    }
  }

  // Mendapatkan Riwayat Presensi Siswa
  Future<Map<String, dynamic>> getRiwayatPresensi(String idSiswa) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/riwayat?id_siswa=$idSiswa'),
        headers: <String, String>{
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);

        // Pastikan data selalu punya key 'riwayatPresensi'
        if (data['riwayatPresensi'] == null || data['riwayatPresensi'].isEmpty) {
          return {'riwayatPresensi': []}; // Aman untuk ditampilkan di UI
        }

        return data;
      } else {
        // Tangani status gagal tapi jangan lempar exception langsung
        return {'riwayatPresensi': []};
      }
    } catch (error) {
      // Tangani kesalahan jaringan atau parsing
      return {'riwayatPresensi': []};  // Kembalikan list kosong agar tidak crash di UI
    }
  }

  // Fungsi untuk mengambil riwayat presensi terbaru setelah presensi berhasil
  Future<List<dynamic>> getUpdatedRiwayatPresensi(String idSiswa, String idKelas) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/riwayat?id_siswa=$idSiswa&id_kelas=$idKelas'),
        headers: <String, String>{
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        return data['riwayatPresensi'] ?? [];  // Mengembalikan riwayat presensi terbaru
      } else {
        return [];  // Kembalikan list kosong jika gagal
      }
    } catch (error) {
      return [];  // Kembalikan list kosong jika terjadi kesalahan
    }
  }
}
