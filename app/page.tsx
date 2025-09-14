import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loadCoaches, loadTestimonials } from '@/lib/data';

export default function Home() {
  const coaches = loadCoaches();
  const testimonials = loadTestimonials();

  // Get featured coaches (first 3 active coaches)
  const featuredCoaches = coaches.slice(0, 3);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-sky-50/50 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
            No more interview anxiety,<br />just success
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Land your dream tech role with personalized coaching from industry leaders.
            Join 2,000+ engineers who chose success over stress.
          </p>
          <div className="space-y-4 mb-8">
            <Button size="lg" className="text-lg px-8 py-4 bg-sky-600 hover:bg-sky-700">
              Get started free
            </Button>
            <p className="text-sm text-muted-foreground">
              Free strategy session • No credit card required • 30-day guarantee
            </p>
          </div>

          {/* Success Metric */}
          <div className="mt-12 pt-8 border-t border-sky-100">
            <p className="text-sm text-muted-foreground mb-4">Helped 2,000+ engineers land roles at</p>
            <div className="flex justify-center items-center gap-8 opacity-70">
              <span className="text-sm font-semibold tracking-wide">GOOGLE</span>
              <span className="text-sm font-semibold tracking-wide">AMAZON</span>
              <span className="text-sm font-semibold tracking-wide">META</span>
              <span className="text-sm font-semibold tracking-wide">MICROSOFT</span>
              <span className="text-sm font-semibold tracking-wide">APPLE</span>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-sky-100 text-sky-800 rounded-full">
                92% success rate • Average 40% salary increase
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Are you tired of getting rejected after technical interviews?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Do you freeze up during behavioral questions? Feel unprepared for system design discussions?
              You&apos;re not alone. Our expert coaches have been exactly where you are.
            </p>
          </div>
        </div>
      </section>

      {/* Coach Credibility Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet your interview coaches</h2>
            <p className="text-lg text-muted-foreground">
              Industry leaders who&apos;ve hired hundreds of engineers and been through the process themselves
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCoaches.length > 0 ? featuredCoaches.map((coach) => {
              // Create initials for placeholder avatar
              const initials = coach.name.split(' ').map(n => n[0]).join('').toUpperCase();

              // Get company names from first group
              const companies = coach.companies?.[0]?.map(company =>
                company.replace('group-', '').replace('-', ' ').toUpperCase()
              ).join(', ') || '';

              return (
                <Card key={coach.id} className="text-center">
                  <CardHeader className="pb-4">
                    <div className="w-24 h-24 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-sky-600">{initials}</span>
                    </div>
                    <CardTitle>{coach.name}</CardTitle>
                    <CardDescription>{coach.title}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {coach.front}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {coach.specialties.slice(0, 3).map(s => s.replace('-', ' ')).join(' • ')}
                    </div>
                    {companies && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {companies}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }) : (
              // Fallback coaches if no data loaded
              <>
                <Card className="text-center">
                  <CardHeader className="pb-4">
                    <div className="w-24 h-24 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-sky-600">SC</span>
                    </div>
                    <CardTitle>Expert Coaches</CardTitle>
                    <CardDescription>Industry Leaders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn from experienced engineers and hiring managers from top tech companies.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Technical & Behavioral Coaching
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Real results from real engineers</h2>
            <p className="text-lg text-muted-foreground">
              See how our personalized coaching transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              // Create initials for placeholder avatar
              const initials = testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase();

              // Build outcome display
              const outcomes = [];
              if (testimonial.outcome.timeline) outcomes.push(`Timeline: ${testimonial.outcome.timeline}`);
              if (testimonial.outcome.salaryIncrease) outcomes.push(`Salary: ${testimonial.outcome.salaryIncrease}`);
              if (testimonial.outcome.offers) outcomes.push(`Offers: ${testimonial.outcome.offers}`);
              if (testimonial.outcome.level) outcomes.push(`Level: ${testimonial.outcome.level}`);

              return (
                <Card key={testimonial.id} className={`bg-sky-50/50 border-sky-100 ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-sky-600">{initials}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role} at {testimonial.company}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="text-sm font-medium text-sky-600">
                      {outcomes.join(' • ')}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">
              Simple, personalized, and proven process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-sky-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Book your free strategy session</h3>
              <p className="text-muted-foreground">
                We&apos;ll assess your background, goals, and create a personalized preparation plan
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-sky-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get matched with an expert coach</h3>
              <p className="text-muted-foreground">
                Work 1-on-1 with industry leaders from your target companies and roles
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-sky-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-sky-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Land your dream role</h3>
              <p className="text-muted-foreground">
                Get offers, negotiate with confidence, and launch your career to the next level
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-sky-600 to-sky-700 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your career?
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Join 2,000+ engineers who chose success over stress.<br />
            Your dream role is one conversation away.
          </p>

          <div className="space-y-6 mb-8">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-sky-700 hover:bg-sky-50">
              Start your free strategy session
            </Button>
            <div className="flex justify-center items-center gap-8 text-sm opacity-80">
              <span>✓ No credit card required</span>
              <span>✓ 30-day money-back guarantee</span>
              <span>✓ Average 40% salary increase</span>
            </div>
          </div>

          <div className="border-t border-sky-500/30 pt-8">
            <p className="text-sm opacity-75">
              Still not sure? Book a free 15-minute consultation to see if coaching is right for you.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-bold mb-6">Frequently asked questions</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold mb-2">How is this different from LeetCode?</h4>
              <p className="text-sm text-muted-foreground">
                LeetCode teaches algorithms. We teach you how to think, communicate, and present solutions like
                a senior engineer - which is what actually gets you hired.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What if I don&apos;t get an offer?</h4>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied with your progress,
                we&apos;ll refund your investment completely.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do you guarantee results?</h4>
              <p className="text-sm text-muted-foreground">
                92% of our clients land offers within 3 months. While we can&apos;t guarantee specific outcomes,
                our track record speaks for itself.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">How do I know if coaching is right for me?</h4>
              <p className="text-sm text-muted-foreground">
                Book a free 15-minute consultation. We&apos;ll assess your situation and give you honest feedback
                about whether coaching will help you reach your goals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
