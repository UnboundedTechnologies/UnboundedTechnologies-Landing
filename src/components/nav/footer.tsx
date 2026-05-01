import Image from 'next/image';
import { PerfScorecard } from '@/components/perf-scorecard/perf-scorecard';
import { Link } from '@/i18n/routing';

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-4 gap-8 text-sm text-text-muted">
        <div>
          <div className="w-fit">
            <Image
              src="/ut-banner.png"
              alt="Unbounded Technologies Inc."
              width={1266}
              height={284}
              sizes="(min-width: 768px) 14rem, 11rem"
              className="h-10 md:h-12 w-auto max-w-full"
            />
            <div className="font-mono text-xs mt-3 flex justify-between">
              <span>Toronto</span>
              <span aria-hidden>·</span>
              <span>Ontario</span>
              <span aria-hidden>·</span>
              <span>Canada</span>
            </div>
          </div>
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
      <div className="relative border-t border-border py-6 px-6 text-center text-xs font-mono text-text-faint">
        <span>© 2026 Unbounded Technologies Inc.</span>
        {/* Perf chip floats to the right but doesn't push the centered
            copyright off-axis. Stacks below on mobile so it doesn't
            overlap the copyright text on narrow viewports. */}
        <div className="mt-3 flex justify-center md:mt-0 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
          <PerfScorecard />
        </div>
      </div>
    </footer>
  );
}
