
const Footer = () => (
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
                        The intelligent task management platform built for modern engineering
                        teams. Powered by Spring Boot.
                    </p>
                </div>
                <div>
                    <div className="footer-col-title">Product</div>
                    <ul className="footer-links">
                        <li>
                            <a onclick="showPage('dashboard')">Dashboard</a>
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

)

export default Footer;