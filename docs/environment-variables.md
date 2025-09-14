# Environment Variables Required for V2 Functions

The Get Started experience requires these environment variables to be set up on Netlify for the serverless functions to work:

## Required Variables

### Airtable (Database)
```
AIRTABLE_API_KEY=keyXXXXXXXXXXXXX
AIRTABLE_BASE_KEY=appXXXXXXXXXXXXX
```

### Cal.com (Scheduling)
```
CALCOM_API_BASE_URL=https://api.cal.com/v1
CALCOM_WEBHOOK_SECRET=XXXXXXXXXX
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXX
```

### Loops (Email Marketing)
```
LOOPS_API_KEY=XXXXXXXXXX
```

### Notifications
```
NTFY_SH_TOPIC=XXXXXXXXXX
NTFY_SH_URL=https://ntfy.sh
```

### Security
```
ZAPIER_SECRET_KEY=XXXXXXXXXX
```

## Setup Instructions

1. Access Netlify dashboard for techinterviewcoach-v2
2. Go to Site settings → Environment variables
3. Add all the above variables with values from the v1 project
4. Deploy the site to activate the functions

## Function Endpoints

Once deployed, these endpoints will be available:

- `/.netlify/functions/process-survey` - Handles survey submission and coach matching
- `/.netlify/functions/book-free-session` - Handles free session booking

## Get Started Flow

1. User visits `/get-started`
2. Completes 2-minute survey
3. Gets matched with 5 coaches based on algorithm
4. Selects preferred coach
5. Books free 15-minute intro call
6. Receives confirmation and calendar invite

All data flows through Airtable just like the v1 system.