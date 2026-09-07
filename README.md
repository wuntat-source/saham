# EduTradeX V2 — AI-Powered Virtual Stock Market Simulator & Learning Platform

EduTradeX V2 adalah platform edukasi pasar modal Indonesia (BEI/IDX) interaktif generasi terbaru yang menggabungkan simulasi perdagangan saham virtual, analisis AI multi-metodologi, TradingView-style interactive charting, Quant Lab, dan Classroom Intelligence.

---

## 🌟 Fitur Utama

### 1. 📈 Virtual Trading Simulator & Atomic Wallet (Fase 1)
* Simulasi eksekusi order instan (Market & Limit Order) dengan mekanisme *tick size*, lot multiplier (1 lot = 100 lembar), dan biaya broker.
* Dompet virtual atomik (*Atomic Wallet*) dengan saldo awal default Rp 100.000.000.
* Order Book real-time (Bids, Asks, Spread, Last Price).

### 2. 🧠 15-Pillar AI Stock Intelligence & Screener (Fase 2)
* Mesin kalkulasi deterministik 0–100 untuk Fundamental, Teknikal, Valuasi, Smart Money (Bandarologi), Sentimen, dan Manajemen Risiko.
* AI Stock Screener multi-emiten dengan perankingan Top 10 IDX.

### 3. 🌐 Advanced Market Regime, Sector Rotation & Catalysts Radar (Fase 3)
* Klasifikasi rezim pasar otomatis (*BULLISH*, *SIDEWAYS*, *BEARISH*, *HIGH VOLATILITY*).
* Heatmap sektor & analisis kekuatan relatif (*Relative Strength* vs IHSG).
* Radar deteksi anomali volume & kalender katalis 3–12 bulan ke depan.

### 4. 👨‍🏫 AI Mentor, Trading Journal & Review Socratic (Fase 4)
* Jurnal trading terstruktur (*Pre-trade Thesis* & *Post-trade Review*).
* Evaluasi kualitas keputusan, waktu masuk (*timing*), manajemen risiko, dan hasil.
* Asisten AI Socratic Tutor untuk membimbing pola pikir analitis siswa.

### 5. 🔬 Quant Lab & Walk-Forward Backtesting (Fase 5)
* Rule-based Strategy Builder (kondisi AND/OR indikator teknikal & fundamental).
* Backtesting engine historis dengan metrik Sharpe, Sortino, Win Rate, CAGR, Max Drawdown, dan Overfitting Checks.

### 6. 🏫 Classroom Intelligence & School Platform (Fase 6)
* Segmentasi profil perilaku belajar (*Analyst, Trader, Risk Taker, Conservative, Beginner*).
* Leaderboard pedagogis multi-kategori (bukan hanya mencari profit mentah).
* AI Assignment Evaluator untuk penilaian esai dan riset studi kasus saham.

### 7. 🏛️ AI Investment Lens (Multi-Methodology Institutional Analysis)
* 6 Lensa analisis profesional:
  1. 🏛️ **Institutional / Risk-Adjusted**
  2. 🏦 **Long-Term Quality & Valuation**
  3. 📈 **Fundamental Growth**
  4. 🌐 **Macro + Fundamental + Catalyst**
  5. 💼 **Earnings & Market Expectations**
  6. ⚡ **Quality Compounder (5-Year Shareholder Return Model)**
* **Consensus Lens & Disagreement Detector** lintas metodologi.

### 8. 🎨 TradingView-Style Interactive Charting & Drawing Tools
* Bilah alat gambar interaktif: *Cursor / Crosshair*, *Trendline*, *Horizontal Support/Resistance*, *Fibonacci Retracement*, *Rectangle Zone Box*, *Brush*, *Text Annotation*, dan *Measure Tool (Ruler)*.
* Indikator teknikal: **MA 9**, **MA 20**, **EMA 50**, **SMA 200**, **Bollinger Bands**, **RSI (14)**, dan **MACD (12, 26, 9)**.
* Dukungan **Tema Terang (*Light Mode*)** dan **Tema Gelap (*Dark Mode*)** dengan auto-save per kode saham di *localStorage*.

---

## 🔑 Akun Demo Bawaan

| Akun | Username / Email | Password | Role | Saldo Virtual |
|---|---|---|---|---|
| **Siswa 1** | `pidi` *(atau `pidi@edutradex.com`)* | `pidi123` | Student | Rp 100.000.000 |
| **Siswa 2** | `bampri` *(atau `bampri@edutradex.com`)* | `bampri123` | Student | Rp 100.000.000 |
| **Siswa 3** | `siswa1@edutradex.id` | `siswa123` | Student | Rp 65.648.550 |
| **Guru** | `guru@edutradex.id` | `guru123` | Teacher | - |

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Clone Repositori
```bash
git clone https://github.com/wuntat-source/saham.git
cd saham
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment & Database
Salin `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Generate Prisma Client & Inisialisasi Database:
```bash
npx prisma generate
npx prisma db push
npx tsx scripts/create-user.ts
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**.

---

## 🧪 Menjalankan Automated Test Suites

Proyek ini dilengkapi dengan 7 rangkaian pengujian otomatis (252 tes):

```bash
# Uji seluruh modul AI Investment Lens
npx tsx tests/investment-lens-tests.ts

# Uji Fase 1 - 6
npx tsx tests/phase1-tests.ts
npx tsx tests/phase2-tests.ts
npx tsx tests/phase3-tests.ts
npx tests/phase4-tests.ts
npx tests/phase5-tests.ts
npx tests/phase6-tests.ts
```

---

## 🛠️ Tech Stack
* **Framework**: Next.js (App Router, Turbopack) & React
* **Language**: TypeScript
* **Database & ORM**: SQLite & Prisma ORM
* **Styling**: Tailwind CSS & Lucide Icons
* **Charting**: HTML5 Canvas with High-DPI support
