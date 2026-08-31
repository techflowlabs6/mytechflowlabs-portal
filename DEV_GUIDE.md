# 🛠️ MyTechFlow Labs Portal — Developer Guide (`DEV_GUIDE.md`)

This guide provides an in-depth overview of the **MyTechFlow Labs Portal** frontend architecture, state management, container lifecycle, and development workflows.

---

## 🏗️ Architecture & Project Structure

```
mytechflowlabs-portal/
├── .dockerignore              # Exclusions for Docker build context
├── .gitignore                 # Git ignore rules
├── .oxlintrc.json             # High-speed Oxlint linter configuration
├── Dockerfile                 # Multi-stage production container build
├── docker-compose.yml         # Local container orchestration
├── nginx.conf                 # Nginx SPA web server config with gzip & headers
├── package.json               # Dependencies & build scripts
├── vite.config.js             # Vite configuration
├── README.md                  # Main overview & quickstart
├── DEV_GUIDE.md               # Developer architecture & guide (this file)
├── DEPLOYMENT.md              # Production deployment playbook
├── k8s/                       # Kubernetes manifests
│   ├── configmap.yaml         # Environment variables & runtime settings
│   ├── deployment.yaml        # Pod deployment with rolling updates
│   ├── hpa.yaml               # Horizontal pod autoscaler
│   ├── ingress.yaml           # Ingress routing & TLS certificates
│   ├── kustomization.yaml     # Kustomize manifest bundle
│   └── service.yaml           # ClusterIP service
├── public/                    # Static public assets & icons
└── src/                       # React frontend source
    ├── App.jsx                # Main application component & admin controller
    ├── App.css                # Component styling & layout classes
    ├── index.css              # Global design system & theme tokens
    ├── main.jsx               # React 19 root bootstrap
    ├── components/            # Modular UI components (3D, layout, modals)
    └── data/                  # Static seed catalogs & data records
        ├── galleryData.js     # Showcase gallery datasets
        ├── seedApps.js        # Canonical 8 application seed catalog
        └── skillsData.js      # Technical engineering skills metrics
```

---

## ⚡ Data Flow & State Management

### 1. Applications Store (`App.jsx`)
- **Default Catalog (`INITIAL_APPS`)**: Contains the 8 verified production web applications and 3D arcade games.
- **Persistence (`localStorage`)**:
  - Key: `mytechflow_apps_v2`
  - Ensures new applications are automatically populated upon first load while preserving local modifications.
- **Admin Access (`mytechflow_admin_clean`)**:
  - Stores boolean flag whether admin session is active for `techflowlabs6@gmail.com`.

### 2. Search & Category Filters
- **Search Query**: Real-time substring filter checking `name`, `shortNote`, and `description`.
- **Category Filter**: Filters by `All`, `Education`, `Productivity`, `Finance`, or `3D Games & Arcade`.

---

## ➕ Adding New Applications

To programmatically add a new application to the default catalog:

1. Open `src/App.jsx` and locate `INITIAL_APPS`.
2. Append a new object following this interface:
```javascript
{
  id: '9',
  name: 'New App Name',
  shortNote: 'Short tagline for the card',
  url: 'https://newapp.mytechflowlabs.com/',
  imageUrl: 'https://images.unsplash.com/...',
  description: 'Detailed explanation of what the application does.',
  category: 'Productivity' // 'Education' | 'Productivity' | 'Finance' | '3D Games & Arcade'
}
```
3. Update `src/data/seedApps.js` with corresponding tag metadata and features.

---

## 🧪 Testing & Linting

### Run Lint Checks
```bash
npm run lint
```

### Validate Production Build
```bash
npm run build
```

---

## 🔒 Security Best Practices

1. **Email Links**: Uses standard `mailto:` encoding without exposing raw internal secrets.
2. **External Links**: All cards open in new tabs with `rel="noopener noreferrer"` to prevent reverse tabnabbing attacks.
3. **Nginx Hardening**: Includes `X-Frame-Options`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy` headers.
