import { Link } from '@/i18n/routing';

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-4 gap-8 text-sm text-text-muted">
        <div>
          <div className="font-semibold text-text">∞ Unbounded Technologies Inc.</div>
          <div className="font-mono text-xs mt-3">Toronto · Ontario · Canada</div>
        </div>
        <div>
          <div className="font-mono uppercase text-xs tracking-widest text-text-faint mb-3">
            Sitemap
          </div>
          <ul className="space-y-2">
            <li>
              <Link href="/work" className="hover:text-text">
                Work
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-text">
                Services
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-text">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-text">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-mono uppercase text-xs tracking-widest text-text-faint mb-3">
            Legal
          </div>
          <ul className="space-y-2">
            <li>
              <Link href="/legal/privacy" className="hover:text-text">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-text">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-mono uppercase text-xs tracking-widest text-text-faint mb-3">
            Find us
          </div>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.linkedin.com/in/said-aissani/"
                className="hover:text-text"
                rel="noopener noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/UnboundedTechnologies"
                className="hover:text-text"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://gitlab.com/UnboundedTechnologies"
                className="hover:text-text"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitLab
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs font-mono text-text-faint">
        © 2026 Unbounded Technologies Inc.
      </div>
    </footer>
  );
}
