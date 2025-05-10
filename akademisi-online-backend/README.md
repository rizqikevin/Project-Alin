# Akademisi Online Backend

Backend REST API untuk Akademisi Online Platform

## Stack
- Express.js
- MongoDB + Mongoose
- JWT Auth
- bcrypt

## Setup
1. `npm install`
2. Buat file `.env` dan isi:
   - `MONGO_URI=mongodb://localhost:27017/akademisi_online`
   - `JWT_SECRET=supersecretkey`
   - `PORT=5000`
3. Jalankan development: `npm run dev`

## Fitur Utama
- Autentikasi (register, login, JWT)
- CRUD Soal (Questions)
- CRUD Ujian (Exams)
- Submit & Lihat Hasil Ujian 