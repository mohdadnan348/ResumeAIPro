// components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Sparkles, Heart } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Changelog', href: '/changelog' },
    ],
    Resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Blog', href: '/blog' },
      { label: 'Support', href: '/support' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@resumeai.pro', label: 'Email' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Sparkles size={24} />
              </div>
              <span className={styles.logoText}>
                Resume<span className={styles.logoHighlight}>AI</span>
                <span className={styles.logoPro}>Pro</span>
              </span>
            </Link>
            <p className={styles.description}>
              AI-powered ATS resume scoring system that helps you land your dream job.
              Get instant feedback and improve your resume with our intelligent analysis.
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          <div className={styles.linksContainer}>
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className={styles.linkGroup}>
                <h3 className={styles.linkGroupTitle}>{category}</h3>
                <ul className={styles.linkList}>
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={styles.link}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={styles.newsletterSection}>
          <div className={styles.newsletterContent}>
            <h3 className={styles.newsletterTitle}>Stay Updated</h3>
            <p className={styles.newsletterDescription}>
              Get the latest updates about new features and AI improvements.
            </p>
          </div>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterButton}>
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} ResumeAI Pro. All rights reserved.
          </p>
          <p className={styles.madeWith}>
            Made with <Heart size={14} className={styles.heartIcon} /> for job seekers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;