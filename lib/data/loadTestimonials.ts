// Testimonials data - eventually move to Jekyll YAML
export interface Testimonial {
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

export function loadTestimonials(): Testimonial[] {
  // Mock data - replace with Jekyll data loader later
  return [
    {
      id: 'jennifer-liu',
      name: 'Jennifer Liu',
      role: 'Senior SDE',
      company: 'Amazon',
      quote: 'I was getting rejected from every FAANG interview. After 8 weeks of coaching, I landed offers at Amazon, Google, and Meta. 65% salary increase!',
      outcome: {
        timeline: '8 weeks',
        salaryIncrease: '+65%',
        offers: 3
      }
    },
    {
      id: 'david-kim',
      name: 'David Kim',
      role: 'Staff Engineer',
      company: 'Google',
      quote: 'The system design coaching was game-changing. Went from Senior to Staff level and finally broke into Google after 3 years of trying.',
      outcome: {
        timeline: '6 weeks',
        level: 'Senior → Staff',
        previousCompany: 'Startup'
      }
    },
    {
      id: 'rachel-patel',
      name: 'Rachel Patel',
      role: 'Engineering Manager',
      company: 'Meta',
      quote: 'Transitioned from IC to management role at Meta. The behavioral coaching helped me articulate my leadership experience confidently.',
      outcome: {
        timeline: '10 weeks',
        level: 'IC → Manager',
        previousCompany: 'Microsoft'
      }
    }
  ];
}