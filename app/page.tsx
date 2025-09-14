import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Land your dream tech role with expert coaching
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get personalized interview coaching from industry leaders at Google, Amazon, Meta, and more.
            Build confidence, master technical questions, and get the offer you deserve.
          </p>
          <Button size="lg" className="text-lg px-8 py-4">
            Book free consultation
          </Button>

          {/* Trust Bar */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">Trusted by engineers at</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <span className="text-sm font-semibold">GOOGLE</span>
              <span className="text-sm font-semibold">AMAZON</span>
              <span className="text-sm font-semibold">META</span>
              <span className="text-sm font-semibold">MICROSOFT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How we help you succeed</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Technical Interview Prep</CardTitle>
                <CardDescription>
                  Master coding challenges, system design, and technical discussions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Algorithm & data structure practice</li>
                  <li>• System design frameworks</li>
                  <li>• Mock interviews with feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Behavioral Coaching</CardTitle>
                <CardDescription>
                  Tell compelling stories and demonstrate leadership skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• STAR method mastery</li>
                  <li>• Leadership scenario practice</li>
                  <li>• Confidence building techniques</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume & LinkedIn</CardTitle>
                <CardDescription>
                  Stand out with optimized profiles that get you noticed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• ATS-optimized resume review</li>
                  <li>• LinkedIn profile optimization</li>
                  <li>• Personal brand development</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sarah Chen</CardTitle>
                <CardDescription>Senior Software Engineer at Google</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &ldquo;The coaching helped me ace my technical interviews and negotiate a 40% salary increase.
                  The personalized feedback was invaluable.&rdquo;
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Michael Rodriguez</CardTitle>
                <CardDescription>Engineering Manager at Amazon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &ldquo;I went from struggling with behavioral questions to confidently leading interview discussions.
                  Got my dream role in just 6 weeks.&rdquo;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your career?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join hundreds of engineers who&apos;ve landed their dream roles with our expert guidance.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
            Schedule your free consultation
          </Button>
        </div>
      </section>
    </div>
  );
}
