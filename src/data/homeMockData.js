
export const mockHome = {
  trending_discussions: [
    {
      id: 1,
      full_name: 'Andi Pratama',
      status: 'Mahasiswa Informatika',
      content:
        'Apa bahasa pemrograman yang paling cocok untuk mulai belajar web development?',
      hashtags: ['WebDevelopment', 'Programming'],
      comment_count: 12,
    },
    {
      id: 2,
      full_name: 'Siti Rahma',
      status: 'Mahasiswa',
      content:
        'Ada rekomendasi cara belajar algoritma agar lebih mudah dipahami?',
      hashtags: ['Algoritma', 'StudyTips'],
      comment_count: 8,
    },
  ],

  trending_topics: [
    { name: 'Programming', type: 'general' },
    { name: 'WebDevelopment', type: 'general' },
    { name: 'UIUX', type: 'general' },
  ],

  posts: [
    {
      id: 101,
      full_name: 'Andi Pratama',
      status: 'Mahasiswa Informatika',
      content:
        'Halo semuanya! Saya sedang belajar React dan ingin berbagi progres belajar di sini.',
      caption: 'Progres belajar minggu ini',
      created_at: new Date().toISOString(),
      hashtags: ['React', 'WebDevelopment'],
      media: [],
      is_reacted: false,
      reaction_count: 5,
      is_bookmarked: false,
      comment_count: 2,
      can_edit: false,
      can_delete: false,
    },
    {
      id: 102,
      full_name: 'Siti Rahma',
      status: 'Mahasiswa',
      content:
        'Menurut kalian, lebih enak belajar UI/UX menggunakan Figma atau langsung praktik coding?',
      caption: 'Diskusi UI/UX',
      created_at: new Date().toISOString(),
      hashtags: ['UIUX', 'Design'],
      media: [],
      is_reacted: true,
      reaction_count: 9,
      is_bookmarked: false,
      comment_count: 4,
      can_edit: false,
      can_delete: false,
    },
  ],
};
