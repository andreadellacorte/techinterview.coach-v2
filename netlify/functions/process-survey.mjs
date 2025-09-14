import { airtableService } from '../services/services.mjs';

/**
 * Process survey responses and match with coaches
 * Based on Fruitful.com's 2-minute survey approach
 */
export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const surveyData = JSON.parse(event.body);

    // Validate required fields
    const {
      name,
      email,
      interviewGoal,
      targetCompanies,
      experienceLevel,
      coachingStyle,
      availability
    } = surveyData;

    if (!name || !email || !interviewGoal) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Store lead in Airtable
    const leadRecord = await airtableService.insertAirtableRecord('Leads', {
      Name: name,
      Email: email,
      'Interview Goal': interviewGoal,
      'Target Companies': targetCompanies?.join(', '),
      'Experience Level': experienceLevel,
      'Coaching Style Preference': coachingStyle,
      'Availability': availability,
      'Source': 'V2 Get Started Survey',
      'Status': 'New Lead',
      'Created At': new Date().toISOString()
    });

    // Match with coaches based on survey responses
    const matchedCoaches = await findMatchingCoaches(surveyData);

    // Return matched coaches
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        leadId: leadRecord.id,
        matchedCoaches: matchedCoaches
      })
    };

  } catch (error) {
    console.error('Survey processing error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      })
    };
  }
}

/**
 * Coach matching algorithm based on survey responses
 */
async function findMatchingCoaches(surveyData) {
  const { interviewGoal, experienceLevel, coachingStyle, targetCompanies } = surveyData;

  // Get all active coaches from local data
  const coaches = await loadCoachesFromYAML();

  // Score coaches based on survey responses
  const scoredCoaches = coaches.map(coach => {
    let score = 0;

    // Match by specialty (40% weight)
    if (interviewGoal === 'behavioral' && coach.specialties.includes('behavioural-interview')) score += 40;
    if (interviewGoal === 'system-design' && coach.specialties.includes('system-design')) score += 40;
    if (interviewGoal === 'coding' && coach.specialties.includes('coding-interview')) score += 40;
    if (interviewGoal === 'career-growth' && coach.specialties.includes('career-coaching')) score += 40;

    // Match by experience level (30% weight)
    if (experienceLevel === 'senior' && coach.roles.includes('exec-director-staff-lead-senior')) score += 30;
    if (experienceLevel === 'manager' && coach.roles.includes('engineering-manager')) score += 30;
    if (experienceLevel === 'entry-level' && coach.specialties.includes('career-coaching')) score += 30;

    // Match by coaching style (20% weight)
    if (coachingStyle === 'structured' && coach.specialties.includes('system-design')) score += 20;
    if (coachingStyle === 'supportive' && coach.specialties.includes('career-coaching')) score += 20;
    if (coachingStyle === 'direct' && coach.specialties.includes('advancement-coaching')) score += 20;

    // Bonus for target companies (10% weight)
    if (targetCompanies?.some(company =>
      coach.companies?.some(companyGroup =>
        companyGroup.some(c => c.toLowerCase().includes(company.toLowerCase()))
      )
    )) {
      score += 10;
    }

    return { ...coach, matchScore: score };
  });

  // Return top 5 matches, minimum score of 30
  return scoredCoaches
    .filter(coach => coach.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map(coach => ({
      id: coach.id,
      name: coach.name,
      title: coach.title,
      image: coach.image,
      location: coach.location,
      specialties: coach.specialties,
      matchScore: coach.matchScore,
      calcom: coach.calcom,
      front: coach.front
    }));
}

/**
 * Load coaches from local YAML data (mirroring the data loader)
 */
async function loadCoachesFromYAML() {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  const yaml = await import('js-yaml');

  try {
    const coachesPath = join(process.cwd(), '_data', 'coaches.yml');
    const fileContents = readFileSync(coachesPath, 'utf8');
    const coaches = yaml.load(fileContents);

    return coaches.filter(coach => coach.status === 'active');
  } catch (error) {
    console.warn('Failed to load coaches data:', error);
    return [];
  }
}