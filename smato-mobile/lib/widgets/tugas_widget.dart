import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:ui';
import 'dart:io';
import 'package:path/path.dart' as path;

import '../screens/beranda_screens.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../api/pengumpulan_services.dart';

class TugasWidget extends StatefulWidget {
  final Map<String, dynamic> tugas;
  final int idSiswa;
  final VoidCallback onClose;

  const TugasWidget({
    Key? key,
    required this.tugas,
    required this.idSiswa,
    required this.onClose,
  }) : super(key: key);

  @override
  State<TugasWidget> createState() => _TugasWidgetState();
}

class _TugasWidgetState extends State<TugasWidget> {
  String? _uploadedFileName;
  File? _selectedFile;
  bool _isUploading = false;
  bool _isRefreshing = false;

  Future<void> _checkPermission() async {
    var status = await Permission.storage.status;
    if (!status.isGranted) {
      await Permission.storage.request();
    }
  }

  Future<void> _pickFile(BuildContext context) async {
    await _checkPermission();

    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
    );

    if (result != null) {
      final file = File(result.files.single.path!);

      setState(() {
        _uploadedFileName = path.basename(file.path);
        _selectedFile = file;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('File dipilih: $_uploadedFileName')),
      );

      await _uploadFile();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tidak ada file yang dipilih')),
      );
    }
  }

  Future<void> _uploadFile() async {
    if (_selectedFile == null) return;

    setState(() {
      _isUploading = true;
    });

    try {
      final response = await PengumpulanService().uploadFilePengumpulan(
        idSiswa: widget.idSiswa.toString(),
        idMapel: widget.tugas['id_mapel'].toString(),
        idTugas: widget.tugas['id_tugas'].toString(),
        idGuru: widget.tugas['id_guru'].toString(),
        file: _selectedFile!,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response['message'] ?? 'Berhasil mengunggah')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal mengunggah file')),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  Future<void> _refreshPage() async {
    setState(() {
      _isRefreshing = true;
    });

    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _uploadedFileName = null;
      _selectedFile = null;
      _isRefreshing = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Halaman telah disegarkan')),
    );
  }

  Widget _buildLabel(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTextStyles.label.copyWith(color: Colors.white70, fontSize: 14)),
          const SizedBox(height: 4),
          Text(value ?? '-', style: AppTextStyles.label.copyWith(color: Colors.white, fontSize: 15)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color.fromARGB(255, 5, 102, 135), // Latar belakang solid
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () {
                      widget.onClose();
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => BerandaScreen()),
                      );
                    },
                    icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
                  ),
                  IconButton(
                    icon: _isRefreshing
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Icon(Icons.refresh, color: Colors.white),
                    tooltip: 'Segarkan halaman',
                    onPressed: _isRefreshing ? null : _refreshPage,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(30),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.white.withOpacity(0.15),
                            Colors.white.withOpacity(0.05),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                        boxShadow: [
                          BoxShadow(
                            color: const Color.fromARGB(255, 0, 0, 0).withOpacity(0.1),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(24),
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.tugas['nama_tugas'] ?? '-', style: AppTextStyles.titletugas.copyWith(fontSize: 26, color: Colors.white, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 20),
                            _buildLabel('Deskripsi:', widget.tugas['deskripsi']),
                            _buildLabel('Batas waktu:', widget.tugas['deadline']),
                            _buildLabel('Lampiran:', widget.tugas['lampiran']),
                            const SizedBox(height: 20),
                            Divider(color: Colors.white30),
                            _buildLabel('Lampiran Anda:', _uploadedFileName),
                            const SizedBox(height: 30),
                            Center(
                              child: _isUploading
                                  ? const CircularProgressIndicator()
                                  : ElevatedButton.icon(
                                      onPressed: () => _pickFile(context),
                                      icon: const Icon(Icons.upload_file_rounded, size: 20),
                                      label: const Text('Upload Tugas'),
                                      style: ElevatedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
                                        backgroundColor: Colors.white.withOpacity(0.15),
                                        foregroundColor: Colors.white,
                                        shadowColor: Color.fromARGB(66, 0, 119, 255),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(18),
                                        ),
                                        elevation: 8,
                                        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
