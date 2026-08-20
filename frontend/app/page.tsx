import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Layers, LineChart, Users, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">L</div>
            Loop Feedback
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-blue-600">Login</Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 px-4 text-center">
          <div className="container mx-auto max-w-4xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Loop Feedback Platform 2.0 is live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Turn Feedback Into <br/> Continuous Improvement.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              The modern way for teams to collect, manage, act on, and close feedback loops. Stop losing valuable insights in messy spreadsheets.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-16 w-full max-w-5xl mx-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 p-2">
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black aspect-video relative flex items-center justify-center">
                <p className="text-gray-500">Dashboard Preview Animation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to close the loop</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Powerful features to help your team collect insights and take meaningful action.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Feedback Collection', icon: MessageSquare, desc: 'Gather feedback from multiple sources into one unified inbox.' },
                { title: 'Smart Organization', icon: Layers, desc: 'Automatically categorize and prioritize feedback using custom tags and themes.' },
                { title: 'Action Tracking', icon: CheckCircle2, desc: 'Assign feedback to team members and track status through to resolution.' },
                { title: 'Team Collaboration', icon: Users, desc: 'Discuss feedback internally with inline comments and mentions.' },
                { title: 'Analytics', icon: LineChart, desc: 'Visualize feedback trends and measure your team\'s response times.' },
                { title: 'Closed-Loop', icon: ArrowRight, desc: 'Automatically notify users when their feedback has been implemented.' },
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">How it works</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">A simple 4-step process to transform feedback into product improvements.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Collect', desc: 'Gather feedback from users.' },
                { step: '02', title: 'Organize', desc: 'Sort and prioritize insights.' },
                { step: '03', title: 'Act', desc: 'Assign and implement changes.' },
                { step: '04', title: 'Close', desc: 'Notify users of improvements.' },
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold text-xl flex items-center justify-center mb-6 border-4 border-white dark:border-black z-10 relative">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                  {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-gray-200 dark:bg-gray-800 -z-0"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-4xl font-bold mb-6">Close the loop. Improve continuously.</h2>
            <p className="text-blue-100 text-xl mb-10">Join forward-thinking teams building better products with Loop Feedback.</p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-blue-600 bg-white hover:bg-gray-50 text-base px-8 h-14">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-zinc-950 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">L</div>
              Loop Feedback
            </div>
            <p className="text-gray-500 text-sm max-w-xs mb-6">The platform for continuous product improvement through better feedback management.</p>
            <p className="text-gray-400 text-xs">© 2026 Loop Feedback. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600">Features</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Integrations</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600">Documentation</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Blog</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Community</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="https://github.com/mdshahbaaz17/loop-feedback-platform" className="hover:text-blue-600">GitHub</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
