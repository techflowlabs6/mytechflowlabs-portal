# ⚡ MyTechFlow Labs Portal (`mytechflowlabs.com`)

An ultra-modern, high-performance central applications launcher and developer dashboard for **MyTechFlow Labs**. Built with React 19, Vite, Three.js WebGL graphics, Tailwind CSS, Supabase PostgreSQL, and Cloud Native DevOps (Docker + Kubernetes).

---

## 🌐 Live Deployed Applications Matrix

All production applications deployed across custom subdomains under `mytechflowlabs.com` backed by high-availability edge nodes:

| Subdomain Domain | CNAME Edge Target | Application Name | Category | Primary Stack |
| :--- | :--- | :--- | :--- | :--- |
| [`french.mytechflowlabs.com`](https://french.mytechflowlabs.com) | `francais-decode-git-main-techflow2.vercel.app` | **French Learner App / Français Décode** | Education | React, Speech AI, Audio Decks |
| [`timelog.mytechflowlabs.com`](https://timelog.mytechflowlabs.com) | `time-log-mocha.vercel.app` | **TimeLog Pro** | Productivity | React, Chart.js, Pomodoro, Supabase |
| [`tcf.mytechflowlabs.com`](https://tcf.mytechflowlabs.com) | `french-grammar-mastery.vercel.app` | **TCF Preparation Suite** | Education | React, Timed Exam Engine, Audio |
| [`driver.mytechflowlabs.com`](https://driver.mytechflowlabs.com) | `driver-earnings-tracker.vercel.app` | **Driver Earnings Tracker** | Finance | React, PWA, Financial Analytics |
| [`lostrun.mytechflowlabs.com`](https://lostrun.mytechflowlabs.com) | `run-lost-frontier.vercel.app` | **Lost Frontier 3D Runner** | 3D Games & Arcade | Three.js, WebGL, Procedural World |
| [`neon.mytechflowlabs.com`](https://neon.mytechflowlabs.com) | `neon-dodge-rush.vercel.app` | **Neon Dodge Rush** | 3D Games & Arcade | HTML5 Canvas, Synthwave, Particles |
| [`reflex.mytechflowlabs.com`](https://reflex.mytechflowlabs.com) | `reflex-rush-jfl4.vercel.app` | **Reflex Rush** | 3D Games & Arcade | Microsecond Timers, Analytics |
| [`smashhit.mytechflowlabs.com`](https://smashhit.mytechflowlabs.com) | `smashhit.vercel.app` | **Smash Hit 3D** | 3D Games & Arcade | Three.js, Voronoi Physics, Spatial Audio |
| [`www.mytechflowlabs.com`](https://www.mytechflowlabs.com) | `mytechflowlabs-portal-roan.vercel.app` | **MyTechFlow Labs Central Portal** | Main Hub | React 19, Vite, Docker, K8s |

---

## 🚀 Core Features

1. **Interactive Applications Hub**:
   - One-click shortcuts to launch all 8 live production applications.
   - Real-time search by keywords (e.g., *Runner*, *French*, *TimeLog*, *Dodge*, *Driver*).
   - Category filtering (*Education*, *Productivity*, *Finance*, *3D Games & Arcade*).
   - Responsive dark-mode card grid with smooth hover transitions and category badges.

2. **Direct Inquiries & Support**:
   - One-click direct email launcher connected to `techflowlabs6@gmail.com`.

3. **SuperAdmin Management Portal**:
   - Secure admin authentication for `techflowlabs6@gmail.com`.
   - Full CRUD capability:
     - **Add New App**: Configure app address URL, title, short note, description, category, and screenshot image.
     - **Edit Existing Apps**: Update app URLs, descriptions, or categories in real-time.
     - **Delete Apps**: Delete with safety confirmation dialog.
     - **Restore Defaults**: One-click restore to the canonical 8 production apps.

4. **Cloud Native DevOps & Containerization**:
   - Multi-stage production `Dockerfile` with Node 22 builder and Nginx Alpine SPA web server.
   - `docker-compose.yml` for local container testing.
   - Full Kubernetes manifests (`k8s/deployment.yaml`, `service.yaml`, `ingress.yaml`, `configmap.yaml`, `hpa.yaml`, `kustomization.yaml`).

---

## 🛠️ Quickstart & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build Production Bundle
```bash
npm run build
```
Compiled static assets are generated in `dist/`.

---

## 🐳 Docker Deployment

### Build & Run Container
```bash
# Build the Docker image
docker build -t mytechflowlabs-portal:latest .

# Run container on port 8080
docker run -d -p 8080:80 --name mytechflowlabs-portal mytechflowlabs-portal:latest
```
Access the application at `http://localhost:8080`.

### Using Docker Compose
```bash
# Start container with health checks
docker compose up -d --build

# View logs
docker compose logs -f

# Stop container
docker compose down
```

---

## ☸️ Kubernetes (K8s) Cluster Deployment

Deploy the portal to your Kubernetes cluster with automated TLS and horizontal pod autoscaling:

```bash
# Apply all Kubernetes manifests via Kustomize
kubectl apply -k k8s/

# Or apply individual manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Verify pod rollout status
kubectl rollout status deployment/mytechflowlabs-portal

# Check horizontal pod autoscaler
kubectl get hpa mytechflowlabs-portal-hpa
```

---

## 🌐 Vercel Edge Deployment

1. Push your repository changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: update portal with 8 deployed apps and devops manifests"
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com), verify your project is connected to `mytechflowlabs-portal`.
3. Vercel automatically deploys the updated bundle with custom domain routing configured in `vercel.json`.

---

## 📄 Documentation Links

- 📘 [Developer Guide (`DEV_GUIDE.md`)](DEV_GUIDE.md) - Architecture, components, and state management.
- 🚀 [Deployment Playbook (`DEPLOYMENT.md`)](DEPLOYMENT.md) - DNS configuration, SSL, Docker, and Kubernetes deployment.

---

© 2026 MyTechFlow Labs (`mytechflowlabs.com`). Maintained by TechFlow Labs (`techflowlabs6@gmail.com`).
