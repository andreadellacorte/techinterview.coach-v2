// Re-export all data loaders for easy imports
export { loadCoaches, getCoachById, getCoachesBySpecialty, getCoachesByRole } from './loadCoaches';
export { loadPosts, getPostBySlug, getPostsByTag } from './loadPosts';
export { loadTestimonials, loadRealTestimonials } from './loadTestimonials';
export type { Testimonial, LegacyTestimonial } from './loadTestimonials';