#!/bin/bash
# Development environment variables from v1 to v2
set -e

netlify env:set AIRTABLE_API_KEY "****************ed8f" --context development
netlify env:set AIRTABLE_BASE_KEY "****************QqpG" --context development
netlify env:set CALCOM_API_BASE_URL "https://api.cal.com/v2" --context development
netlify env:set CALCOM_SUBSCRIBER_URL "No value set in the development branch for environment variable CALCOM_SUBSCRIBER_URL" --context development
netlify env:set CALCOM_WEBHOOK_SECRET "****************6593" --context development
netlify env:set CALENDLY_API_BASE_URL "https://stoplight.io/mocks/calendly/api-docs/395" --context development
netlify env:set CALENDLY_API_KEY "****************p-Mg" --context development
netlify env:set CALENDLY_WEBHOOK_SECRET "****************ZW3a" --context development
