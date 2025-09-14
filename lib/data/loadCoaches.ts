import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { Coach } from '../types';

const DATA_PATH = '_data';

export function loadCoaches(): Coach[] {
  try {
    const coachesPath = join(process.cwd(), DATA_PATH, 'coaches.yml');
    const fileContents = readFileSync(coachesPath, 'utf8');
    const coaches = yaml.load(fileContents) as Coach[];

    // Filter only active coaches
    return coaches.filter(coach => coach.status === 'active');
  } catch (error) {
    console.warn('Failed to load coaches data:', error);
    return [];
  }
}

export function getCoachById(id: string): Coach | undefined {
  const coaches = loadCoaches();
  return coaches.find(coach => coach.id === id);
}

export function getCoachesBySpecialty(specialty: string): Coach[] {
  const coaches = loadCoaches();
  return coaches.filter(coach =>
    coach.specialties.includes(specialty)
  );
}

export function getCoachesByRole(role: string): Coach[] {
  const coaches = loadCoaches();
  return coaches.filter(coach =>
    coach.roles.includes(role)
  );
}