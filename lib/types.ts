// Core data types from Jekyll site
export interface Coach {
  id: string;
  status: 'active' | 'inactive';
  name: string;
  roles: string[];
  title: string;
  image: string;
  specialties: string[];
  location: string;
  pricing_id: string;
  calcom: {
    intro: string;
    book: string;
  };
  companies: string[][];
  linkedin: string;
  front: string;
  bio: string[];
  'long-bio': {
    header: string;
    paragraphs: string[];
  }[];
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  tags: string[];
  image?: string;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  group: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: string;
}