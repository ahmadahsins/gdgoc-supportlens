# **📄 Technical Specification: SupportLens (AI Customer Support Platform)**

---

## **1\. Project Overview**

**SupportLens** adalah platform *helpdesk* cerdas yang memberdayakan tim Customer Support untuk menangani tiket lebih cepat menggunakan AI. Platform ini memiliki fitur unggulan **RAG (Retrieval-Augmented Generation)** yang memungkinkan AI memberikan saran jawaban berdasarkan dokumen SOP perusahaan yang diunggah, mengatasi masalah inkonsistensi jawaban manual1.

### **Core Objectives**

1. **Automation:** Klasifikasi, sentimen, dan ringkasan otomatis saat tiket masuk2.  
2. **Precision:** Saran balasan (*draft*) yang akurat sesuai *Knowledge Base* perusahaan3.  
3. **Insight:** Analitik tren keluhan untuk Lead4.

---

## **2\. Tech Stack Ecosystem**

Berikut adalah teknologi utama yang digunakan dalam pengembangan sistem ini:

* **Frontend:**  
  * **Framework:** Next.js (App Router)  
  * **Language:** TypeScript  
  * **Styling:** Tailwind CSS \+ Shadcn UI  
  * **Auth:** Firebase Client SDK  
  * **State/Data Fetching:** TanStack Query / Axios  
* **Backend:**  
  * **Framework:** NestJS (Node.js)  
  * **Language:** TypeScript  
  * **Database Access:** Firebase Admin SDK (Firestore)  
  * **AI Integration:** Google Gen AI SDK `@google/genai` (Gemini 2.5 Flash + Gemini Embedding 001)  
  * **Vector Database:** Pinecone (untuk RAG, dimension: 768)  
  * **Doc Parsing:** pdf-parse (v1.1.0)  
* **Infrastructure:**  
  * **Database:** Cloud Firestore (NoSQL)  
  * **Auth Provider:** Firebase Authentication (Google Sign-In)  
  * **Deployment:** Vercel (Frontend), VPS (Backend)

---

## **3\. User Roles & Access Control (RBAC)**

Sistem ini memiliki 3 tipe pengguna dengan wewenang yang dibedakan secara ketat sesuai User Persona5:

### **A. Customer (Public / Guest)**

* **Deskripsi:** Pengguna eksternal yang mengajukan keluhan.  
* **Auth:** Tidak perlu login (Anonymous).  
* **Wewenang:**  
  * Mengakses halaman simulasi chat (/demo-chat).  
  * Mengirim pesan baru ke sistem (POST /api/tickets).

### **B. Support Agent (Internal Staff)**

* **Deskripsi:** Staf garda depan yang menangani tiket harian6.  
* **Auth:** Login via Google (Firebase Auth).  
* **Role ID:** agent  
* **Wewenang:**  
  * Melihat Dashboard Inbox7.  
  * Melihat detail tiket dan riwayat chat.  
  * Menggunakan fitur AI (Summarize, Generate Draft)8.  
  * Membalas dan menutup tiket.  
  * ❌ **RESTRICTION:** Tidak bisa mengakses halaman Analytics & Knowledge Base Settings.

### **C. Support Lead (Admin)**

* **Deskripsi:** Manajer tim (Persona: Alex) yang memantau performa & mengatur SOP9999.  
* \+1  
* **Auth:** Login via Google (Firebase Auth).  
* **Role ID:** admin  
* **Wewenang:**  
  * Semua wewenang **Support Agent**.  
  * ✅ Mengakses halaman Analytics (Trend Sentimen)10.  
  * ✅ Mengakses halaman Knowledge Base (Upload PDF SOP).

---

## **4\. Frontend Architecture (Sitemap)**

Aplikasi Frontend (Next.js) terdiri dari 6 halaman utama. Partner Frontend wajib membuat rute-rute ini:

| Route URL | Nama Halaman | Akses | Fitur Utama |
| :---- | :---- | :---- | :---- |
| /demo-chat | **Customer Simulation** | Public | Form input nama, email, pesan. Tombol kirim untuk trigger tiket baru. |
| /login | **Login Page** | Public | Tombol "Sign in with Google". Redirect ke dashboard jika sukses. |
| /dashboard | **Unified Inbox** | Agent, Admin | List tiket, Filter (Open/Closed), Indikator Sentimen & Urgency111111. \+1 |
| /tickets/\[id\] | **Ticket Workspace** | Agent, Admin | Chat history view, AI Summary panel, Tombol "Generate RAG Draft", Textarea balasan12. |
| /analytics | **Analytics Dashboard** | **Admin Only** | Grafik Pie Chart (Sentimen), Bar Chart (Kategori Isu), Stat Cards (Total Tiket)131313. \+1 |
| /settings/kb | **Knowledge Base** | **Admin Only** | List dokumen SOP aktif, Upload PDF area (Drag & Drop). |

