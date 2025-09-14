# 🚀 Complete V2 Environment Setup

## Current Status: 6/20 Variables Set ✅

**Progress:**
- ✅ Production: 3/10 variables
- ✅ Development: 3/10 variables
- ❌ Missing: 7 critical API keys in each environment

## 🔑 Copy These API Keys from V1 → V2

### From Dashboard to Dashboard (Fastest Method)

**V1 Source**: https://app.netlify.com/sites/techinterviewcoach/configuration/env
**V2 Target**: https://app.netlify.com/sites/techinterviewcoach-v2/configuration/env

### Missing Variables (Production):
```
❌ AIRTABLE_API_KEY         (for survey data storage)
❌ AIRTABLE_BASE_KEY        (for survey data storage)
❌ CALCOM_WEBHOOK_SECRET    (for booking integration)
❌ STRIPE_SECRET_KEY        (for payment processing)
❌ STRIPE_WEBHOOK_SECRET    (for payment webhooks)
❌ LOOPS_API_KEY           (for email automation)
❌ ZAPIER_SECRET_KEY       (for authentication)
```

### Missing Variables (Development):
```
❌ AIRTABLE_API_KEY         (dev environment)
❌ AIRTABLE_BASE_KEY        (dev environment)
❌ CALCOM_WEBHOOK_SECRET    (dev environment)
❌ STRIPE_SECRET_KEY        (dev environment)
❌ STRIPE_WEBHOOK_SECRET    (dev environment)
❌ LOOPS_API_KEY           (dev environment)
❌ ZAPIER_SECRET_KEY       (dev environment)
```

## ✅ Already Set Variables:
- ✅ CALCOM_API_BASE_URL (both contexts)
- ✅ NTFY_SH_URL (both contexts)
- ✅ NTFY_SH_TOPIC (v2-specific: production/development)

## 🎯 After Setup Complete:

Run verification:
```bash
./verify-env-setup.sh
```

Test the full flow:
```
https://techinterviewcoach-v2.netlify.app/get-started
```

## 🔧 Alternative CLI Method (if values were unmasked):
```bash
# Production
netlify env:set AIRTABLE_API_KEY "key..." --context production
netlify env:set AIRTABLE_BASE_KEY "app..." --context production
netlify env:set STRIPE_SECRET_KEY "sk_..." --context production
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_..." --context production
netlify env:set CALCOM_WEBHOOK_SECRET "..." --context production
netlify env:set LOOPS_API_KEY "..." --context production
netlify env:set ZAPIER_SECRET_KEY "..." --context production

# Development (same variables, different values)
netlify env:set AIRTABLE_API_KEY "key..." --context development
# ... etc
```

## 🎉 Success Criteria:
- ✅ 10/10 variables in production
- ✅ 10/10 variables in development
- ✅ Get Started flow works end-to-end
- ✅ Survey responses stored in Airtable
- ✅ Coach matching returns results
- ✅ Free session booking opens Cal.com