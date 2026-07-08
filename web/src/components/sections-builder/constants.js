// ─────────────────────────────────────────────────────────────────────────────
// constants.js — Section templates, categories, default page
// ─────────────────────────────────────────────────────────────────────────────

let _id = 1;
export const genId = () => `section-${_id++}`;

// ── Categories shown in the left sidebar ─────────────────────────────────────
export const SECTION_CATEGORIES = [
  { id: "hero", label: "Hero" },
  { id: "features", label: "Features" },
  { id: "testimonials", label: "Testimonials" },
  { id: "cta", label: "CTA" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
];

// ── Section templates (source of truth for the library) ──────────────────────
export const SECTION_TEMPLATES = [
  // ── HERO ──────────────────────────────────────────────────────────────────
  {
    type: "hero-split",
    category: "hero",
    name: "Hero — Split",
    defaultData: {
      title: "Build something amazing",
      subtitle: "The all-in-one platform that helps modern teams move faster, ship smarter, and grow together.",
      ctaText: "Get started free",
      ctaLink: "#",
      secondaryText: "See how it works",
      secondaryLink: "#",
      imageSrc: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
      imageAlt: "Dashboard screenshot",
      badge: "Now in public beta ✦",
    },
  },
  {
    type: "hero-centered",
    category: "hero",
    name: "Hero — Centered",
    defaultData: {
      title: "Your ideas deserve a great home",
      subtitle: "Design, publish, and grow — all from one place. No code needed.",
      ctaText: "Start for free",
      ctaLink: "#",
      secondaryText: "View examples",
      secondaryLink: "#",
      imageSrc: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
      imageAlt: "Product screenshot",
      badge: "",
    },
  },

  // ── FEATURES ──────────────────────────────────────────────────────────────
  {
    type: "features-grid",
    category: "features",
    name: "Features — 3-column grid",
    defaultData: {
      title: "Everything you need to succeed",
      subtitle: "Powerful tools built for modern teams. Simple enough for anyone to use.",
      features: [
        { id: "f1", icon: "zap", title: "Blazing Fast", description: "Performance-first architecture. Your pages load in milliseconds, not seconds." },
        { id: "f2", icon: "shield", title: "Enterprise Security", description: "Bank-grade encryption and role-based access control out of the box." },
        { id: "f3", icon: "layers", title: "Fully Modular", description: "Mix and match components. Build exactly what you need, nothing more." },
        { id: "f4", icon: "star", title: "5-Star Support", description: "A real human is always available. Our team responds in under 2 hours." },
        { id: "f5", icon: "globe", title: "Global CDN", description: "Deploy to 300+ edge locations worldwide with a single click." },
        { id: "f6", icon: "code", title: "API First", description: "Every feature is accessible via REST API. Integrate with anything." },
      ],
    },
  },
  {
    type: "features-alternating",
    category: "features",
    name: "Features — Alternating",
    defaultData: {
      title: "Built for how teams actually work",
      subtitle: "Real features for real workflows.",
      features: [
        { id: "f1", title: "Visual page builder", description: "Design pages without writing a single line of code. What you see is what you get.", imageSrc: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80" },
        { id: "f2", title: "Real-time collaboration", description: "Invite your team and work together simultaneously. Comments, reviews, and approvals built in.", imageSrc: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" },
      ],
    },
  },

  // ── TESTIMONIALS ──────────────────────────────────────────────────────────
  {
    type: "testimonial-single",
    category: "testimonials",
    name: "Testimonial — Single",
    defaultData: {
      quote: "Meereo changed how our team ships landing pages. What used to take a week now takes an afternoon. The quality is better and the process is actually enjoyable.",
      name: "Sarah Chen",
      role: "Head of Marketing at Vercel",
      avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      rating: 5,
    },
  },
  {
    type: "testimonials-grid",
    category: "testimonials",
    name: "Testimonials — Grid",
    defaultData: {
      title: "Loved by thousands of teams",
      subtitle: "Don't take our word for it.",
      testimonials: [
        { id: "t1", quote: "The best tool we've adopted this year. Our conversion rate jumped 34% in the first month.", name: "Alex Morgan", role: "CEO, Startups Inc.", avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", rating: 5 },
        { id: "t2", quote: "Finally a builder that doesn't get in the way. Clean, fast, and the output looks professional.", name: "Priya Kapoor", role: "Designer at Figma", avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", rating: 5 },
        { id: "t3", quote: "We replaced three tools with Meereo. Our workflow is 10× simpler and our pages look better.", name: "Tom Walsh", role: "CTO at Linear", avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", rating: 5 },
      ],
    },
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  {
    type: "cta-dark",
    category: "cta",
    name: "CTA — Dark banner",
    defaultData: {
      title: "Ready to build your next great page?",
      subtitle: "Join 50,000+ teams already using Meereo to ship faster.",
      ctaText: "Start building — it's free",
      ctaLink: "#",
      secondaryText: "Talk to sales",
      secondaryLink: "#",
    },
  },
  {
    type: "cta-light",
    category: "cta",
    name: "CTA — Light banner",
    defaultData: {
      title: "Start your free trial today",
      subtitle: "No credit card required. Cancel any time.",
      ctaText: "Get started",
      ctaLink: "#",
      secondaryText: "",
      secondaryLink: "#",
    },
  },

  // ── PRICING ───────────────────────────────────────────────────────────────
  {
    type: "pricing-simple",
    category: "pricing",
    name: "Pricing — 3 tiers",
    defaultData: {
      title: "Simple, transparent pricing",
      subtitle: "No hidden fees. No surprises. Cancel any time.",
      plans: [
        {
          id: "p1",
          name: "Starter",
          price: "$0",
          period: "/ month",
          description: "Perfect for individuals and side projects.",
          features: ["5 pages", "3 sections per page", "Community support", "Basic analytics"],
          ctaText: "Get started free",
          highlighted: false,
        },
        {
          id: "p2",
          name: "Pro",
          price: "$29",
          period: "/ month",
          description: "Everything you need to grow your business.",
          features: ["Unlimited pages", "All section types", "Priority support", "Advanced analytics", "Custom domain", "Remove Meereo branding"],
          ctaText: "Start free trial",
          highlighted: true,
        },
        {
          id: "p3",
          name: "Enterprise",
          price: "$99",
          period: "/ month",
          description: "For teams that need scale and control.",
          features: ["Everything in Pro", "Unlimited team members", "SSO / SAML", "SLA guarantee", "Dedicated CSM", "Custom integrations"],
          ctaText: "Contact sales",
          highlighted: false,
        },
      ],
    },
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  {
    type: "faq-simple",
    category: "faq",
    name: "FAQ — Accordion",
    defaultData: {
      title: "Frequently asked questions",
      subtitle: "Everything you need to know about Meereo.",
      faqs: [
        { id: "q1", question: "Do I need to know how to code?", answer: "Not at all. Meereo is designed for everyone. Our drag-and-drop interface means you can build professional pages without writing a single line of code." },
        { id: "q2", question: "Can I use my own domain?", answer: "Yes! On the Pro and Enterprise plans, you can connect any custom domain you own. We handle all the SSL certificates and DNS configuration automatically." },
        { id: "q3", question: "How does billing work?", answer: "We bill monthly or annually (save 20% annually). You can upgrade, downgrade, or cancel at any time from your account settings." },
        { id: "q4", question: "Is there a free plan?", answer: "Yes. Our Starter plan is free forever, with up to 5 pages and core features included. No credit card required to sign up." },
        { id: "q5", question: "Can I export my pages?", answer: "Pro and Enterprise users can export their pages as clean HTML/CSS, giving you full ownership of your content." },
      ],
    },
  },

  // ── GALLERY ───────────────────────────────────────────────────────────────
  {
    type: "gallery-grid",
    category: "gallery",
    name: "Gallery — Grid",
    defaultData: {
      title: "Built with Meereo",
      subtitle: "See what's possible.",
      images: [
        { id: "g1", src: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80", alt: "Project 1" },
        { id: "g2", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80", alt: "Project 2" },
        { id: "g3", src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80", alt: "Project 3" },
        { id: "g4", src: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80", alt: "Project 4" },
        { id: "g5", src: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&q=80", alt: "Project 5" },
        { id: "g6", src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80", alt: "Project 6" },
      ],
    },
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  {
    type: "contact-simple",
    category: "contact",
    name: "Contact — Simple",
    defaultData: {
      title: "Get in touch",
      subtitle: "We'd love to hear from you. Our team usually responds within 2 hours.",
      email: "hello@meereo.com",
      phone: "+1 (555) 000-0000",
      address: "123 Market Street, San Francisco CA 94103",
    },
  },

  // ── FOOTER ────────────────────────────────────────────────────────────────
  {
    type: "footer-simple",
    category: "footer",
    name: "Footer — Simple",
    defaultData: {
      logo: "Meereo",
      tagline: "Build faster. Ship better.",
      columns: [
        { id: "c1", heading: "Product", links: [{ id: "l1", label: "Features", href: "#" }, { id: "l2", label: "Pricing", href: "#" }, { id: "l3", label: "Changelog", href: "#" }] },
        { id: "c2", heading: "Company", links: [{ id: "l4", label: "About", href: "#" }, { id: "l5", label: "Blog", href: "#" }, { id: "l6", label: "Careers", href: "#" }] },
        { id: "c3", heading: "Legal", links: [{ id: "l7", label: "Privacy", href: "#" }, { id: "l8", label: "Terms", href: "#" }, { id: "l9", label: "Security", href: "#" }] },
      ],
      copyright: `© ${new Date().getFullYear()} Meereo, Inc. All rights reserved.`,
    },
  },
];

// ── Default page (pre-loaded in canvas) ──────────────────────────────────────
export const DEFAULT_PAGE = [
  {
    id: "section-d1",
    type: "hero-split",
    data: { ...SECTION_TEMPLATES.find((t) => t.type === "hero-split").defaultData },
  },
  {
    id: "section-d2",
    type: "features-grid",
    data: { ...SECTION_TEMPLATES.find((t) => t.type === "features-grid").defaultData },
  },
];
