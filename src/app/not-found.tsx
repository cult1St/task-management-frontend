import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div id="page-not-found" className="page active">
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-name">
            Task<span>Flow</span>
          </span>
        </Link>
        <div className="nav-cta">
          <Link className="btn btn-outline" href="/login">
            Sign In
          </Link>
          <Link className="btn btn-primary" href="/register">
            Get Started Free
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>

        <div
          className="hero-content"
          style={{ gridTemplateColumns: "1fr", maxWidth: 760, textAlign: "center" }}
        >
          <div className="hero-left">
            <div className="hero-badge" style={{ marginLeft: "auto", marginRight: "auto" }}>
              <div className="hero-badge-dot" />
              Error 404
            </div>
            <h1 className="hero-title">
              This page has
              <br />
              <span className="accent">gone missing.</span>
            </h1>
            <p className="hero-sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
              The page you are looking for might have been moved, deleted, or never
              existed in the first place.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link className="btn btn-primary btn-lg" href="/">
                Back to Home
              </Link>
              <Link className="btn btn-secondary btn-lg" href="/dashboard">
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
