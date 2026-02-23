# ShieldAgent Deployment Guide

## 🎯 Current Status
- ✅ Backend built successfully (TypeScript → JavaScript)
- ✅ Frontend built successfully (React production build)
- ✅ Local testing passed (all 3 agents functional)
- ⏳ Awaiting cloud deployment

## 🧪 Local Testing Results
```bash
✓ GET /api/health → 200 OK
✓ GET /api/status → All agents online
✓ POST /api/analyze → Threat Detection working
✓ POST /api/analyze → Privacy Shield working (PII detection)
✓ POST /api/analyze → Compliance Agent working (GDPR/CCPA/SOC2)
```

---

## 🚀 Deployment Options

### Option 1: Azure Static Web Apps + Azure Functions (RECOMMENDED)

**Prerequisites:**
- Azure account (free tier works)
- GitHub account (already set up: decentrathai/shieldagent)

**Steps:**

1. **Install Azure CLI** (if not already installed):
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

2. **Login to Azure**:
```bash
az login
```

3. **Create Resource Group**:
```bash
az group create --name shieldagent-rg --location eastus
```

4. **Deploy using Bicep template**:
```bash
cd /home/moltbot/clawd/hackathons/microsoft-ai/shieldagent/azure-deploy
az deployment group create \
  --resource-group shieldagent-rg \
  --template-file deploy.bicep \
  --parameters appName=shieldagent
```

5. **Deploy application code**:
```bash
cd /home/moltbot/clawd/hackathons/microsoft-ai/shieldagent
npm install -g azure-functions-core-tools@4
func azure functionapp publish shieldagent-func-prod
```

6. **Get deployment URL**:
```bash
az staticwebapp show --name shieldagent-static --resource-group shieldagent-rg --query "defaultHostname" -o tsv
```

**Expected URL:** `https://shieldagent-static.azurestaticapps.net`

---

### Option 2: Render.com (IMMEDIATE DEPLOYMENT)

**Why Render:**
- ✅ No credit card required for free tier
- ✅ Deploy directly from GitHub
- ✅ Supports Node.js + React
- ✅ Automatic HTTPS
- ✅ Good for hackathon demos

**Steps:**

1. **Sign up at Render.com** with GitHub account (decentrathai)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `decentrathai/shieldagent`
   - Render will auto-detect `render.yaml` config

3. **Or manually configure**:
   - **Name:** shieldagent
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build && cd frontend && npm install && npm run build && cd ..`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Wait 3-5 minutes for deployment**

5. **Expected URL:** `https://shieldagent.onrender.com`

**Test the deployment:**
```bash
curl https://shieldagent.onrender.com/api/health
curl https://shieldagent.onrender.com/api/status
```

---

### Option 3: Railway.app

**Steps:**

1. **Sign up at Railway.app** with GitHub

2. **New Project → Deploy from GitHub**:
   - Select `decentrathai/shieldagent`
   - Railway auto-detects Node.js

3. **Environment Variables** (optional):
   - `PORT=3000`
   - `NODE_ENV=production`

4. **Expected URL:** `https://shieldagent-production.up.railway.app`

---

### Option 4: Azure App Service (Alternative Azure Option)

**Steps:**

1. **Create App Service**:
```bash
az webapp up --name shieldagent --resource-group shieldagent-rg --runtime "NODE|20-lts"
```

2. **Deploy code**:
```bash
cd /home/moltbot/clawd/hackathons/microsoft-ai/shieldagent
zip -r deploy.zip . -x "*.git*" "node_modules/*" "frontend/node_modules/*"
az webapp deployment source config-zip --resource-group shieldagent-rg --name shieldagent --src deploy.zip
```

3. **Expected URL:** `https://shieldagent.azurewebsites.net`

---

## 🔧 Troubleshooting

### Issue: Azure CLI not installed
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

### Issue: No Azure subscription
- Sign up at portal.azure.com
- Free tier: $200 credit for 30 days
- No credit card for free services

### Issue: Build fails
```bash
cd /home/moltbot/clawd/hackathons/microsoft-ai/shieldagent
npm install
npm run build
cd frontend && npm install && npm run build
```

### Issue: Port conflicts
- Change PORT in .env
- Or use environment variable: `PORT=3001 npm start`

---

## 📋 Post-Deployment Checklist

- [ ] Test `/api/health` endpoint
- [ ] Test `/api/status` endpoint
- [ ] Test `/api/message/analyze` with sample data
- [ ] Verify frontend loads
- [ ] Test WebSocket connection
- [ ] Check all 3 agents respond
- [ ] Update README.md with live URL
- [ ] Take screenshot for hackathon submission

---

## 🎯 Recommended: Deploy to Render Tonight

**Render is the fastest path to a working demo:**

1. Go to https://render.com
2. Sign up with GitHub (decentrathai account)
3. New Web Service → Connect `decentrathai/shieldagent`
4. Click "Create Web Service"
5. Wait 3-5 minutes
6. Get public URL: `https://shieldagent.onrender.com`

**Then deploy to Azure when you have access:**
- Follow Option 1 steps above
- Update README with Azure URL
- Both deployments can coexist

---

## 📊 Test Commands

Once deployed, test with:

```bash
# Replace with your actual URL
DEPLOY_URL="https://shieldagent.onrender.com"

# Health check
curl $DEPLOY_URL/api/health

# System status
curl $DEPLOY_URL/api/status

# Analyze a message with PII
curl -X POST $DEPLOY_URL/api/message/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My email is john@example.com and my SSN is 123-45-6789",
    "metadata": {"sender": "test-user"}
  }'

# Encrypt a message
curl -X POST $DEPLOY_URL/api/message/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a private message",
    "metadata": {"sender": "user1"}
  }'
```

---

## 🔗 Resources

- **GitHub Repo:** https://github.com/decentrathai/shieldagent
- **Azure Portal:** https://portal.azure.com
- **Render Dashboard:** https://dashboard.render.com
- **Railway Dashboard:** https://railway.app/dashboard

---

**Last Updated:** 2026-02-23 20:49 UTC
**Built By:** OpenClaw Subagent for Microsoft AI Dev Days Hackathon
