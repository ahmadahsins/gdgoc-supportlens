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
  * **AI Integration:** Google Generative AI SDK (Gemini 2.5 Flash)  
  * **Vector Database:** Pinecone (untuk RAG)  
  * **Doc Parsing:** pdf-parse  
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

JSON

{  
  "uid": "firebase\_uid\_string",  
  "email": "alex@company.com",  
  "role": "admin", // atau "agent"  
}

**Collection: tickets**

JSON

{  
  "id": "auto\_generated\_id",  
  "senderName": "Budi Customer",  
  "senderEmail": "budi@gmail.com",  
  "initialMessage": "Aplikasi error saat checkout",  
  "status": "OPEN", // "OPEN" | "CLOSED"  
  "createdAt": Timestamp,  
  "aiAnalysis": {  
    "category": "Technical Issue", //   
    "sentiment": "Negative",       // \[cite: 43\]  
    "urgencyScore": 8,             // Skala 1-10 \[cite: 43\]  
    "summary": "User gagal checkout..." //   
  },  
  "messages": \[ // Sub-collection atau Array of Objects  
    { "sender": "customer", "text": "...", "time": Timestamp },  
    { "sender": "agent", "text": "...", "time": Timestamp }  
  \]  
}

**Vector DB (Pinecone):**

* **Namespace:** sops  
* **Metadata:** { source: "filename.pdf", text: "original text chunk" }

---

## **6\. API Contract (Backend Endpoints)**

Ini adalah kontrak final. Frontend **hanya** boleh mengakses data lewat endpoint ini. Semua endpoint (kecuali Public) wajib menyertakan Header: Authorization: Bearer \<Firebase\_ID\_Token\>.

### **A. Authentication & User**

* **POST /api/auth/sync**  
  * *Fungsi:* Sinkronisasi data user dari Firebase Auth ke Firestore saat login pertama.  
  * *Body:* { role: "agent" } (Default)  
  * *Response:* { status: "synced", user: UserObject }

### **B. Tickets (Operational)**

* **POST /api/tickets (PUBLIC)**  
  * *Fungsi:* Menerima pesan dari halaman /demo-chat. Trigger AI Classification otomatis.  
  * *Body:* { name: string, email: string, message: string }  
  * *Response:* { ticketId: string, ai\_analysis: Object }  
* **GET /api/tickets**  
  * *Fungsi:* Get all tickets untuk Inbox14. Bisa filter via query params.  
  * *Query:* ?status=OPEN  
  * *Response:* \[ { ticket\_summary\_object }, ... \]  
* **GET /api/tickets/:id**  
  * *Fungsi:* Ambil detail lengkap satu tiket beserta history chat15.  
  * *Response:* { id: "...", messages: \[\], aiAnalysis: {} }  
* **POST /api/tickets/:id/reply**  
  * *Fungsi:* Agent mengirim balasan. Update status tiket jadi CLOSED (opsional).  
  * *Body:* { message: string, closeTicket: boolean }  
  * *Response:* { success: true }

### **C. AI Features (Intelligence)**

* **POST /api/tickets/:id/generate-draft (RAG FEATURE)**  
  * *Fungsi:* Generate saran balasan berdasarkan pesan customer \+ Dokumen SOP di Pinecone16.  
  * *Body:* { contextMessage: string }  
  * *Response:*  
  * JSON

{  
  "draftReply": "Halo, mohon maaf... (Sesuai SOP)",  
  "sourceDocument": "Refund\_Policy.pdf"  
}

*   
  *   
* **POST /api/tickets/:id/summarize**  
  * *Fungsi:* Jika chat sudah panjang, agent minta ringkasan baru17.  
  * *Response:* { summary: "Percakapan membahas tentang..." }

### **D. Analytics & Knowledge Base (Admin Only)**

* **GET /api/analytics/stats**  
  * *Guard:* Cek jika role user \!= 'admin', return 403 Forbidden.  
  * *Response:* { sentimentParams: { positive: 10, negative: 5 }, topCategories: \[\] } 18  
* **POST /api/knowledge-base/upload**  
  * *Guard:* Admin Only.  
  * *Body:* FormData (File PDF).  
  * *Process:* Parse PDF \-\> Embedding Gemini \-\> Upsert Pinecone.  
  * *Response:* { status: "indexed", chunks: 15 }  
* **GET /api/knowledge-base**  
  * *Fungsi:* List dokumen yang sudah di-upload.

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

