'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TC</span>
            </div>
            <span className="text-xl font-bold text-foreground">TechInterview Coach</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/coaching"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Coaching
            </a>
            <div className="relative group">
              <button className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                Services
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <a href="/resume" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Resume Review</a>
                  <a href="/mock-interviews" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">Mock Interviews</a>
                  <a href="/system-design" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">System Design</a>
                </div>
              </div>
            </div>
            <a
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="/blog"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Blog
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
            <Button
              size="sm"
              className="bg-sky-600 hover:bg-sky-700"
              onClick={() => window.location.href = '/get-started'}
            >
              Get started free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-sm">
            <nav className="py-4 space-y-4">
              <a
                href="/coaching"
                className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleMenu}
              >
                Coaching
              </a>
              <div className="px-4">
                <div className="text-muted-foreground font-medium mb-2">Services</div>
                <div className="pl-4 space-y-2">
                  <a href="/resume" className="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">Resume Review</a>
                  <a href="/mock-interviews" className="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">Mock Interviews</a>
                  <a href="/system-design" className="block py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">System Design</a>
                </div>
              </div>
              <a
                href="/pricing"
                className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleMenu}
              >
                Pricing
              </a>
              <a
                href="/blog"
                className="block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleMenu}
              >
                Blog
              </a>
              <div className="px-4 pt-4 space-y-3 border-t">
                <Button variant="ghost" className="w-full justify-start">
                  Log in
                </Button>
                <Button
                  className="w-full bg-sky-600 hover:bg-sky-700"
                  onClick={() => window.location.href = '/get-started'}
                >
                  Get started free
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}