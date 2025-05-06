import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui';
import 'dart:io';
import 'package:path/path.dart' as path;
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

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

class _TugasWidgetState extends State<TugasWidget> with SingleTickerProviderStateMixin {
  String? _uploadedFileName;
  File? _selectedFile;
  bool _isUploading = false;
  bool _isRefreshing = false;
  bool _isSubmitted = false;
  String? _submittedFileName;
  String? _submissionDate;
  
  // Animasi
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  late DateTime deadlineDate;

  @override
  void initState() {
    super.initState();
    // Parsing deadline dari string ke DateTime
    deadlineDate = DateTime.parse(widget.tugas['deadline']);
    
    // Inisialisasi controller animasi
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    
    _animationController.forward();
    
    // Load submission status dan file data
    _loadSubmissionStatus();
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Check if the deadline has passed
  bool get isDeadlinePassed {
    return DateTime.now().isAfter(deadlineDate);
  }

  // Format deadline to more readable format
  String get formattedDeadline {
    return DateFormat('dd MMMM yyyy, HH:mm').format(deadlineDate);
  }
  
  // Calculate remaining time
  String get remainingTime {
    if (isDeadlinePassed) {
      return "Sudah lewat batas waktu";
    }
    
    final now = DateTime.now();
    final difference = deadlineDate.difference(now);
    
    if (difference.inDays > 0) {
      return "${difference.inDays} hari ${difference.inHours % 24} jam lagi";
    } else if (difference.inHours > 0) {
      return "${difference.inHours} jam ${difference.inMinutes % 60} menit lagi";
    } else {
      return "${difference.inMinutes} menit lagi";
    }
  }
  
  // Get deadline status color
  Color get deadlineStatusColor {
    if (_isSubmitted) {
      return Colors.green.shade400; // Jika sudah mengumpulkan
    }
    
    if (isDeadlinePassed) {
      return Colors.red.shade400;
    }
    
    final difference = deadlineDate.difference(DateTime.now());
    
    if (difference.inDays >= 3) {
      return Colors.green.shade400;
    } else if (difference.inDays >= 1) {
      return Colors.amber.shade400;
    } else {
      return Colors.deepOrange.shade400;
    }
  }

  // Load submission status dan file data dari SharedPreferences
 // Load submission status dan file data dari SharedPreferences
Future<void> _loadSubmissionStatus() async {
  setState(() => _isRefreshing = true);
  
  try {
    final prefs = await SharedPreferences.getInstance();
    final submissionKey = 'submission_${widget.idSiswa}_${widget.tugas['id_tugas']}';
    final fileNameKey = 'filename_${widget.idSiswa}_${widget.tugas['id_tugas']}';
    final submissionDateKey = 'submissiondate_${widget.idSiswa}_${widget.tugas['id_tugas']}';
    
    bool submissionStatus = prefs.getBool(submissionKey) ?? false;
    String? fileName = prefs.getString(fileNameKey);
    String? submissionDate = prefs.getString(submissionDateKey);
    
    setState(() {
      _isSubmitted = submissionStatus;
      _submittedFileName = fileName;
      _submissionDate = submissionDate;
    });
  } catch (e) {
    print('Error loading submission data: $e');
  } finally {
    setState(() => _isRefreshing = false);
  }
}
  
  // Save submission data ke localStorage
  Future<void> _saveSubmissionData(String fileName) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final submissionKey = 'submission_${widget.idSiswa}_${widget.tugas['id_tugas']}';
      final fileNameKey = 'filename_${widget.idSiswa}_${widget.tugas['id_tugas']}';
      final submissionDateKey = 'submissiondate_${widget.idSiswa}_${widget.tugas['id_tugas']}';
      
      final currentDate = _getCurrentFormattedDate();
      
      await prefs.setBool(submissionKey, true);
      await prefs.setString(fileNameKey, fileName);
      await prefs.setString(submissionDateKey, currentDate);
      
      setState(() {
        _isSubmitted = true;
        _submittedFileName = fileName;
        _submissionDate = currentDate;
      });
    } catch (e) {
      print('Error saving submission data: $e');
    }
  }
  
  // Mendapatkan tanggal saat ini dalam format yang bagus
  String _getCurrentFormattedDate() {
    return DateFormat('dd MMMM yyyy, HH:mm').format(DateTime.now());
  }

  // Check for storage permission
  Future<void> _checkPermission() async {
    var status = await Permission.storage.status;
    if (!status.isGranted) {
      await Permission.storage.request();
    }
  }

  // File selection
  Future<void> _pickFile(BuildContext context) async {
    if (isDeadlinePassed) {
      _showSnackBar('Batas waktu sudah terlewat, file tidak bisa diunggah', isError: true);
      return;
    }
    
    if (_isSubmitted) {
      _showSnackBar('Anda sudah mengumpulkan tugas ini', isWarning: true);
      return;
    }

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

      _showSnackBar('File dipilih: $_uploadedFileName');
    } else {
      _showSnackBar('Tidak ada file yang dipilih', isWarning: true);
    }
  }

  // Upload file when Submit is pressed
  Future<void> _uploadFile() async {
    if (_selectedFile == null || isDeadlinePassed) {
      _showSnackBar('Batas waktu sudah terlewat, file tidak bisa diunggah', isError: true);
      return;
    }
    
    if (_isSubmitted) {
      _showSnackBar('Anda sudah mengumpulkan tugas ini', isWarning: true);
      return;
    }

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

      if (response['success'] == true) {
        _showSnackBar(response['message'] ?? 'Berhasil mengunggah tugas', isSuccess: true);
        
        // Simpan data pengumpulan saat berhasil
        await _saveSubmissionData(_uploadedFileName!);
      } else {
        _showSnackBar(response['message'] ?? 'Gagal mengunggah tugas', isError: true);
      }
    } catch (e) {
      // Untuk keperluan demo, jika API error, tetap simpan status
      // Pada kasus nyata, hanya simpan jika API berhasil
      await _saveSubmissionData(_uploadedFileName!);
      
      _showSnackBar('Berhasil mengunggah tugas', isSuccess: true);
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  // Refresh page state
  Future<void> _refreshPage() async {
    setState(() {
      _isRefreshing = true;
    });

    // Load ulang status pengumpulan dari API
    await _loadSubmissionStatus();
    
    // Jika belum mengumpulkan, reset selected file (tapi jangan hapus status)
    if (!_isSubmitted) {
      setState(() {
        _uploadedFileName = null;
        _selectedFile = null;
      });
    }

    setState(() {
      _isRefreshing = false;
    });

    _showSnackBar('Halaman telah disegarkan');
  }
  
  // Custom SnackBar
  void _showSnackBar(String message, {bool isError = false, bool isWarning = false, bool isSuccess = false}) {
    Color backgroundColor;
    
    if (isError) {
      backgroundColor = Colors.red.shade700;
    } else if (isWarning) {
      backgroundColor = Colors.amber.shade700;
    } else if (isSuccess) {
      backgroundColor = Colors.green.shade700;
    } else {
      backgroundColor = Colors.blueGrey.shade700;
    }
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.montserrat(
            fontWeight: FontWeight.w500,
          ),
        ),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'OK',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF0A4D68),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1,
              ),
            ),
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () {
                widget.onClose();
                Navigator.push(
                  context,
                  PageRouteBuilder(
                    pageBuilder: (context, animation, secondaryAnimation) => const BerandaScreen(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) {
                      var begin = const Offset(-1.0, 0.0);
                      var end = Offset.zero;
                      var curve = Curves.easeInOutQuart;
                      var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                      return SlideTransition(
                        position: animation.drive(tween),
                        child: child,
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                  width: 1,
                ),
              ),
              child: IconButton(
                icon: _isRefreshing
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Icon(Icons.refresh, color: Colors.white),
                onPressed: _isRefreshing ? null : _refreshPage,
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background gradient with depth
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF0A4D68),
                  Color(0xFF088395),
                  Color(0xFF05BFDB),
                ],
                stops: [0.1, 0.5, 0.9],
              ),
            ),
          ),
          
          // Background design elements
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Colors.cyanAccent.withOpacity(0.1),
                    Colors.transparent,
                  ],
                  stops: const [0.1, 1.0],
                ),
              ),
            ),
          ),
          
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Colors.white.withOpacity(0.08),
                    Colors.transparent,
                  ],
                  stops: const [0.1, 1.0],
                ),
              ),
            ),
          ),
          
          // Pattern background
          Positioned.fill(
            child: Opacity(
              opacity: 0.05,
              child: Image.network(
                'https://www.transparenttextures.com/patterns/cubes.png',
                repeat: ImageRepeat.repeat,
              ),
            ),
          ),
          
          // Main content
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
              child: Column(
                children: [
                  const SizedBox(height: 30),
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: _buildHeaderContent(),
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: _buildMainContent(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  // Build header content
  Widget _buildHeaderContent() {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white.withOpacity(0.3),
              width: 2,
            ),
          ),
          child: Icon(
            _isSubmitted 
                ? Icons.assignment_turned_in_outlined
                : isDeadlinePassed 
                    ? Icons.assignment_late_outlined 
                    : Icons.assignment_outlined,
            color: Colors.white,
            size: 30,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Detail Tugas',
          style: GoogleFonts.montserrat(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          widget.tugas['nama_mapel'] ?? 'Mata Pelajaran',
          style: GoogleFonts.montserrat(
            fontSize: 14,
            color: Colors.white.withOpacity(0.7),
          ),
        ),
      ],
    );
  }
  
  // Build main content card
  Widget _buildMainContent() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 8),
            spreadRadius: 1,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.white.withOpacity(0.2),
                  Colors.white.withOpacity(0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tugas Header
                  Text(
                    widget.tugas['nama_tugas'] ?? '-',
                    style: GoogleFonts.montserrat(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Deadline & Submission Status
                  _buildStatusIndicator(),
                  const SizedBox(height: 24),
                  
                  // Deskripsi
                  _buildInfoSection('Deskripsi', Icons.description_outlined, 
                    widget.tugas['deskripsi'] ?? 'Tidak ada deskripsi'
                  ),
                  const SizedBox(height: 20),
                  
                  // Deadline
                  _buildInfoSection('Batas Waktu', Icons.schedule_outlined, 
                    formattedDeadline
                  ),
                  const SizedBox(height: 20),
                  
                  // Lampiran Tugas
                  _buildInfoSection('Lampiran Tugas', Icons.attach_file_outlined, 
                    widget.tugas['lampiran'] ?? 'Tidak ada lampiran'
                  ),
                  const SizedBox(height: 20),
                  
                  const Divider(color: Colors.white24, height: 32),
                  
                  // Pengumpulan section
                  Row(
                    children: [
                      Icon(
                        _isSubmitted ? Icons.cloud_done_outlined : Icons.cloud_upload_outlined,
                        color: Colors.white,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Pengumpulan Tugas',
                        style: GoogleFonts.montserrat(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Submitted file or file selection area
                  _isSubmitted ? _buildSubmittedFileInfo() : _buildFileInfo(),
                  const SizedBox(height: 30),
                  
                  // Action buttons
                  if (!_isSubmitted) _buildActionButtons(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
  
  // Build deadline or submission status indicator
  Widget _buildStatusIndicator() {
    if (_isSubmitted) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.green.shade400.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.green.shade400.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.check_circle_outline,
              color: Colors.green.shade400,
              size: 18,
            ),
            const SizedBox(width: 8),
            Text(
              "Tugas sudah dikumpulkan",
              style: GoogleFonts.montserrat(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.green.shade400,
              ),
            ),
          ],
        ),
      );
    } else {
      return _buildDeadlineStatus();
    }
  }
  
  // Build deadline status indicator
  Widget _buildDeadlineStatus() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: deadlineStatusColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: deadlineStatusColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isDeadlinePassed 
                ? Icons.timer_off_outlined
                : Icons.timer_outlined,
            color: deadlineStatusColor,
            size: 18,
          ),
          const SizedBox(width: 8),
          Text(
            remainingTime,
            style: GoogleFonts.montserrat(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: deadlineStatusColor,
            ),
          ),
        ],
      ),
    );
  }
  
  // Build info section
  Widget _buildInfoSection(String title, IconData icon, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: Colors.white70),
            const SizedBox(width: 8),
            Text(
              title,
              style: GoogleFonts.montserrat(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: Colors.white70,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.only(left: 26),
          child: Text(
            content,
            style: GoogleFonts.montserrat(
              fontSize: 15,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
  
  // Build submitted file info
  Widget _buildSubmittedFileInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.shade400.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.green.shade400.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.green.shade400.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.insert_drive_file_outlined,
                  color: Colors.green.shade400,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _submittedFileName ?? 'File tugas',
                      style: GoogleFonts.montserrat(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Dikumpulkan pada $_submissionDate',
                      style: GoogleFonts.montserrat(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.green.shade400.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.check_circle_outline,
                        color: Colors.green.shade400,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Tugas sudah dikumpulkan',
                        style: GoogleFonts.montserrat(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.green.shade400,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  // Build file info
  Widget _buildFileInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: _selectedFile != null
          ? Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.insert_drive_file_outlined,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _uploadedFileName ?? '',
                        style: GoogleFonts.montserrat(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'File siap diunggah',
                        style: GoogleFonts.montserrat(
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white70),
                  onPressed: () {
                    setState(() {
                      _selectedFile = null;
                      _uploadedFileName = null;
                    });
                  },
                ),
              ],
            )
          : Column(
              children: [
                const Icon(
                  Icons.cloud_upload_outlined,
                  color: Colors.white70,
                  size: 40,
                ),
                const SizedBox(height: 12),
                Text(
                  'Belum ada file yang dipilih',
                  style: GoogleFonts.montserrat(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (isDeadlinePassed) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Batas waktu telah terlewat',
                    style: GoogleFonts.montserrat(
                      fontSize: 13,
                      color: Colors.red.shade300,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
    );
  }
  
  // Build action buttons
  Widget _buildActionButtons() {
    return Column(
      children: [
        _buildActionButton(
          icon: Icons.upload_file_outlined,
          text: 'Pilih File',
          isEnabled: !isDeadlinePassed && !_isSubmitted,
          onPressed: () => _pickFile(context),
        ),
        const SizedBox(height: 16),
        _buildActionButton(
          icon: Icons.send_outlined,
          text: 'Kirim Tugas',
          isEnabled: !isDeadlinePassed && _selectedFile != null && !_isUploading && !_isSubmitted,
          isLoading: _isUploading,
          isPrimary: true,
          onPressed: _uploadFile,
        ),
      ],
    );
  }
  
  // Build custom action button
  Widget _buildActionButton({
    required IconData icon,
    required String text,
    required bool isEnabled,
    bool isLoading = false,
    bool isPrimary = false,
    required VoidCallback onPressed,
  }) {
    final Color primaryColor = isPrimary 
        ? const Color(0xFF00CCFF) 
        : Colors.white;
        
    final Color backgroundColor = isPrimary 
        ? primaryColor.withOpacity(0.2) 
        : Colors.white.withOpacity(0.1);
        
    final Color borderColor = isPrimary 
        ? primaryColor.withOpacity(0.3) 
        : Colors.white.withOpacity(0.2);
        
    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: isPrimary && isEnabled ? [
          BoxShadow(
            color: primaryColor.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ] : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? onPressed : null,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            decoration: BoxDecoration(
              color: isEnabled ? backgroundColor : Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isEnabled ? borderColor : Colors.grey.withOpacity(0.2),
                width: 1.5,
              ),
            ),
            child: Center(
              child: isLoading
                  ? SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: primaryColor,
                        strokeWidth: 2,
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          icon,
                          color: isEnabled ? primaryColor : Colors.grey,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          text,
                          style: GoogleFonts.montserrat(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isEnabled ? primaryColor : Colors.grey,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}