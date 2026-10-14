export const mockHome = {
  trending_discussions: [
    {
      id: 1,
      full_name: 'Budi Santoso',
      status: 'Mahasiswa FHS',
      content:
        'Tips menghadapi Dosen Pembimbing yang slow respon pas mau revisi Bab 4?',
      comment_count: 24,
      hashtags: ['Skripsi', 'FHS'],
    },
    {
      id: 2,
      full_name: 'Anonim',
      status: 'Mahasiswa Anonim',
      content:
        'Merasa salah jurusan di semester 5 dan burnout parah, harus bertahan atau pindah',
      hashtags: ['Curhat', 'KehidupanMahasiswa'],
      comment_count: 42,
    },
    {
      id: 3,
      full_name: 'Siti Nurhaliza',
      status: 'Mahasiswa FICT',
      content:
        'Berapa banyak karya yang idealnya dimasukkan ke Portofolio Magang UI/UX?',
      hashtags: ['Curhat', 'KehidupanMahasiswa'],
      comment_count: 14,
    },
  ],

  trending_topics: [
    { name: 'Skripsi', type: 'general' },
    { name: 'Curhat', type: 'general' },
    { name: 'DuniaKerja', type: 'general' },
    { name: 'KehidupanMahasiswa', type: 'general' },
  ],

  posts: [
    {
      id: 101,
      full_name: 'Budi Santoso',
      status: 'Mahasiswa FHS',
      content:
        'Semester depan gw rencananya mau ambil 24 SKS nih biar bisa kejar matkul atas. Ada rekomendasi matkul pilihan di prodi Manajemen yang dosennya santai, ramah nilai, dan tugasnya nggak numpuk nggak?',
      caption: 'Rekomendasi mata kuliah pilihan semester 4 yang bobot tugasnya terhitung santai?',
      created_at: new Date().toISOString(),
      hashtags: ['SKS'],
      media: [],
      is_reacted: false,
      reaction_count: 16,
      is_bookmarked: false,
      comment_count: 4,
      can_edit: false,
      can_delete: false,
    },
    {
      id: 102,
      full_name: 'Nabila Z',
      status: 'Mahasiswa',
      content:
        'Tim gue udah ada 2 org (Frontend & Backend), kurang 1 org lagi khusus pegang Design System & Wireframe. Btw proyeknya udah berjalan 30%, tinggal rapihin prototype. Yang minat nyari portofolio riil/sertifikat, DM atau reply thread ini ya. Diutamakan yang ga suka ngilang pas H-1 deadline',
      caption: 'Need 1 anak UI/UX buat tim Gemastik / Capstone. Yang jago Figma & ga ghosting',
      created_at: new Date().toISOString(),
      hashtags: ['UI/UX'],
      media: [],
      is_reacted: true,
      reaction_count: 3,
      is_bookmarked: false,
      comment_count: 26,
      can_edit: false,
      can_delete: false,
    },
    {
      id: 103,
      full_name: 'Siti Rahma',
      status: 'Mahasiswa',
      content:
        'Mau sekadar sharing sekaligus nanya ke sesama alumni. Setelah wisuda kemarin, butuh berapa bulan sampai kalian dapet offer kerjaan pertama? Gue jujur udah 3 bulan sebar 50+ CV baru dipanggil interview 2 kali. Pengen tau aja ini wajar di kondisi job market sekarang atau CV gue yang kurang greget ya?',
      caption: 'Berapa rata-rata lama waktu tunggu dapet kerja pertama (first job) lulusan kampus kita?',
      created_at: new Date().toISOString(),
      hashtags: ['DuniaKerja'],
      media: [],
      is_reacted: true,
      reaction_count: 41,
      is_bookmarked: false,
      comment_count: 22,
      can_edit: false,
      can_delete: false,
    },
    {
      id: 104,
      full_name: 'Andi Pratama',
      status: 'Mahasiswa FHS',
      content:
        'Aku sedang menyusun Bab 3 skripsi dan masih bingung menentukan metode penelitian yang sesuai. Ada saran dari teman-teman yang sudah melewati tahap ini?',
      caption:
        'Diskusi metode penelitian untuk Bab 3 skripsi',
      created_at: new Date().toISOString(),
      hashtags: ['Skripsi'],
      media: [],
      is_reacted: false,
      reaction_count: 0,
      is_bookmarked: false,
      comment_count: 0,
      can_edit: false,
      can_delete: false,
      // Catatan: media masih kosong, jadi foto belum akan tampil dari data ini. 
      // Kita perlu mencocokkan struktur media dengan komponen kartu postingan yang sudah ada 
      // agar foto ditampilkan dengan benar.
    },
  ],
};
