import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: "🎯",
      title: "Ideal Customer Profile (ICP)",
      desc: "AI-generated ICP with firmographics, psychographics, triggers, and disqualifiers based on your real customer evidence.",
    },
    {
      icon: "🗺️",
      title: "Decision Making Unit (DMU) Map",
      desc: "Map every stakeholder involved in the buying process — economic buyer, champion, technical buyer, and more.",
    },
    {
      icon: "🏆",
      title: "ABM Targeting Strategy",
      desc: "Account-based marketing strategy with Tier 1, 2, and 3 segmentation and prioritization frameworks.",
    },
    {
      icon: "📨",
      title: "Outreach Playbook",
      desc: "LinkedIn, Email, and WhatsApp outreach sequences with messaging frameworks tailored to your ICP.",
    },
    {
      icon: "🔍",
      title: "Lookalike Search Criteria",
      desc: "Boolean search strings and criteria to find accounts that match your best customers — no personal data exposed.",
    },
    {
      icon: "📊",
      title: "Leads Dashboard",
      desc: "Order targeted leads delivered by the Enigma Sales team with full CRM data and personality analysis links.",
    },
  ];

  const steps = [
    { n: "01", title: "Sign Up & Set Language", desc: "Create your account and choose English or Arabic." },
    { n: "02", title: "Complete Onboarding", desc: "Answer 6 structured steps about your business, customers, and GTM process." },
    { n: "03", title: "AI Generates Your Strategy", desc: "AVORA analyzes your input and generates ICP, DMU, ABM, and Outreach assets." },
    { n: "04", title: "Export & Request Leads", desc: "Download branded PDFs and order targeted leads delivered within 7 business days." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1E6663] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-[#1F2A2A]">AVORA</span>
            <span className="text-xs text-gray-400 ml-1">by Enigma Sales</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-[#1E6663] font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#FF6B63] hover:bg-[#e55d55] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1E6663]/10 text-[#1E6663] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-[#1E6663] rounded-full animate-pulse" />
          AI-Powered GTM Strategy
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#1F2A2A] leading-tight max-w-4xl mx-auto">
          Your GTM Strategy,
          <br />
          <span className="text-[#1E6663]">Built by AI</span> in Minutes
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          AVORA interviews your business, analyzes your best customers, and generates
          a complete go-to-market strategy — ICP, DMU Map, ABM Playbook, and Outreach sequences.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-[#FF6B63] hover:bg-[#e55d55] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#FF6B63]/25 hover:shadow-xl"
          >
            Get Your Strategy Free →
          </Link>
          <Link
            href="/login"
            className="border-2 border-[#1E6663] text-[#1E6663] hover:bg-[#1E6663] hover:text-white font-bold px-8 py-4 rounded-xl text-lg transition-all"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Free to start • No credit card required • English & Arabic supported
        </p>
      </section>

      {/* Sample Output Cards */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1F2A2A] mb-4">
            What AVORA Generates For You
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Based on your real business data — not templates, not guesses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-[#1F2A2A] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-[#1F2A2A] mb-4">
          How AVORA Works
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          A structured, AI-guided onboarding that turns your business knowledge into strategy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-[#1E6663] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="font-bold text-[#1F2A2A] mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1F2A2A] mb-4">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">LITE</div>
              <div className="text-4xl font-bold text-[#1F2A2A] mt-2">Free</div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">✓ Full GTM strategy generation</li>
                <li className="flex gap-2">✓ ICP, DMU, ABM, Outreach Playbook</li>
                <li className="flex gap-2">✓ Up to 2 PDF exports</li>
                <li className="flex gap-2">✓ Lead requests at $15/lead</li>
                <li className="flex gap-2 text-gray-400">✗ Leads Dashboard</li>
                <li className="flex gap-2 text-gray-400">✗ XLSX export</li>
              </ul>
              <Link
                href="/register"
                className="mt-8 block text-center border-2 border-[#1E6663] text-[#1E6663] hover:bg-[#1E6663] hover:text-white font-bold px-6 py-3 rounded-lg transition-all"
              >
                Start Free
              </Link>
            </div>
            <div className="bg-[#1E6663] rounded-xl p-8 border-2 border-[#1E6663] text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#FF6B63] text-white text-xs font-bold px-2 py-1 rounded-full">
                BEST VALUE
              </div>
              <div className="text-sm font-semibold text-white/70 uppercase tracking-wide">PLUS</div>
              <div className="text-4xl font-bold mt-2">$5<span className="text-xl font-normal">/lead</span></div>
              <p className="text-white/60 text-sm mt-1">After confirmed payment</p>
              <ul className="mt-6 space-y-3 text-sm text-white/90">
                <li className="flex gap-2">✓ Everything in LITE</li>
                <li className="flex gap-2">✓ $5/lead (was $15)</li>
                <li className="flex gap-2">✓ Full Leads Dashboard</li>
                <li className="flex gap-2">✓ Delivery in 7 business days</li>
                <li className="flex gap-2">✓ CRM-ready data + personality links</li>
                <li className="flex gap-2">✓ XLSX export (Export Pack = $100)</li>
              </ul>
              <Link
                href="/register"
                className="mt-8 block text-center bg-[#FF6B63] hover:bg-[#e55d55] text-white font-bold px-6 py-3 rounded-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-[#1F2A2A]">
          Ready to Build Your GTM Strategy?
        </h2>
        <p className="text-gray-500 mt-4 text-lg">
          Join businesses using AVORA to target the right accounts and close more deals.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block bg-[#FF6B63] hover:bg-[#e55d55] text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg"
        >
          Start Building for Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2024 AVORA by Enigma Sales. All rights reserved.</p>
        <p className="mt-1">Payments processed via Payoneer. Manual confirmation by admin.</p>
      </footer>
    </div>
  );
}
