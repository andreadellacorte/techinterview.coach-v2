import { loadCoaches } from '@/lib/data';
import { CoachCard } from '@/components/CoachCard';

export default function CoachingPage() {
  const coaches = loadCoaches();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Expert Tech Interview Coaches
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized coaching from industry leaders who&apos;ve been in your shoes.
            Book a session with coaches from top companies like Google, Amazon, and Meta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>

        {coaches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No coaches data found. Make sure the Jekyll data is accessible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}