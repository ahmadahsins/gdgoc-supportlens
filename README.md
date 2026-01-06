# 🚀 SupportLens: AI Customer Support Intelligence Platform

SupportLens adalah platform helpdesk cerdas yang memberdayakan tim Customer Support untuk menangani tiket lebih cepat menggunakan AI. Platform ini memiliki fitur unggulan **RAG (Retrieval-Augmented Generation)** yang memungkinkan AI memberikan saran jawaban berdasarkan dokumen SOP perusahaan yang diunggah untuk menjaga kualitas respon yang konsisten.

---

## 🏗️ Project Architecture & Tech Stack

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
* **AI Integration:** Google Generative AI SDK (Gemini 1.5 Flash)
* **Vector DB:** Pinecone (untuk sistem RAG)
* **PDF Parsing:** `pdf-parse`

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

* Node.js (v18+)
* Firebase Project (Firestore & Auth enabled)
* Pinecone API Key & Index
* Google AI Studio (Gemini) API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/username/support-lens.git
cd support-lens

```


2. **Setup Server (Backend)**
```bash
cd server
npm install
# Buat file .env dan masukkan API Keys (Gemini, Pinecone, Firebase Admin)
npm run start:dev

```


3. **Setup Client (Frontend)**
```bash
cd client
npm install
# Buat file .env.local dan masukkan Firebase Config
npm run dev

```



---

## 🗺️ Development Roadmap

* **Minggu 1:** Foundation (Auth Sync, Firestore CRUD, Base UI).
* **Minggu 2:** AI Intelligence (Auto-classification, Sentiment, Inbox UI).
* **Minggu 3:** RAG Implementation (PDF Vectorizing, Smart Reply Generation, Analytics).
* **Minggu 4:** Final Testing, Deployment, & Documentation.

---

## ☁️ Deployment

* **Frontend:** Deployed on **Vercel**.
* **Backend:** Deployed on **VPS (Rumahweb)** menggunakan **Coolify**.

---

*Created for GDGoC UGM - AI-Driven Product Challenge 2026*