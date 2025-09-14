# 🚀 V2 Environment Variable Setup

## ✅ Current Status
- **V1 Variables**: ✅ All 20 variables safe and intact
- **V2 Variables**: ✅ 3 basic variables set (CALCOM_API_BASE_URL, NTFY_SH_URL, NTFY_SH_TOPIC)

## 🔑 Required API Keys (Copy from V1 → V2)

### Critical Variables for Get Started Flow

You need to copy these **exact values** from V1 to V2:

#### 1. **Airtable** (Database for survey responses)
```
AIRTABLE_API_KEY=key************************
AIRTABLE_BASE_KEY=app************************
```

#### 2. **Stripe** (Payment processing)
```
STRIPE_SECRET_KEY=sk_live_************************
STRIPE_WEBHOOK_SECRET=whsec_************************
```

#### 3. **Cal.com** (Booking integration)
```
CALCOM_WEBHOOK_SECRET=************************
```

#### 4. **Loops** (Email automation)
```
LOOPS_API_KEY=************************
```

#### 5. **Security** (Authentication)
```
ZAPIER_SECRET_KEY=************************
```

## 📋 How to Copy Variables

### Method 1: Netlify Dashboard (Recommended)
1. **V1 Dashboard**: https://app.netlify.com/sites/techinterviewcoach/configuration/env
2. **V2 Dashboard**: https://app.netlify.com/sites/techinterviewcoach-v2/configuration/env
3. Copy each value from V1 → paste into V2

### Method 2: CLI Commands (if CLI works)
```bash
# Production
netlify env:set AIRTABLE_API_KEY "VALUE_FROM_V1" --context production
netlify env:set AIRTABLE_BASE_KEY "VALUE_FROM_V1" --context production
netlify env:set STRIPE_SECRET_KEY "VALUE_FROM_V1" --context production
netlify env:set STRIPE_WEBHOOK_SECRET "VALUE_FROM_V1" --context production
netlify env:set CALCOM_WEBHOOK_SECRET "VALUE_FROM_V1" --context production
netlify env:set LOOPS_API_KEY "VALUE_FROM_V1" --context production
netlify env:set ZAPIER_SECRET_KEY "VALUE_FROM_V1" --context production
```

## 🧪 Testing

Once variables are set, test the complete flow:

1. **Visit**: https://techinterviewcoach-v2.netlify.app/get-started
2. **Complete Survey**: Fill out the 2-minute form
3. **Check Functions**: Look for successful API calls in Netlify function logs
4. **Verify Data**: Check Airtable for new survey responses
5. **Test Booking**: Try booking a free session

## 🔍 Debugging

### Function Logs
- **V2 Function Logs**: https://app.netlify.com/sites/techinterviewcoach-v2/functions
- Look for errors in `process-survey` and `book-free-session` functions

### Common Issues
- **Missing AIRTABLE_API_KEY**: Survey submission will fail
- **Missing STRIPE_SECRET_KEY**: Payment flow won't work
- **Missing CALCOM_WEBHOOK_SECRET**: Booking integration will fail

## ✅ Success Criteria

When everything works:
1. ✅ Survey submits successfully
2. ✅ Coach matching algorithm returns 5 coaches
3. ✅ Coach selection works
4. ✅ Free session booking opens Cal.com
5. ✅ Data appears in V1 Airtable
6. ✅ No function errors in logs

## 🛟 Safety Check

**V1 is safe**: All original environment variables remain intact. V2 setup cannot affect V1.