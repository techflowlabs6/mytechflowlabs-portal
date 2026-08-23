# ⚡ MyTechFlow Labs (mytechflowlabs.com)

An ultra-modern, high-performance 3D homepage and applications launcher hub for **MyTechFlow Labs**. Built with React, Three.js, WebGL shaders, Lucide Icons, and Supabase PostgreSQL with Row-Level Security (RLS).

---

## 🚀 Live Features

1. **Interactive 3D WebGL Hero**:
   - High-performance Three.js particle core, orbital torus rings, and responsive mouse/touch coordinate physics at 60 FPS.
   - 3D Tilt perspective cards with dynamic holographic specular glare reflections.

2. **Apps Ecosystem & Dashboard**:
   - Shortcuts & interactive launchers for your core applications:
     - 📘 **French Learner AI** (`https://french-learner.mytechflowlabs.com`)
     - ⏱️ **TimeLog Pro** (`https://timelog.mytechflowlabs.com`)
     - 🎓 **TCF Preparation Suite** (`https://tcf.mytechflowlabs.com`)
     - 💵 **Driver Earnings Tracker** (`https://driver-earnings.mytechflowlabs.com`)
     - 🤖 **TechFlow AI Studio** (`https://ai.mytechflowlabs.com`)
     - 📊 **CloudOps Monitor** (`https://cloudops.mytechflowlabs.com`)
   - Instant search with keyboard hotkey `/`, category filters (Education, Productivity, Finance, AI, DevOps), and 3D Card / List view switcher.

3. **SuperAdmin Management Portal (`nrkb1998@gmail.com`)**:
   - Secure login via Supabase Auth or Quick Admin Access for `nrkb1998@gmail.com`.
   - Full CRUD capabilities:
     - **Add New App**: Configure app address URL, title, description, category, tags, screenshot presets, and key features.
     - **Edit Existing Apps**: Update details, change status (Live/Beta/In Dev), or toggle featured pin.
     - **Delete Apps**: Delete with safety confirmation dialog.
   - Public visitors receive a sleek, read-only experience.

4. **Skills & Engineering Matrix**:
   - Interactive domain tabs (Frontend & 3D Web, Backend & Cloud, AI & Automation, Mobile & PWA) with animated mastery gauges.

5. **Work Showcase Gallery**:
   - Fullscreen modal lightbox to inspect real UI screenshots, metrics, and workflow captures.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase Setup (Optional but Recommended)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the script located at `supabase/schema.sql`.
3. Copy your project URL and anon public key into `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAIL=nrkb1998@gmail.com
```
*Note: If no Supabase credentials are provided, the app automatically runs seamlessly using resilient LocalStorage fallback with pre-seeded data.*

---

## 🌐 Deployment to Vercel & GitHub

### Deploy to GitHub:
```bash
git init
git add .
git commit -m "feat: initial release of MyTechFlow Labs 3D portal"
git branch -M main
git remote add origin https://github.com/your-username/mytechflowlabs.git
git push -u origin main
```

### Deploy to Vercel:
1. Import your GitHub repository on [Vercel](https://vercel.com).
2. In the Environment Variables section, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (if using Supabase).
3. Click **Deploy**. Vercel will automatically configure routing via `vercel.json`.

---

© 2026 MyTechFlow Labs. Designed & Engineered by Naveen Reddy (`nrkb1998@gmail.com`).