---

## **5\. Backend Architecture & Database Schema**

### **Database: Cloud Firestore**

Berikut struktur koleksi data yang harus dikelola Backend:

**Collection: users**

```json
{  
  "uid": "firebase_uid_string",  
  "email": "alex@company.com",  
  "role": "admin", // atau "agent"
  "createdAt": "ISO8601 string"  
}
```

**Collection: tickets**

```json
{  
  "id": "auto_generated_id",  
  "senderName": "Budi Customer",  
  "senderEmail": "budi@gmail.com",  
  "initialMessage": "Aplikasi error saat checkout",  
  "status": "OPEN", // "OPEN" | "CLOSED"  
  "createdAt": "Firestore Timestamp",  
  "aiAnalysis": {  
    "category": "Technical Issue", // "Technical Issue" | "Billing Issue" | "Account Issue" | "General Inquiry" | "Feature Request" | "Other"  
    "sentiment": "Negative", // "Positive" | "Neutral" | "Negative"  
    "urgencyScore": 8, // Skala 1-10  
    "summary": "User gagal checkout..." // Bahasa Indonesia  
  },  
  "messages": [ // Array of Objects  
    { "sender": "customer", "message": "...", "time": "ISO8601 string" },  
    { "sender": "agent", "message": "...", "time": "ISO8601 string", "agentEmail": "...", "agentRole": "..." }  
  ]  
}
```

**Collection: knowledge_base**

```json
{
  "id": "auto_generated_id",
  "filename": "SOP_Refund_Policy.pdf",
  "uploadedAt": "ISO8601 string",
  "chunksCount": 15,
  "status": "indexed"
}
```

* **Index Name:** supportlens-kb (konfigurasi via env: `PINECONE_INDEX_NAME`)
* **Dimension:** 768 (disesuaikan dengan `outputDimensionality` Gemini Embedding)
* **Namespace:** sops  
* **Metadata:** `{ source: "filename.pdf", text: "original text chunk", chunkIndex: number }`
* **Vector ID Format:** `{filename_sanitized}_chunk_{index}`

---

## **6\. API Contract (Backend Endpoints)**

Ini adalah kontrak final. Frontend **hanya** boleh mengakses data lewat endpoint ini. Semua endpoint (kecuali Public) wajib menyertakan Header: Authorization: Bearer \<Firebase\_ID\_Token\>.

### **A. Authentication & User**

* **POST /auth/sync**  
  * *Fungsi:* Sinkronisasi data user dari Firebase Auth ke Firestore saat login pertama.  
  * *Body:* `{ role: "agent" }` (Default)  
  * *Response:* `{ status: "synced", user: UserObject }`

### **B. Tickets (Operational)**

* **POST /tickets (PUBLIC)**  
  * *Fungsi:* Menerima pesan dari halaman /demo-chat. Trigger AI Classification otomatis.  
  * *Body:* `{ name: string, email: string, message: string }`  
  * *Response:* `{ ticketId: string, ai_analysis: { category, sentiment, urgencyScore, summary } }`  
* **GET /tickets**  
  * *Fungsi:* Get all tickets untuk Inbox. Bisa filter via query params.  
  * *Query:* `?status=OPEN` atau `?status=CLOSED`  
  * *Response:* `[ { id, senderName, senderEmail, status, createdAt, aiAnalysis, messages }, ... ]`  
* **GET /tickets/:id**  
  * *Fungsi:* Ambil detail lengkap satu tiket beserta history chat.  
  * *Response:* `{ id, senderName, senderEmail, initialMessage, status, createdAt, aiAnalysis, messages }`  
* **POST /tickets/:id/reply**  
  * *Fungsi:* Agent mengirim balasan. Update status tiket jadi CLOSED (opsional).  
  * *Body:* `{ message: string, closeTicket?: boolean }`  
  * *Response:* `{ success: true }`

### **C. AI Features (Intelligence)**

