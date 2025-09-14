'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Coach } from '@/lib/types';

interface CoachCardProps {
  coach: Coach;
}

export function CoachCard({ coach }: CoachCardProps) {
  const handleBookSession = () => {
    // Open Cal.com booking in new window
    window.open(`https://cal.com/${coach.calcom.book}`, '_blank');
  };

  const handleIntroCall = () => {
    // Open Cal.com intro call in new window
    window.open(`https://cal.com/${coach.calcom.intro}`, '_blank');
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="text-center">
        <div className="w-24 h-24 mx-auto mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coach.image.startsWith('/') ? coach.image : `/coaches/${coach.image}`}
            alt={coach.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h3 className="text-xl font-semibold">{coach.name}</h3>
        <p className="text-sm text-muted-foreground">{coach.location}</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">{coach.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {coach.front}
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {coach.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
              >
                {specialty.replace('-', ' ')}
              </span>
            ))}
            {coach.specialties.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{coach.specialties.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <Button onClick={handleBookSession} className="w-full">
            Book Session
          </Button>
          <Button onClick={handleIntroCall} variant="outline" className="w-full">
            15min Intro Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}