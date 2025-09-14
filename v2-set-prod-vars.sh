#!/bin/bash
# Production environment variables from v1 to v2
set -e

netlify env:set AIRTABLE_API_KEY "****************5035" --context production
netlify env:set AIRTABLE_BASE_KEY "****************yGCZ" --context production
netlify env:set CALCOM_API_BASE_URL "https://api.cal.com/v2" --context production
netlify env:set CALCOM_SUBSCRIBER_URL "https://production--techinterviewcoach.netlify.app/.netlify/functions/webhook" --context production
netlify env:set CALCOM_WEBHOOK_SECRET "****************07b8" --context production
netlify env:set CALENDLY_API_BASE_URL "https://api.calendly.com" --context production
netlify env:set CALENDLY_API_KEY "****************HYug" --context production
netlify env:set CALENDLY_WEBHOOK_SECRET "****************PWQN" --context production
netlify env:set CLOUDFLARE_API_TOKEN "6c9a1b4345596094954d264bdcc419fd" --context production
netlify env:set CLOUDFLARE_ZONE_ID "d070b89ea7fb33f4873de9660430f207" --context production
netlify env:set JEKYLL_ENV "production-v2" --context production
netlify env:set LOOPS_API_KEY "****************4c4e" --context production
netlify env:set NTFY_SH_TOPIC "techinterview-coach-v2-production" --context production
netlify env:set NTFY_SH_URL "https://ntfy.sh" --context production
netlify env:set SECRETS_SCAN_OMIT_PATHS ".jest-cache,spec/support/setEnvVars.js" --context production
netlify env:set SPEEDCURVE_API_KEY "3gh1bth1q7u9cr2zdia3tjfggv9e41" --context production
netlify env:set SPEEDCURVE_SITE_ID "Techinterview" --context production
netlify env:set STRIPE_SECRET_KEY "****************NM02" --context production
netlify env:set STRIPE_WEBHOOK_SECRET "****************U7np" --context production
netlify env:set ZAPIER_SECRET_KEY "****************2252" --context production
