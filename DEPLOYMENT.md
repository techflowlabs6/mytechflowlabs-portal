# 🚀 MyTechFlow Labs Portal — Production Deployment Playbook (`DEPLOYMENT.md`)

This playbook provides end-to-end instructions for deploying, updating, and maintaining **MyTechFlow Labs Portal** across DNS providers, Vercel Edge, Docker containers, and Kubernetes clusters.

---

## 🌐 DNS & Custom Subdomain Configuration

To route all subdomains correctly to their Vercel endpoints, configure the following **CNAME** records in your DNS management console (e.g. Cloudflare, GoDaddy, Namecheap):

| Host / Subdomain | Type | Target Value | TTL | Status |
| :--- | :--- | :--- | :--- | :--- |
| `driver` | `CNAME` | `driver-earnings-tracker.vercel.app` | Auto / 3600 | Active |
| `french` | `CNAME` | `francais-decode-git-main-techflow2.vercel.app` | Auto / 3600 | Active |
| `lostrun` | `CNAME` | `run-lost-frontier.vercel.app` | Auto / 3600 | Active |
| `neon` | `CNAME` | `neon-dodge-rush.vercel.app` | Auto / 3600 | Active |
| `reflex` | `CNAME` | `reflex-rush-jfl4.vercel.app` | Auto / 3600 | Active |
| `smashhit` | `CNAME` | `smashhit.vercel.app` | Auto / 3600 | Active |
| `tcf` | `CNAME` | `french-grammar-mastery.vercel.app` | Auto / 3600 | Active |
| `timelog` | `CNAME` | `time-log-mocha.vercel.app` | Auto / 3600 | Active |
| `www` | `CNAME` | `mytechflowlabs-portal-roan.vercel.app` | Auto / 3600 | Active |

---

## ⚡ Deployment Method 1: Vercel Edge (Recommended for SPA)

### 1. Push to GitHub
```bash
git add .
git commit -m "chore: release stable latest portal update"
git push origin main
```

### 2. Automatic Vercel CI/CD
Vercel is configured with zero-config deployment. Once pushed:
- Static build output is processed from `dist/` via `npm run build`.
- Custom headers and clean routing rules are applied from `vercel.json`.
- SSL certificates are automatically provisioned and renewed via Let's Encrypt.

---

## 🐳 Deployment Method 2: Docker Container

### 1. Multi-Stage Container Build
```bash
docker build -t techflowlabs/portal:latest .
```

### 2. Run Container with Port Forwarding
```bash
docker run -d \
  --name mytechflowlabs-portal \
  -p 80:80 \
  --restart unless-stopped \
  techflowlabs/portal:latest
```

### 3. Verification & Health Check
```bash
# Check container status
docker ps -f name=mytechflowlabs-portal

# Test health check endpoint
curl -i http://localhost/healthz
```

---

## ☸️ Deployment Method 3: Kubernetes (K8s) Cluster

### 1. Prerequisites
- Configured Kubernetes cluster (v1.26+)
- `kubectl` configured with cluster admin context
- NGINX Ingress Controller installed
- Cert-Manager installed (for automated TLS certificates)

### 2. Apply Manifests
```bash
# Deploy all resources using Kustomize
kubectl apply -k k8s/
```

### 3. Inspect Pods & Service
```bash
# Check deployment rollout
kubectl get deployments -l app=mytechflowlabs-portal

# Check pod logs
kubectl logs -l app=mytechflowlabs-portal --tail=50 -f

# Check Ingress host and TLS certificates
kubectl get ingress mytechflowlabs-portal-ingress
```

### 4. Horizontal Pod Autoscaler (HPA)
The HPA will automatically adjust pod replicas based on incoming traffic:
- **Min Replicas**: 2
- **Max Replicas**: 10
- **CPU Threshold**: 70%
- **Memory Threshold**: 80%

---

## 🔄 Zero-Downtime Rollouts & Rollbacks

### Rollout a New Container Version
```bash
kubectl set image deployment/mytechflowlabs-portal portal=techflowlabs/portal:v2.1.0
kubectl rollout status deployment/mytechflowlabs-portal
```

### Rollback if Needed
```bash
kubectl rollout undo deployment/mytechflowlabs-portal
```
