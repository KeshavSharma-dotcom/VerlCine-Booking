import React from "react"
import { Link } from "react-router-dom"
import "../../assets/styles/footer.css"

export const Footer = ({
    selectedCity = "Delhi NCR",
    socialLinks = {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        x: "https://x.com"
    }
}) => {
    return (
        <footer className="cine-footer-root">
            <div className="cine-footer-container">
                <div className="cine-footer-main-grid">
                    <div className="cine-footer-brand-pane">
                        <Link to="/" className="cine-footer-logo">
                            Cine<span>Verl</span>
                        </Link>
                        <p className="cine-footer-desc">
                            Your premier gateway for instant seat reservations, multiplex screenings, and live auditorium events.
                        </p>
                        {selectedCity && (
                            <div className="cine-footer-location-pill">
                                <span className="cine-footer-pin">📍</span>
                                <span>Active City: <strong>{selectedCity}</strong></span>
                            </div>
                        )}
                    </div>

                    <div className="cine-footer-nav-col">
                        <h4 className="cine-footer-col-header">Explore</h4>
                        <ul className="cine-footer-links">
                            <li><Link to="/">Now Playing</Link></li>
                            <li><Link to="/shows">Live Standups</Link></li>
                            <li><Link to="/theatres">Cinemas Near You</Link></li>
                            <li><Link to="/upcoming">Upcoming Releases</Link></li>
                        </ul>
                    </div>

                    <div className="cine-footer-nav-col">
                        <h4 className="cine-footer-col-header">Company</h4>
                        <ul className="cine-footer-links">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/press">Press & Media</Link></li>
                            <li><Link to="/support">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div className="cine-footer-nav-col">
                        <h4 className="cine-footer-col-header">Legal</h4>
                        <ul className="cine-footer-links">
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/refunds">Refund Policy</Link></li>
                            <li><Link to="/security">Trust & Safety</Link></li>
                        </ul>
                    </div>

                    <div className="cine-footer-social-col">
                        <h4 className="cine-footer-col-header">Connect With Us</h4>
                        <p className="cine-footer-social-sub">Follow us for movie updates, premiere tickets, and promos.</p>
                        <div className="cine-footer-social-bar">
                            {socialLinks.instagram && (
                                <a
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="cine-social-btn instagram"
                                    aria-label="Instagram"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </a>
                            )}

                            {socialLinks.facebook && (
                                <a
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="cine-social-btn facebook"
                                    aria-label="Facebook"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </a>
                            )}

                            {socialLinks.youtube && (
                                <a
                                    href={socialLinks.youtube}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="cine-social-btn youtube"
                                    aria-label="YouTube"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            )}

                            {socialLinks.x && (
                                <a
                                    href={socialLinks.x}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="cine-social-btn x-twitter"
                                    aria-label="X (formerly Twitter)"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="cine-footer-bottom-bar">
                    <p>© {new Date().getFullYear()} CineVerl Entertainment Inc. All rights reserved.</p>
                    <div className="cine-footer-security-tags">
                        <span className="cine-tag-item">🔒 256-Bit SSL Encrypted</span>
                        <span className="cine-tag-divider">•</span>
                        <span className="cine-tag-item">🎟️ Instant QR Check-in</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer