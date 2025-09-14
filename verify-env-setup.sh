#!/bin/bash

# Verification script for v2 environment setup

echo "🔍 V2 Environment Variable Verification"
echo "======================================"
echo ""

# Check production variables
echo "📊 Production Environment:"
prod_count=$(netlify env:list --context production --json | jq 'keys | length')
echo "Variables set: $prod_count"

if [ "$prod_count" -ge 10 ]; then
    echo "✅ Production setup complete ($prod_count/10 variables)"
else
    echo "⚠️  Production needs more variables ($prod_count/10)"
fi

echo ""

# Check development variables
echo "🔧 Development Environment:"
dev_count=$(netlify env:list --context development --json | jq 'keys | length')
echo "Variables set: $dev_count"

if [ "$dev_count" -ge 10 ]; then
    echo "✅ Development setup complete ($dev_count/10 variables)"
else
    echo "⚠️  Development needs more variables ($dev_count/10)"
fi

echo ""
echo "📋 Required Variables Checklist:"
echo "================================"

REQUIRED_VARS=(
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

echo "Production:"
prod_vars=$(netlify env:list --context production --json)
for var in "${REQUIRED_VARS[@]}"; do
    if echo "$prod_vars" | jq -e "has(\"$var\")" > /dev/null 2>&1; then
        echo "  ✅ $var"
    else
        echo "  ❌ $var (MISSING)"
    fi
done

echo ""
echo "Development:"
dev_vars=$(netlify env:list --context development --json)
for var in "${REQUIRED_VARS[@]}"; do
    if echo "$dev_vars" | jq -e "has(\"$var\")" > /dev/null 2>&1; then
        echo "  ✅ $var"
    else
        echo "  ❌ $var (MISSING)"
    fi
done

echo ""
echo "🚀 Next Steps:"
echo "=============="
if [ "$prod_count" -lt 10 ] || [ "$dev_count" -lt 10 ]; then
    echo "1. Copy missing API keys from V1 dashboard:"
    echo "   https://app.netlify.com/sites/techinterviewcoach/configuration/env"
    echo "2. Set them in V2 dashboard:"
    echo "   https://app.netlify.com/sites/techinterviewcoach-v2/configuration/env"
    echo "3. Re-run this script to verify"
else
    echo "✅ Environment setup complete!"
    echo "🎯 Test the Get Started flow:"
    echo "   https://techinterviewcoach-v2.netlify.app/get-started"
fi