#!/bin/bash

# Copy essential environment variables from v1 to v2
# Run this script to set up the required variables for the Get Started functions

echo "🔧 Setting up environment variables for v2..."

# Essential variables needed for the Get Started flow
ESSENTIAL_VARS=(
  "AIRTABLE_API_KEY"
  "AIRTABLE_BASE_KEY"
  "CALCOM_API_BASE_URL"
  "CALCOM_WEBHOOK_SECRET"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "LOOPS_API_KEY"
  "NTFY_SH_TOPIC"
  "NTFY_SH_URL"
  "ZAPIER_SECRET_KEY"
)

echo "📋 Variables to copy:"
for var in "${ESSENTIAL_VARS[@]}"; do
  echo "  - $var"
done

echo ""
echo "⚠️  To complete the setup:"
echo "1. Go to Netlify dashboard for v2: https://app.netlify.com/projects/techinterviewcoach-v2"
echo "2. Navigate to Site settings → Environment variables"
echo "3. Copy the following variables from v1 to v2:"
echo ""

# Link to v1 temporarily to get values
cd /data/data/com.termux/files/home/tic/techinterview.coach
netlify unlink > /dev/null 2>&1
netlify link --id=c7b2350c-2661-44f5-8dc7-4d050108687d > /dev/null 2>&1

echo "🔑 Production environment variables from v1:"
echo "=========================================="
for var in "${ESSENTIAL_VARS[@]}"; do
  value=$(netlify env:get "$var" --context=production 2>/dev/null || echo "Not set")
  if [ "$value" != "Not set" ] && [ -n "$value" ]; then
    echo "export $var=\"$value\""
  fi
done

echo ""
echo "🔧 Development environment variables from v1:"
echo "=============================================="
for var in "${ESSENTIAL_VARS[@]}"; do
  value=$(netlify env:get "$var" --context=development 2>/dev/null || echo "Not set")
  if [ "$value" != "Not set" ] && [ -n "$value" ]; then
    echo "export $var=\"$value\""
  fi
done

# Link back to v2
cd /data/data/com.termux/files/home/tic/techinterview.coach-v2
netlify unlink > /dev/null 2>&1
netlify link --id=9e7a7419-d24d-4b6b-9ab9-5838885bd76f > /dev/null 2>&1

echo ""
echo "✅ Environment variable export complete!"
echo "📝 Next steps:"
echo "   1. Copy the export commands above"
echo "   2. Set them manually in v2 Netlify dashboard"
echo "   3. Or use: netlify env:set VARIABLE_NAME \"value\" --context production"
echo "   4. Test the Get Started flow at: https://techinterviewcoach-v2.netlify.app/get-started"