'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface SurveyData {
  name: string;
  email: string;
  interviewGoal: string;
  targetCompanies: string[];
  experienceLevel: string;
  coachingStyle: string;
  availability: string;
}

interface Coach {
  id: string;
  name: string;
  title: string;
  image: string;
  location: string;
  specialties: string[];
  matchScore: number;
  calcom: { intro?: string };
  front: string;
}

export default function GetStarted() {
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    name: '',
    email: '',
    interviewGoal: '',
    targetCompanies: [],
    experienceLevel: '',
    coachingStyle: '',
    availability: ''
  });
  const [matchedCoaches, setMatchedCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const handleSurveySubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/process-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });

      const result = await response.json();
      if (result.success) {
        setMatchedCoaches(result.matchedCoaches);
        setStep(2);
      }
    } catch (error) {
      console.error('Survey submission failed:', error);
    }
    setLoading(false);
  };

  const handleCoachSelection = (coach: Coach) => {
    setSelectedCoach(coach);
    setStep(3);
  };

  const handleBooking = async () => {
    if (!selectedCoach) return;

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/book-free-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: 'temp-lead-id', // Would come from survey response
          coachId: selectedCoach.id,
          name: surveyData.name,
          email: surveyData.email,
          selectedTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });

      const result = await response.json();
      if (result.success && result.bookingUrl) {
        window.open(result.bookingUrl, '_blank');
        setStep(4);
      }
    } catch (error) {
      console.error('Booking failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-sm text-gray-500">2 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-sky-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Find Your Perfect Interview Coach
              </CardTitle>
              <CardDescription className="text-lg">
                Take our 2-minute survey to get matched with 5 expert coaches ready to help you succeed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    value={surveyData.name}
                    onChange={(e) => setSurveyData({...surveyData, name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={surveyData.email}
                    onChange={(e) => setSurveyData({...surveyData, email: e.target.value})}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">What&apos;s your main interview goal?</Label>
                <RadioGroup
                  value={surveyData.interviewGoal}
                  onValueChange={(value) => setSurveyData({...surveyData, interviewGoal: value})}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="behavioral" id="behavioral" />
                    <Label htmlFor="behavioral">Master behavioral interviews (STAR method, leadership principles)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system-design" id="system-design" />
                    <Label htmlFor="system-design">Ace system design interviews (architecture, scalability)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="coding" id="coding" />
                    <Label htmlFor="coding">Improve coding interviews (algorithms, data structures)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="career-growth" id="career-growth" />
                    <Label htmlFor="career-growth">Advance my career (promotion, salary negotiation)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Target companies (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'Other FAANG', 'Startups'].map(company => (
                    <div key={company} className="flex items-center space-x-2">
                      <Checkbox
                        id={company}
                        checked={surveyData.targetCompanies.includes(company)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSurveyData({
                              ...surveyData,
                              targetCompanies: [...surveyData.targetCompanies, company]
                            });
                          } else {
                            setSurveyData({
                              ...surveyData,
                              targetCompanies: surveyData.targetCompanies.filter(c => c !== company)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={company} className="text-sm">{company}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Experience Level</Label>
                <RadioGroup
                  value={surveyData.experienceLevel}
                  onValueChange={(value) => setSurveyData({...surveyData, experienceLevel: value})}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entry-level" id="entry" />
                    <Label htmlFor="entry">Entry Level (0-3 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mid-level" id="mid" />
                    <Label htmlFor="mid">Mid Level (3-7 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="senior" id="senior" />
                    <Label htmlFor="senior">Senior/Staff (7+ years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manager" id="manager" />
                    <Label htmlFor="manager">Engineering Manager</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Preferred coaching style</Label>
                <RadioGroup
                  value={surveyData.coachingStyle}
                  onValueChange={(value) => setSurveyData({...surveyData, coachingStyle: value})}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="supportive" id="supportive" />
                    <Label htmlFor="supportive">🤝 Supportive & encouraging</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct">💡 Direct & results-focused</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="structured" id="structured" />
                    <Label htmlFor="structured">📋 Structured & systematic</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleSurveySubmit}
                disabled={loading || !surveyData.name || !surveyData.email || !surveyData.interviewGoal}
                className="w-full bg-sky-600 hover:bg-sky-700"
                size="lg"
              >
                {loading ? 'Finding your matches...' : 'Find My Coaches'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Perfect! Here are your top matches
              </CardTitle>
              <CardDescription>
                We found {matchedCoaches.length} expert coaches ready to help you achieve your interview goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matchedCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="border rounded-lg p-4 cursor-pointer hover:border-sky-500 transition-colors"
                    onClick={() => handleCoachSelection(coach)}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={coach.image}
                        alt={coach.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{coach.name}</h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {coach.matchScore}% match
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{coach.title}</p>
                        <p className="text-sm text-gray-700 mb-2">{coach.front}</p>
                        <div className="flex flex-wrap gap-1">
                          {coach.specialties.slice(0, 3).map(specialty => (
                            <span key={specialty} className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">
                              {specialty.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && selectedCoach && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Great choice! Let&apos;s get started with {selectedCoach.name}
              </CardTitle>
              <CardDescription>
                Book your free 15-minute intro call to discuss your goals and get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex justify-center items-center space-x-4">
                <img
                  src={selectedCoach.image}
                  alt={selectedCoach.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="text-left">
                  <h3 className="font-semibold text-xl">{selectedCoach.name}</h3>
                  <p className="text-gray-600">{selectedCoach.title}</p>
                  <p className="text-sm text-gray-500">{selectedCoach.location}</p>
                </div>
              </div>

              <div className="bg-sky-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">What to expect in your free session:</h4>
                <ul className="text-sm text-gray-700 space-y-1 text-left">
                  <li>• Discuss your specific interview goals and timeline</li>
                  <li>• Get personalized advice for your target companies</li>
                  <li>• Create a tailored coaching plan just for you</li>
                  <li>• No commitment required - see if it&apos;s a good fit</li>
                </ul>
              </div>

              <Button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700"
                size="lg"
              >
                {loading ? 'Booking...' : 'Book Free 15-Minute Call'}
              </Button>

              <p className="text-xs text-gray-500">
                Free consultation • No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                🎉 You&apos;re all set!
              </CardTitle>
              <CardDescription className="text-lg">
                Your free consultation is booked. Check your email for the calendar invite.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Next steps:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>📧 Calendar invite sent to {surveyData.email}</li>
                  <li>📝 Prepare 1-2 specific questions about your goals</li>
                  <li>🎯 Think about your interview timeline and target companies</li>
                </ul>
              </div>

              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}