# 🚀 SupportLens: AI Customer Support Intelligence Platform

SupportLens adalah platform helpdesk cerdas yang memberdayakan tim Customer Support untuk menangani tiket lebih cepat menggunakan AI. Platform ini memiliki fitur unggulan **RAG (Retrieval-Augmented Generation)** yang memungkinkan AI memberikan saran jawaban berdasarkan dokumen SOP perusahaan yang diunggah untuk menjaga kualitas respon yang konsisten.

---

## 🔗 Live Demo

| Service | URL |
|---------|-----|
| **Frontend App** | [https://supportlens.vercel.app](https://supportlens.vercel.app) |
| **Backend API** | [https://api.supportlens.cloud](https://api.supportlens.cloud) |
| **API Documentation** | [https://api.supportlens.cloud/api-docs](https://api.supportlens.cloud/api-docs) |

---

## �🏗️ Project Architecture & Tech Stack

Proyek ini menggunakan struktur **Monorepo** untuk memisahkan logika Frontend dan Backend namun tetap dalam satu kontrol versi.

### Frontend (`/client`)

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Shadcn UI
* **Auth:** Firebase Client SDK
* **Data Fetching:** Axios / TanStack Query

### Backend (`/server`)

* **Framework:** NestJS (Node.js)
* **Language:** TypeScript
* **Database:** Cloud Firestore (via Firebase Admin SDK)
* **AI Integration:** Google Gen AI SDK `@google/genai` (Gemini 2.5 Flash + Gemini Embedding 001)
* **Vector DB:** Pinecone (untuk sistem RAG)
* **PDF Parsing:** `pdf-parse`
* **API Documentation:** Swagger (OpenAPI)

---

## 🌳 Git Workflow & Conventions

Untuk memenuhi kriteria evaluasi "Team Collaboration & Development Process", tim menggunakan standar berikut:

### 1. Branching Strategy

Dilarang melakukan commit langsung ke branch `main`. Gunakan branch fitur dengan prefix berikut:

* `main`: Kode stabil yang siap dideploy/dinilai.
* `feat/`: Implementasi fitur baru (contoh: `feat/be-rag-logic`).
* `fix/`: Perbaikan bug (contoh: `fix/api-auth-error`).
* `docs/`: Perubahan dokumentasi (contoh: `docs/update-readme`).
* `chore/`: Tugas pemeliharaan/setup (contoh: `chore/init-nestjs`).

### 2. Commit Message Convention

Mengacu pada **Conventional Commits** dengan format: `<type>: <description>`

* `feat`: Fitur baru.
* `fix`: Perbaikan bug.
* `chore`: Update build tasks, install package, dll.
* `docs`: Perubahan dokumentasi.
* `refactor`: Perubahan kode yang bukan fitur maupun bugfix.

**Contoh:** `feat: implement gemini classification for new tickets`

### 3. Collaboration Flow

* **Pull**: Tarik kode terbaru dari `main` sebelum mulai bekerja.
```bash
git checkout main
git pull origin main

```


* **Branch**: Buat branch baru dari `main` sesuai fitur yang akan dikerjakan.
```bash
git checkout -b feat/nama-fitur

```


* **Commit**: Lakukan commit secara deskriptif dan atomik (kecil dan fokus).
```bash
git add .
git commit -m "feat: deskripsi singkat fitur"

```


* **Push & PR**: Push branch ke GitHub dan buat **Pull Request** untuk di-review.
```bash
git push origin feat/nama-fitur

```



---

## 👥 User Roles & Permissions

| Role | Access | Responsibilities |
| --- | --- | --- |
| **Customer** | Public | Mengirim keluhan melalui halaman simulasi chat tanpa login. |
| **Support Agent** | Protected (`agent`) | Mengelola inbox, membalas tiket, dan menggunakan fitur AI Copilot. |
| **Support Lead** | Admin (`admin`) | Semua akses Agent + Dashboard Analytics & Pengelolaan SOP (RAG). |

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v22+)
* pnpm (recommended) or npm
* Firebase Project (Firestore & Auth enabled)
* Pinecone API Key & Index
* Google AI Studio (Gemini) API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ahmadahsins/gdgoc-supportlens.git
cd gdgoc-supportlens

```


2. **Setup Server (Backend)**
```bash
cd server
pnpm install
# Copy dan edit file .env
cp .env.example .env
# Masukkan API Keys (Gemini, Pinecone, Firebase Admin)
pnpm run start:dev

```


3. **Setup Client (Frontend)**
```bash
cd client
pnpm install
# Buat file .env.local dan masukkan Firebase Config
pnpm run dev

```



---

## � API Documentation

API Documentation tersedia via Swagger UI:

- **Local:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Production:** [https://api.supportlens.cloud/api-docs](https://api.supportlens.cloud/api-docs)

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/tickets` | Create new ticket (Public) |
| `GET` | `/tickets` | Get all tickets |
| `GET` | `/tickets/:id` | Get ticket detail |
| `POST` | `/tickets/:id/reply` | Reply to ticket |
| `POST` | `/tickets/:id/summarize` | AI summarize conversation |
| `POST` | `/tickets/:id/generate-draft` | RAG-powered draft reply |
| `GET` | `/analytics/stats` | Dashboard statistics (Admin) |
| `POST` | `/knowledge-base/upload` | Upload SOP document (Admin) |
| `GET` | `/knowledge-base` | List documents (Admin) |
| `DELETE` | `/knowledge-base/:id` | Delete document (Admin) |

---

## �🗺️ Development Roadmap

* **Minggu 1:** Foundation (Auth Sync, Firestore CRUD, Base UI).
* **Minggu 2:** AI Intelligence (Auto-classification, Sentiment, Inbox UI).
* **Minggu 3:** RAG Implementation (PDF Vectorizing, Smart Reply Generation, Analytics).
* **Minggu 4:** Final Testing, Deployment, & Documentation.

---

## ☁️ Deployment

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend App** | Vercel | [https://supportlens.vercel.app](https://supportlens.vercel.app) |
| **Backend API** | VPS (Rumahweb) via Docker | [https://api.supportlens.cloud](https://api.supportlens.cloud) |

### Deployment Stack (Backend)
- Docker + Docker Compose
- Nginx (Reverse Proxy + SSL)
- GitHub Actions (CI/CD)

---

*Created for GDGoC UGM - AI-Driven Product Challenge 2026*