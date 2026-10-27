import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  Menu,
  X,
  Camera,
  BrainCircuit,
  ClipboardCheck,
  ChevronRight,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import { asset, type GuideEntry } from "./data";

export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 42 34 7M21 29C10 29 9 19 13 11c8 3 11 9 8 18Zm3-8C20 11 27 4 35 3c0 8-4 15-11 18Zm-5 14c4-12 13-16 23-13-4 11-12 17-23 13Z" />
        </g>
      </svg>
      <span>
        PEST<span className="text-green">PRINT</span>
      </span>
    </span>
  );
}
export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="header">
      <div className="nav-inner">
        <Link to="/" aria-label="PESTPRINT home">
          <Logo />
        </Link>
        <button
          className="menu-button icon-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-nav"
          className={open ? "navigation open" : "navigation"}
          aria-label="Main navigation"
        >
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/analyze">Analyze</NavLink>
          <NavLink to="/pest-guide">Pest Guide</NavLink>
          <NavLink to="/about">About</NavLink>
          {location.pathname === "/" && (
            <Link className="button nav-cta" to="/analyze">
              Get Started <ArrowRight size={17} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Logo />
          <p>A clearer picture. A healthier harvest.</p>
        </div>
        <div className="footer-right">
          <span>Rice crop damage identification</span>
          <Link to="/about">
            About PESTPRINT <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Built to support better crop understanding.</span>
        <span>
          <Leaf size={14} /> Rooted in agriculture. Powered by AI.
        </span>
      </div>
    </footer>
  );
}
export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
export function FeatureCard({
  number,
  icon: Icon,
  title,
  children,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon size={28} strokeWidth={1.7} />
        <span>{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function HowItWorks() {
  return (
    <div className="features">
      <FeatureCard number="01" icon={Camera} title="Upload or Capture">
        Take a photo or upload an image of your rice crop.
      </FeatureCard>
      <FeatureCard number="02" icon={BrainCircuit} title="Image-Based Analysis">
        Our model analyzes crop damage patterns using deep learning.
      </FeatureCard>
      <FeatureCard number="03" icon={ClipboardCheck} title="Get Results">
        Receive the most likely pest, confidence score, and damage details.
      </FeatureCard>
    </div>
  );
}
export function PestGuideCard({
  entry,
  compact = false,
}: {
  entry: GuideEntry;
  compact?: boolean;
}) {
  return (
    <article className={compact ? "guide-card compact" : "guide-card"}>
      <img src={asset(entry.image)} alt={entry.alt} loading="lazy" />
      <div className="guide-card-content">
        <span className="category">{entry.category}</span>
        <h2>
          {entry.slug === "unknown-damage" && (
            <CircleHelp
              className="unknown-guide-icon"
              size={23}
              aria-hidden="true"
            />
          )}
          {entry.name}
          {entry.slug === "brown-planthopper" && (
            <span className="bph"> (BPH)</span>
          )}
        </h2>
        <p>{entry.summary}</p>
        {!compact && (
          <div className="symptom-chips">
            {entry.symptoms.slice(0, 2).map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        )}
        <Link to={`/pest-guide/${entry.slug}`} className="detail-link">
          View Details <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}
export function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
    const title =
      pathname === "/"
        ? "Rice Pest Identification"
        : pathname === "/analyze"
          ? "Analyze a Rice Crop"
          : pathname.startsWith("/pest-guide")
            ? "Pest Guide"
            : "About";
    document.title = `PESTPRINT — ${title}`;
  }, [pathname]);
  return null;
}
