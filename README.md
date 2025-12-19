# AL-Bahtsu

Platform pencarian canggih untuk menemukan rumusan musyawarah dan ibarat fikih dari berbagai sumber terpercaya.

## 🚀 Fitur

### 🔍 Pencarian Canggih
- **Full-Text Search (FTS)** dengan PostgreSQL untuk performa optimal
- Pencarian dalam Bahasa Indonesia dan Arab
- Pencarian di semua field: judul, pertanyaan, jawaban, ibarat, dan sumber
- Relevansi hasil yang akurat

### 📖 Tampilan Publik
- Halaman utama dengan search bar yang elegan
- Hasil pencarian dengan kartu yang informatif
- Halaman detail dengan tampilan Arab RTL yang proper
- Responsive design untuk mobile dan desktop

### 🔐 Panel Admin
- Autentikasi dengan NextAuth.js + Supabase Auth
- CRUD operations untuk entri fikih
- Form dengan validasi menggunakan Zod
- Dashboard untuk melihat semua entri

### 🎨 UI/UX Modern
- **shadcn/ui** components untuk design yang konsisten
- **Tailwind CSS** untuk styling yang responsif
- **Font Arab** (Noto Naskh Arabic) untuk tampilan ibarat yang benar
- **Dark/Light mode** support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js + Supabase Auth
- **Search**: PostgreSQL Full-Text Search (FTS)

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd muara
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase Database

📖 **Lihat guide lengkap**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

#### Quick Setup:
1. Create project di [supabase.com](https://supabase.com)
2. Jalankan SQL dari file `supabase-schema.sql` di Supabase SQL Editor
3. Setup Authentication (Enable Email provider)
4. Buat admin user
5. Copy API keys ke environment variables

### 4. Setup Authentication

📖 **Lihat guide lengkap**: [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)

#### Quick Setup:
1. Configure Supabase Auth (site URL, redirect URLs)
2. Enable Email provider
3. Create admin user di Supabase
4. Set NEXTAUTH_SECRET di environment variables
5. Test login flow

### 5. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── (admin)/admin/          # Panel admin routes
│   │   ├── page.tsx           # Dashboard admin
│   │   ├── layout.tsx         # Layout dengan middleware
│   │   ├── new/               # Tambah entri baru
│   │   └── edit/[id]/         # Edit entri
│   ├── api/
│   │   ├── auth/              # NextAuth routes
│   │   └── admin/             # Admin API routes
│   ├── entry/[id]/            # Halaman detail entri
│   ├── search/                # Halaman hasil pencarian
│   ├── login/                 # Halaman login admin
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Halaman utama
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── SearchComponent.tsx    # Search bar component
│   ├── FiqhCard.tsx          # Card untuk hasil pencarian
│   ├── AdminForm.tsx         # Form CRUD admin
│   └── Providers.tsx         # NextAuth provider
└── lib/
    ├── supabaseClient.ts     # Supabase client configuration
    └── utils.ts              # Utility functions
```

## 🔧 API Routes

### Public Routes
- `GET /search?q=query` - Pencarian entri
- `GET /entry/[id]` - Detail entri

### Admin Routes (Authenticated)
- `GET /api/admin/entries` - List semua entri
- `POST /api/admin/entries` - Tambah entri baru
- `GET /api/admin/entries/[id]` - Detail entri
- `PUT /api/admin/entries/[id]` - Update entri
- `DELETE /api/admin/entries/[id]` - Hapus entri

### Authentication Routes
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/signout` - Logout handler

## 📚 Dokumentasi Lengkap

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Panduan lengkap setup database Supabase
- **[AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)** - Panduan lengkap setup authentication
- **[supabase-schema.sql](./supabase-schema.sql)** - Schema database lengkap

## 🗄️ Database Schema

### fiqh_entries
- `id` (UUID, Primary Key)
- `title` (TEXT) - Judul/Topik masalah
- `question_text` (TEXT, Optional) - Pertanyaan
- `answer_summary` (TEXT) - Jawaban dalam Bahasa Indonesia
- `ibarat_text` (TEXT) - Ibarat dalam Bahasa Arab
- `source_kitab` (TEXT, Optional) - Nama kitab
- `source_details` (TEXT, Optional) - Detail sumber
- `musyawarah_source` (TEXT, Optional) - Sumber musyawarah
- `entry_type` (TEXT) - 'rumusan' atau 'ibarat'
- `created_at` (TIMESTAMPTZ) - Timestamp pembuatan

### FTS (Full-Text Search)
- `fts_vector` (tsvector) - Kolom generated untuk FTS
- `fts_search_idx` (GIN Index) - Index untuk performa pencarian

## 🎯 Cara Penggunaan

### Untuk Publik
1. Buka [http://localhost:3000](http://localhost:3000)
2. Ketik kata kunci di search bar
3. Tekan Enter atau klik tombol search
4. Lihat hasil pencarian
5. Klik kartu untuk melihat detail

### Untuk Admin
1. Buka [http://localhost:3000/login](http://localhost:3000/login)
2. Login dengan email dan password admin
3. Akan di-redirect ke dashboard admin
4. Dari dashboard bisa:
   - Lihat semua entri
   - Tambah entri baru
   - Edit entri existing
   - Hapus entri

## 🚀 Production Deployment

### 1. Environment Variables
Set semua environment variables di hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (production URL)

### 2. Build & Deploy
```bash
npm run build
npm start
```

### 3. Supabase Production
- Gunakan Supabase project production
- Update redirect URLs di Auth settings
- Pastikan RLS policies sudah benar

## 🤝 Contributing

1. Fork repository
2. Buat feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push ke branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail

## 🆘 Troubleshooting

### Common Issues

#### 1. Supabase Connection Error
- Pastikan environment variables benar
- Cek Supabase project URL dan keys
- Pastikan network tidak blocked

#### 2. Authentication Error
- Pastikan Auth provider enabled di Supabase
- Cek redirect URLs
- Pastikan NEXTAUTH_SECRET sudah di-set

#### 3. Search Not Working
- Pastikan FTS function sudah dibuat
- Cek GIN index sudah terbuat
- Verify RLS policies allow public read

#### 4. Font Arab Tidak Muncul
- Pastikan Noto Naskh Arabic loaded
- Cek CSS variables
- Verify font-family settings

### Debug Mode
Enable debug mode dengan menambah environment variable:
```env
DEBUG=next-auth:*
