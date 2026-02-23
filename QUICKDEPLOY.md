# 🚀 Quick Deploy - ShieldAgent

## ⚡ Fastest Deployment (5 minutes)

### Option 1: Render.com (Recommended - No Credit Card Required)

**Steps:**

1. **Go to:** https://dashboard.render.com/register
2. **Sign in with GitHub** (use decentrathai account)
3. **Click "New +" → "Web Service"**
4. **Connect Repository:** `decentrathai/shieldagent`
5. **Render auto-detects configuration** from `render.yaml`
6. **Click "Create Web Service"**
7. **Wait 3-5 minutes** for deployment
8. **Your app will be live at:** `https://shieldagent.onrender.com`

**That's it!** The app is deployed and ready for the hackathon.

---

### Option 2: Railway.app (Alternative)

**Deploy with one click:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/shieldagent?referralCode=decentrai)

**Or manually:**

1. **Go to:** https://railway.app/new
2. **Sign in with GitHub** (use decentrathai account)
3. **New Project → Deploy from GitHub repo**
4. **Select:** `decentrathai/shieldagent`
5. **Railway auto-configures** Node.js settings
6. **Click "Deploy"**
7. **Wait 2-3 minutes**
8. **Get your URL from:** Settings → Generate Domain
9. **Your app will be live at:** `https://shieldagent-production.up.railway.app`

---

### Option 3: Vercel (Frontend Only)

If you want to deploy just the frontend:

1. **Go to:** https://vercel.com/new
2. **Import:** `decentrathai/shieldagent`
3. **Root Directory:** `frontend`
4. **Framework:** Create React App
5. **Deploy**

**Note:** This only deploys the React UI. You'll need to deploy the backend separately.

---

## 🧪 Test Your Deployment

Once deployed, test with these commands:

```bash
# Replace with your actual URL
export API_URL="https://shieldagent.onrender.com"

# 1. Health check
curl $API_URL/api/health

# 2. System status
curl $API_URL/api/status

# 3. Analyze a message (PII detection)
curl -X POST $API_URL/api/message/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My email is john@example.com and phone is 555-1234",
    "metadata": {"sender": "test"}
  }'

# 4. Frontend (open in browser)
open $API_URL
```

**Expected Results:**
- ✅ Health: `{"status":"ok","timestamp":"..."}`
- ✅ Status: All 3 agents showing "online"
- ✅ Analyze: Detects email/phone as PII
- ✅ Frontend: React dashboard loads

---

## 🎯 What Gets Deployed

**Backend (Express API):**
- `/api/health` - Health check endpoint
- `/api/status` - System status with agent metrics
- `/api/message/analyze` - Analyze messages for threats/privacy/compliance
- `/api/message/encrypt` - Encrypt messages with ZK proofs
- WebSocket server on same port for real-time updates

**Frontend (React Dashboard):**
- Real-time monitoring dashboard
- Privacy score visualization
- Threat detection alerts
- Compliance violation tracking
- WebSocket connection to backend

**All 3 Agents:**
1. **Threat Detection Agent** - Phishing, malware, metadata leaks
2. **Privacy Shield Agent** - PII detection, encryption, privacy scoring
3. **Compliance Agent** - GDPR, CCPA, HIPAA, SOC2 checks

---

## 🔧 Environment Variables (Optional)

The app works out-of-the-box with defaults. For production:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `production` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI (optional) | - |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key (optional) | - |

Render and Railway will auto-set `PORT` and `NODE_ENV`.

---

## 📊 Deployment Status

- ✅ **Code:** Pushed to GitHub
- ✅ **Backend:** Built successfully
- ✅ **Frontend:** Built successfully  
- ✅ **Tests:** All agents working locally
- ⏳ **Cloud:** Awaiting deployment
- ⏳ **URL:** TBD

---

## 🎉 After Deployment

1. **Update README.md:**
   - Add live demo URL
   - Update "Live Demo" section

2. **Test thoroughly:**
   - All API endpoints
   - Frontend loads correctly
   - WebSocket connection works
   - All 3 agents respond

3. **Take screenshots:**
   - Dashboard in action
   - API responses
   - Agent detections

4. **For hackathon submission:**
   - Include live URL in submission form
   - Mention all 3 agents are functional
   - Highlight real-time WebSocket updates

---

## 🆘 Need Help?

**Issue: Build fails on Render/Railway**
- Check logs in dashboard
- Ensure `package.json` has correct scripts
- Verify `npm run build` works locally

**Issue: Frontend doesn't load**
- Frontend is served from `/` by Express
- Check that `frontend/build` exists in deployment
- Verify Express static middleware is configured

**Issue: API returns 404**
- Check that routes start with `/api/`
- Verify backend is running (check logs)
- Test `/api/health` first

**Issue: WebSocket connection fails**
- WebSocket is on same port as HTTP
- URL format: `ws://your-domain.com` (not `/api/ws`)
- Check browser console for connection errors

---

**Deploy now and get your hackathon demo live!** 🚀

Choose Render for quickest results - it's free, requires no credit card, and deploys in 5 minutes.
