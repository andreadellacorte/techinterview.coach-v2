#!/bin/bash

# Environment variable setup commands for v2 Get Started flow
# You'll need to replace the actual values from the v1 Netlify dashboard

cd /data/data/com.termux/files/home/tic/techinterview.coach-v2

echo "🚀 Setting up environment variables for techinterviewcoach-v2..."
echo "⚠️  Replace 'YOUR_VALUE_HERE' with actual values from v1 dashboard"
echo ""

# Essential variables for the Get Started functions to work
ENV_COMMANDS=(
  "netlify env:set AIRTABLE_API_KEY \"YOUR_AIRTABLE_API_KEY_HERE\" --context production"
  "netlify env:set AIRTABLE_BASE_KEY \"YOUR_AIRTABLE_BASE_KEY_HERE\" --context production"
  "netlify env:set CALCOM_API_BASE_URL \"https://api.cal.com/v2\" --context production"
  "netlify env:set CALCOM_WEBHOOK_SECRET \"YOUR_CALCOM_WEBHOOK_SECRET_HERE\" --context production"
  "netlify env:set STRIPE_SECRET_KEY \"YOUR_STRIPE_SECRET_KEY_HERE\" --context production"
  "netlify env:set STRIPE_WEBHOOK_SECRET \"YOUR_STRIPE_WEBHOOK_SECRET_HERE\" --context production"
  "netlify env:set LOOPS_API_KEY \"YOUR_LOOPS_API_KEY_HERE\" --context production"
  "netlify env:set NTFY_SH_TOPIC \"techinterview-coach-v2-production\" --context production"
  "netlify env:set NTFY_SH_URL \"https://ntfy.sh\" --context production"
  "netlify env:set ZAPIER_SECRET_KEY \"YOUR_ZAPIER_SECRET_KEY_HERE\" --context production"
)

# Same for development
DEV_ENV_COMMANDS=(
  "netlify env:set AIRTABLE_API_KEY \"YOUR_DEV_AIRTABLE_API_KEY_HERE\" --context development"
  "netlify env:set AIRTABLE_BASE_KEY \"YOUR_DEV_AIRTABLE_BASE_KEY_HERE\" --context development"
  "netlify env:set CALCOM_API_BASE_URL \"https://api.cal.com/v2\" --context development"
  "netlify env:set CALCOM_WEBHOOK_SECRET \"YOUR_DEV_CALCOM_WEBHOOK_SECRET_HERE\" --context development"
  "netlify env:set STRIPE_SECRET_KEY \"YOUR_DEV_STRIPE_SECRET_KEY_HERE\" --context development"
  "netlify env:set STRIPE_WEBHOOK_SECRET \"YOUR_DEV_STRIPE_WEBHOOK_SECRET_HERE\" --context development"
  "netlify env:set LOOPS_API_KEY \"YOUR_DEV_LOOPS_API_KEY_HERE\" --context development"
  "netlify env:set NTFY_SH_TOPIC \"techinterview-coach-v2-development\" --context development"
  "netlify env:set NTFY_SH_URL \"https://ntfy.sh\" --context development"
  "netlify env:set ZAPIER_SECRET_KEY \"YOUR_DEV_ZAPIER_SECRET_KEY_HERE\" --context development"
)

echo "📋 Production environment setup commands:"
echo "========================================"
for cmd in "${ENV_COMMANDS[@]}"; do
  echo "$cmd"
done

echo ""
echo "🔧 Development environment setup commands:"
echo "========================================="
for cmd in "${DEV_ENV_COMMANDS[@]}"; do
  echo "$cmd"
done

echo ""
echo "🎯 To get the actual values:"
echo "1. Go to v1 Netlify dashboard: https://app.netlify.com/sites/techinterviewcoach/configuration/env"
echo "2. Copy each variable value and replace in the commands above"
echo "3. Run the commands one by one"
echo ""
echo "🚀 Once complete, test the Get Started flow:"
echo "   https://techinterviewcoach-v2.netlify.app/get-started"