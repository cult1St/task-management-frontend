"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);

  return (
    <div id="page-home" className="page active">
      {/* Navbar */}
      <nav className="navbar">
        <Link className="navbar-brand" href="/" onClick={() => setIsGuestMenuOpen(false)}>
          <div className="brand-icon">TF</div>
          <span className="brand-name">
            Task<span>Flow</span>
          </span>
        </Link>
        <ul className="nav-links">
          <li>
            <a href="#features" className="active">
              Features
            </a>
          </li>
          <li>
            <a href="#how">How It Works</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
          <li>
            <button>
              About
            </button>
          </li>
        </ul>
        <div className="nav-cta">
          <Link className="btn btn-outline" href='/login'>
            Sign In
          </Link>
          <Link className="btn btn-primary" href='/register'>
            Get Started Free
          </Link>
        </div>
        <button className={`hamburger guest-hamburger ${isGuestMenuOpen ? "is-active" : ""}`} onClick={() => setIsGuestMenuOpen((prev) => !prev)} aria-label="Toggle navigation" aria-expanded={isGuestMenuOpen}>
          <span />
          <span />
          <span />
        </button>
      </nav>
      {isGuestMenuOpen ? (
        <div className="guest-mobile-menu">
          <a href="#features" onClick={() => setIsGuestMenuOpen(false)}>Features</a>
          <a href="#how" onClick={() => setIsGuestMenuOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setIsGuestMenuOpen(false)}>Pricing</a>
          <Link href="/login" onClick={() => setIsGuestMenuOpen(false)}>Sign In</Link>
          <Link href="/register" onClick={() => setIsGuestMenuOpen(false)}>Get Started Free</Link>
        </div>
      ) : null}
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              Trusted by 40,000+ teams worldwide
            </div>
            <h1 className="hero-title">
              Organize work,
              <br />
              <span className="accent">deliver faster.</span>
            </h1>
            <p className="hero-sub">
              TaskFlow is the intelligent task management system built for
              engineering teams. Track projects, collaborate in real-time, and ship
              with confidence.
            </p>
            <div className="hero-actions">
              <Link
                className="btn btn-primary btn-lg"
                href='/register'
              >
                ⚡ Start Free — No credit card
              </Link>
              <button
                className="btn btn-secondary btn-lg"
              >
                ▶ Live Demo
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">40K+</div>
                <div className="hero-stat-label">Active teams</div>
              </div>
              <div>
                <div className="hero-stat-num">2M+</div>
                <div className="hero-stat-label">Tasks completed</div>
              </div>
              <div>
                <div className="hero-stat-num">99.9%</div>
                <div className="hero-stat-label">Uptime SLA</div>
              </div>
            </div>
          </div>
          {/* Hero Visual */}
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="dp-header">
                <div className="dp-dot" />
                <div className="dp-dot" />
                <div className="dp-dot" />
                <span className="dp-title">taskflow.app/dashboard</span>
              </div>
              <div className="dp-board">
                <div>
                  <div className="dp-col-title">📋 To Do</div>
                  <div className="dp-task">
                    <div className="dp-task-title">Redesign auth flow</div>
                    <div className="dp-task-meta">
                      <span className="dp-tag tag-rose">High</span>
                      <span className="dp-avatar avatar-a">AJ</span>
                    </div>
                  </div>
                  <div className="dp-task">
                    <div className="dp-task-title">Write API docs</div>
                    <div className="dp-task-meta">
                      <span className="dp-tag tag-teal">Low</span>
                      <span className="dp-avatar avatar-b">SK</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="dp-col-title">🚧 In Progress</div>
                  <div className="dp-task">
                    <div className="dp-task-title">Mobile notifications</div>
                    <div className="dp-task-meta">
                      <span className="dp-tag tag-amber">Medium</span>
                      <span className="dp-avatar avatar-c">ML</span>
                    </div>
                  </div>
                  <div className="dp-task">
                    <div className="dp-task-title">Dashboard charts</div>
                    <div className="dp-task-meta">
                      <span className="dp-tag tag-violet">High</span>
                      <span className="dp-avatar avatar-a">AJ</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="dp-col-title">✅ Done</div>
                  <div className="dp-task">
                    <div className="dp-task-title">User auth backend</div>
                    <div className="dp-task-meta">
                      <span className="dp-tag tag-green">Done</span>
                      <span className="dp-avatar avatar-b">SK</span>
                    </div>
                  </div>
                  <div className="dp-task">
                    <div className="dp-task-title">Database schema</div>
                    <div className="dp-task-meta">
                      <span className="dp-tag tag-green">Done</span>
                      <span className="dp-avatar avatar-c">ML</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-float hero-float-1">
              <div className="float-label">Tasks completed today</div>
              <div className="float-value">+12 ✦</div>
            </div>
            <div className="hero-float hero-float-2">
              <div className="float-label">Team velocity</div>
              <div className="float-value" style={{ color: "var(--amber-400)" }}>
                94%
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="section" id="features">
        <div className="section-inner">
          <span className="section-label">// Features</span>
          <h2 className="section-title">
            Everything your team needs
            <br />
            to move fast
          </h2>
          <p className="section-sub">
            Built for modern software teams — designed to eliminate chaos and focus
            on what matters.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon bg-teal">📋</div>
              <h3 className="feature-title">Kanban Boards</h3>
              <p className="feature-desc">
                Visual drag-and-drop boards to track task progress across sprints.
                Customize columns to match your workflow.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon bg-violet">👥</div>
              <h3 className="feature-title">Team Collaboration</h3>
              <p className="feature-desc">
                Assign tasks, mention teammates, share files, and stay in sync with
                real-time activity feeds.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon bg-amber">📅</div>
              <h3 className="feature-title">Calendar View</h3>
              <p className="feature-desc">
                See all your tasks and deadlines in a calendar. Never miss a due
                date with smart reminder notifications.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon bg-rose">⚡</div>
              <h3 className="feature-title">Sprint Planning</h3>
              <p className="feature-desc">
                Plan and manage agile sprints. Set story points, track velocity, and
                run retrospectives with ease.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon bg-green">📊</div>
              <h3 className="feature-title">Analytics &amp; Reports</h3>
              <p className="feature-desc">
                Burn-down charts, completion rates, and team performance reports to
                optimize your delivery pipeline.
              </p>
            </div>
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: "rgba(56,189,248,0.1)" }}
              >
                🔗
              </div>
              <h3 className="feature-title">API-First Design</h3>
              <p className="feature-desc">
                Full RESTful API with Swagger docs. Integrate with GitHub, Slack,
                Jira, and any tool in your stack.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* How it works */}
      <section className="section how-it-works" id="how">
        <div className="section-inner">
          <span className="section-label">// How It Works</span>
          <h2 className="section-title">Up and running in minutes</h2>
          <p className="section-sub">
            Four simple steps from account creation to your first shipped sprint.
          </p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3 className="step-title">Create Account</h3>
              <p className="step-desc">
                Sign up in seconds. No credit card needed. Bring your whole team.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">Set Up Project</h3>
              <p className="step-desc">
                Create a project, configure your board columns, and invite your team
                members.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Add &amp; Assign Tasks</h3>
              <p className="step-desc">
                Break down work into tasks, set priorities, assign owners, and
                define due dates.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">04</div>
              <h3 className="step-title">Track &amp; Ship</h3>
              <p className="step-desc">
                Monitor progress with real-time dashboards and ship features on
                schedule.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing */}
      <section className="section" id="pricing">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <span className="section-label">// Pricing</span>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            Start free. Scale as you grow. No hidden fees, ever.
          </p>
          <div className="pricing-grid">
            {/* Free */}
            <div className="pricing-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">
                <span>$</span>0<sub>/mo</sub>
              </div>
              <div className="plan-desc">
                Perfect for individuals and small teams getting started.
              </div>
              <ul className="plan-features">
                <li>
                  <span className="plan-check">✓</span> Up to 3 projects
                </li>
                <li>
                  <span className="plan-check">✓</span> 5 team members
                </li>
                <li>
                  <span className="plan-check">✓</span> Basic kanban board
                </li>
                <li>
                  <span className="plan-check">✓</span> 1 GB storage
                </li>
                <li>
                  <span className="plan-check no">✕</span>{" "}
                  <span style={{ opacity: "0.5" }}>Sprint planning</span>
                </li>
                <li>
                  <span className="plan-check no">✕</span>{" "}
                  <span style={{ opacity: "0.5" }}>Analytics</span>
                </li>
              </ul>
              <button
                className="btn btn-outline"
                style={{ width: "100%" }}
              >
                Get Started Free
              </button>
            </div>
            {/* Pro (featured) */}
            <div className="pricing-card featured">
              <div className="pricing-badge">⚡ MOST POPULAR</div>
              <div className="plan-name" style={{ color: "var(--teal-400)" }}>
                Pro
              </div>
              <div className="plan-price">
                <span>$</span>18<sub>/mo</sub>
              </div>
              <div className="plan-desc">
                For growing teams that need more power and flexibility.
              </div>
              <ul className="plan-features">
                <li>
                  <span className="plan-check">✓</span> Unlimited projects
                </li>
                <li>
                  <span className="plan-check">✓</span> Up to 25 members
                </li>
                <li>
                  <span className="plan-check">✓</span> Full kanban + sprint board
                </li>
                <li>
                  <span className="plan-check">✓</span> 50 GB storage
                </li>
                <li>
                  <span className="plan-check">✓</span> Analytics &amp; reports
                </li>
                <li>
                  <span className="plan-check">✓</span> API access
                </li>
              </ul>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                Start 14-day trial
              </button>
            </div>
            {/* Enterprise */}
            <div className="pricing-card">
              <div className="plan-name">Enterprise</div>
              <div className="plan-price">
                <span style={{ fontSize: "1.5rem", marginTop: "0.3rem" }}>
                  Custom
                </span>
              </div>
              <div className="plan-desc">
                For large organizations with advanced security and compliance needs.
              </div>
              <ul className="plan-features">
                <li>
                  <span className="plan-check">✓</span> Unlimited everything
                </li>
                <li>
                  <span className="plan-check">✓</span> SSO &amp; SAML
                </li>
                <li>
                  <span className="plan-check">✓</span> Audit logs
                </li>
                <li>
                  <span className="plan-check">✓</span> Dedicated support
                </li>
                <li>
                  <span className="plan-check">✓</span> SLA guarantee
                </li>
                <li>
                  <span className="plan-check">✓</span> Custom integrations
                </li>
              </ul>
              <button className="btn btn-outline" style={{ width: "100%" }}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Banner */}
      <section className="section">
        <div className="section-inner">
          <div className="cta-banner">
            <h2 className="cta-title">
              Ready to transform how
              <br />
              your team works?
            </h2>
            <p className="cta-sub">
              Join 40,000+ teams shipping faster with TaskFlow. Free forever,
              upgrade anytime.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap"
              }}
            >
              <button
                className="btn btn-primary btn-lg"
              >
                ⚡ Create Free Account
              </button>
              <button
                className="btn btn-secondary btn-lg"
              >
                Watch Demo →
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div
                className="navbar-brand"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "0.75rem"
                }}
              >
                <div className="brand-icon">⚡</div>
                <span className="brand-name">
                  Task<span>Flow</span>
                </span>
              </div>
              <p className="footer-brand-desc">
                The intelligent task management platform built for modern
                engineering teams. Powered by Spring Boot.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-links">
                <li>
                  <a>Dashboard</a>
                </li>
                <li>
                  <a>Features</a>
                </li>
                <li>
                  <a>Pricing</a>
                </li>
                <li>
                  <a>Changelog</a>
                </li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Developers</div>
              <ul className="footer-links">
                <li>
                  <a>API Docs</a>
                </li>
                <li>
                  <a>Spring Boot Guide</a>
                </li>
                <li>
                  <a>Webhooks</a>
                </li>
                <li>
                  <a>Status</a>
                </li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li>
                  <a>About</a>
                </li>
                <li>
                  <a>Blog</a>
                </li>
                <li>
                  <a>Careers</a>
                </li>
                <li>
                  <a>Privacy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">
              © 2026 TaskFlow Inc. All rights reserved.
            </div>
            <div className="footer-copy">
              Built with ❤️ on Spring Boot &amp; React
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}