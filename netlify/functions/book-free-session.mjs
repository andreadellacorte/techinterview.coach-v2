import { airtableService, calComService } from '../services/services.mjs';

/**
 * Handle free trial session booking
 * Integrates with Cal.com and Airtable to create booking records
 */
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const bookingData = JSON.parse(event.body);

    const {
      leadId,
      coachId,
      name,
      email,
      selectedTime,
      timezone,
      sessionType = 'free-intro' // 15-minute intro call
    } = bookingData;

    // Validate required fields
    if (!leadId || !coachId || !name || !email || !selectedTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get coach details from local data
    const coach = await getCoachById(coachId);
    if (!coach) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Coach not found' })
      };
    }

    // Create booking record in Airtable
    const bookingRecord = await airtableService.insertAirtableRecord('Bookings', {
      'Lead ID': leadId,
      'Coach ID': coachId,
      'Coach Name': coach.name,
      'Client Name': name,
      'Client Email': email,
      'Session Type': sessionType,
      'Scheduled Time': selectedTime,
      'Timezone': timezone,
      'Status': 'Confirmed',
      'Source': 'V2 Get Started Flow',
      'Is Free Trial': true,
      'Created At': new Date().toISOString()
    });

    // Update lead status
    await airtableService.updateAirtableRecord('Leads', leadId, {
      'Status': 'Booked Free Session',
      'Matched Coach': coach.name,
      'Booking ID': bookingRecord.id
    });

    // Generate Cal.com booking link or create booking via API
    const calComBookingUrl = generateCalComUrl(coach, sessionType, {
      name,
      email,
      timezone
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        bookingId: bookingRecord.id,
        bookingUrl: calComBookingUrl,
        coach: {
          name: coach.name,
          title: coach.title,
          image: coach.image
        },
        nextSteps: {
          message: `Great! Your free 15-minute intro session with ${coach.name} is confirmed.`,
          instructions: [
            'You\'ll receive a calendar invite via email',
            'Prepare 1-2 specific questions about your interview goals',
            'Come ready to discuss your target companies and timeline'
          ]
        }
      })
    };

  } catch (error) {
    console.error('Booking error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Booking failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Unable to complete booking'
      })
    };
  }
}

/**
 * Generate Cal.com booking URL with pre-filled data
 */
function generateCalComUrl(coach, sessionType, clientData) {
  const baseUrl = 'https://cal.com';
  const sessionSlug = sessionType === 'free-intro' ? coach.calcom?.intro : coach.calcom?.book;

  if (!sessionSlug) {
    throw new Error(`No Cal.com configuration found for coach ${coach.name}`);
  }

  const params = new URLSearchParams({
    name: clientData.name,
    email: clientData.email,
    timezone: clientData.timezone || 'UTC'
  });

  return `${baseUrl}/${sessionSlug}?${params.toString()}`;
}

/**
 * Get coach by ID from local YAML data
 */
async function getCoachById(coachId) {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  const yaml = await import('js-yaml');

  try {
    const coachesPath = join(process.cwd(), '_data', 'coaches.yml');
    const fileContents = readFileSync(coachesPath, 'utf8');
    const coaches = yaml.load(fileContents);

    return coaches.find(coach => coach.id === coachId && coach.status === 'active');
  } catch (error) {
    console.warn('Failed to load coach data:', error);
    return null;
  }
}