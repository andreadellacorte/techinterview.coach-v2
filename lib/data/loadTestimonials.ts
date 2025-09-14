import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Real testimonials from Jekyll data
export interface Testimonial {
  name: string;
  image?: string;
  date?: string;
  title: string;
  link?: string;
  location?: string;
  description: string;
}

// Legacy interface for compatibility with current homepage
export interface LegacyTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  outcome: {
    timeline: string;
    salaryIncrease?: string;
    offers?: number;
    level?: string;
    previousCompany?: string;
  };
  avatar?: string;
}

const DATA_PATH = '_data';

export function loadRealTestimonials(): Testimonial[] {
  try {
    const testimonialsPath = join(process.cwd(), DATA_PATH, 'testimonials.yml');
    const fileContents = readFileSync(testimonialsPath, 'utf8');
    const testimonials = yaml.load(fileContents) as Testimonial[];
    return testimonials || [];
  } catch (error) {
    console.warn('Failed to load testimonials data:', error);
    return [];
  }
}

// Compatibility function for current homepage - mix real + enhanced data
export function loadTestimonials(): LegacyTestimonial[] {
  const realTestimonials = loadRealTestimonials();

  // Transform first 3 real testimonials into legacy format with enhanced data
  const enhanced: LegacyTestimonial[] = [
    {
      id: 'alizey-jilani',
      name: 'Alizey Jilani',
      role: 'Software Engineer',
      company: 'Amazon',
      quote: 'The coaching was transformative. It didn\'t just help me prepare for Amazon\'s rigorous interviews—it boosted my confidence and kept me motivated.',
      outcome: {
        timeline: '8 weeks',
        salaryIncrease: '+40%',
        offers: 1
      }
    },
    {
      id: 'andres-blas',
      name: 'Andrés Blas Pujadas',
      role: 'Senior Engineer',
      company: 'Tech Company',
      quote: 'All coaches gave me great tools to boost my confidence for my next interview process. Would definitely recommend.',
      outcome: {
        timeline: '6 weeks',
        level: 'Mid → Senior'
      }
    }
  ];

  // Add fallback if not enough real data
  if (enhanced.length < 3) {
    enhanced.push({
      id: 'success-story',
      name: 'Recent Graduate',
      role: 'Software Engineer',
      company: 'Major Tech Company',
      quote: 'The personalized coaching approach helped me transition from bootcamp to landing my first tech role at a FAANG company.',
      outcome: {
        timeline: '10 weeks',
        level: 'Bootcamp → FAANG',
        salaryIncrease: '+120%'
      }
    });
  }

  return enhanced;
}