* **POST /tickets/:id/generate-draft (RAG FEATURE)**  
  * *Fungsi:* Generate saran balasan berdasarkan pesan customer + Dokumen SOP di Pinecone.  
  * *Body:* `{ contextMessage: string }`  
  * *Response:*  

```json
{  
  "draftReply": "Halo, mohon maaf... (Sesuai SOP)",  
  "sourceDocument": "Refund_Policy.pdf",
  "sourceDocuments": ["Refund_Policy.pdf", "FAQ.pdf"],
  "ragContextUsed": true
}
```

* **POST /tickets/:id/summarize**  
  * *Fungsi:* Jika chat sudah panjang, agent minta ringkasan baru. Summary disimpan ke `aiAnalysis.summary`.  
  * *Response:* `{ summary: "Percakapan membahas tentang..." }`

### **D. Analytics & Knowledge Base (Admin Only)**

* **GET /analytics/stats**  
  * *Guard:* Admin Only (menggunakan `RolesGuard` + `@AdminOnly()` decorator). Return 403 Forbidden jika bukan admin.  
  * *Response:*  

```json
{  
  "totalTickets": 100,
  "openTickets": 45,
  "closedTickets": 55,
  "avgUrgencyScore": 6.5,
  "sentimentStats": { "positive": 20, "negative": 50, "neutral": 30 },
  "topCategories": [
    { "category": "Technical Issue", "count": 40 },
    { "category": "Billing Issue", "count": 25 }
  ]
}
```

* **POST /knowledge-base/upload**  
  * *Guard:* Admin Only.  
  * *Body:* FormData dengan field `file` (PDF, max 10MB).  
  * *Process:* Parse PDF → Split Chunks → Embedding Gemini → Upsert Pinecone.  
  * *Response:* `{ status: "indexed", chunks: 15, filename: "SOP.pdf" }`  
* **GET /knowledge-base**  
  * *Guard:* Admin Only.  
  * *Fungsi:* List dokumen yang sudah di-upload.  
  * *Response:* `[ { id, filename, uploadedAt, chunksCount, status }, ... ]`
* **DELETE /knowledge-base/:id**  
  * *Guard:* Admin Only.  
  * *Fungsi:* Hapus dokumen dari Firestore dan vectors dari Pinecone.  
  * *Response:* `{ success: true }`

---

## **7\. Development Workflow (Separated Tracks)**

Agar kolaborasi rapi dan memenuhi kriteria evaluasi19, Frontend dan Backend bekerja secara paralel di *track* masing-masing.

### **🛠️ Backend Track (NestJS)**

**Minggu 1: Foundation**

1. Init NestJS project & Repo setup.  
2. Setup Firebase Admin SDK & Firestore connection.  
3. Implement AuthGuard (Middleware validasi token).  
4. Implement CRUD TicketsController (GET list, GET detail, POST reply).

**Minggu 2: AI Intelligence**

1. Integrasi Gemini SDK.  
2. Buat logic AiService untuk klasifikasi otomatis saat tiket dibuat (POST /api/tickets).  
3. Implement endpoint Analytics (Agregasi data Firestore).

**Minggu 3: RAG Implementation (Complex)**

1. Setup Pinecone Vector DB.  
2. Implement endpoint upload (PDF parsing \+ Vectorizing).  
3. Implement logic generate-draft (Query Pinecone \+ Gemini Generation).  
4. API Documentation (Swagger/Postman) finalization.

---

### **🎨 Frontend Track (Next.js)**

**Minggu 1: UI & Auth**

1. Init Next.js \+ Shadcn UI \+ Tailwind.  
2. Buat Halaman Login & Integrasi Firebase Client Auth (Google Login).  
3. Buat Layout Dashboard (Sidebar, Header).  
4. Buat Halaman /demo-chat (Simulasi Customer).

**Minggu 2: Inbox & Workspace**

1. Fetch data ke GET /api/tickets dan tampilkan di Inbox.  
2. Buat tampilan Detail Tiket (Chat Bubble UI).  
3. Integrasi tombol "Send Reply" ke API Backend.  
4. Tampilkan label Sentimen & Kategori (Badge UI) dari data API.

**Minggu 3: AI Interaction & Admin**

1. Integrasi tombol "✨ Generate Draft" (Loading state saat Backend mikir).  
2. Buat Halaman Analytics (Pakai library chart, misal Recharts).  
3. Buat Halaman Upload Knowledge Base (Drag & drop zone).  
4. Proteksi Route (Redirect user non-admin jika akses Analytics).

