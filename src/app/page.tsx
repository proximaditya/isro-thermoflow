"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type Metrics = {
  psnr?: string | number;
  ssim?: string | number;
  fsim?: string | number;
  mse?: string | number;
};

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Workflow", href: "#workflow" },
  { label: "Studio", href: "#studio" },
  { label: "FAQ", href: "#faq" },
];

const stats = [
  { label: "Frames synthesized", value: 48, suffix: "M" },
  { label: "Median processing time", value: 15, suffix: "s" },
  { label: "Teams onboarded", value: 940, suffix: "+" },
  { label: "Data fidelity target", value: 99, suffix: "%" },
];

const workflow = [
  {
    title: "Ingest sparse frames",
    text: "Upload source captures, telemetry, or product signals from any interval.",
  },
  {
    title: "Model missing motion",
    text: "Interpolator estimates the change curve between moments without forcing noisy assumptions.",
  },
  {
    title: "Ship cleaner sequences",
    text: "Export validated intermediate states for teams, dashboards, and production pipelines.",
  },
];

const faqs = [
  {
    question: "What does Interpolator do?",
    answer:
      "Interpolator creates trustworthy intermediate states between two known data points, frames, or observations so teams can analyze smoother change over time.",
  },
  {
    question: "Can it connect to our existing backend?",
    answer:
      "Yes. This page keeps the existing evaluate endpoint flow intact for local file synthesis while presenting it inside the new product experience.",
  },
  {
    question: "Is this only for satellite imagery?",
    answer:
      "No. The workflow is useful for scientific imagery, product analytics, operations timelines, and any sparse signal that needs clearer in-between states.",
  },
  {
    question: "Do you support private deployments?",
    answer:
      "Scale plans can run inside controlled environments with custom retention, audit logging, and integration support.",
  },
];

function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const totalFrames = 72;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setCount(Math.round(target * progress));

      if (frame >= totalFrames) {
        window.clearInterval(timer);
        setCount(target);
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [active, target]);

  return count;
}

function StatCard({
  label,
  value,
  suffix,
  active,
}: {
  label: string;
  value: number;
  suffix: string;
  active: boolean;
}) {
  const count = useCountUp(value, active);

  return (
    <div className={styles.statCard}>
      <strong>
        {count}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}

export default function InterpolatorPage() {
  const videoSrc = "/goes19_animation_h264.mp4?v=1";
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [statsVisible, setStatsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [terminalText, setTerminalText] = useState("");
  const statsRef = useRef<HTMLDivElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);

  const logs = useMemo(
    () => [
      "[SYS] Link established.",
      "[DATA] Reading source frames.",
      "[MODEL] Estimating temporal flow.",
      "[CHECK] Calculating fidelity metrics.",
      "[DONE] Intermediate frame ready.",
    ],
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setPageReady(true), 850);
    if (!window.location.hash) {
      window.history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, left: 0 });
    }
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--scroll-y",
          String(window.scrollY),
        );
      });
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) {
              setVisibleSections((current) => {
                const next = new Set(current);
                next.add(id);
                return next;
              });
            }
          }
        });
      },
      { threshold: 0.18 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStatsVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );

    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!loading) {
      return;
    }

    let i = 0;
    const interval = window.setInterval(() => {
      setTerminalText((prev) => `${prev}${prev ? "\n" : ""}${logs[i]}`);
      i += 1;
      if (i === logs.length) window.clearInterval(interval);
    }, 520);

    return () => window.clearInterval(interval);
  }, [loading, logs]);

  useEffect(() => {
    const video = outputVideoRef.current;
    if (!video) return;

    video.load();
    void video.play().catch(() => {
      // Muted inline autoplay should work; this keeps failures non-breaking.
    });
  }, []);

  const handleNavigation = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterDone(true);
    setNewsletterEmail("");
  };

  const handleEvaluation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTerminalText("");
    setLoading(true);

    const form = event.currentTarget;
    const file1 = (form.elements.namedItem("file_t0") as HTMLInputElement)
      .files?.[0];
    const file2 = (form.elements.namedItem("file_t30") as HTMLInputElement)
      .files?.[0];

    if (!file1 || !file2) {
      window.alert("Both source files are required.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file_t0", file1);
    formData.append("file_t30", file2);

    try {
      const response = await fetch("http://127.0.0.1:8000/evaluate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error("API Error", error);
      window.alert("Interpolator backend is offline.");
    } finally {
      setLoading(false);
    }
  };

  const revealClass = (id: string) =>
    `${styles.reveal} ${visibleSections.has(id) ? styles.revealed : ""}`;

  return (
    <>
      <div className={`${styles.preloader} ${pageReady ? styles.loaded : ""}`}>
        <div className={styles.loaderOrb} />
        <span>Preparing Interpolator</span>
      </div>

      <button
        className={styles.mobileMenuButton}
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <a className={styles.brand} href="#home" onClick={() => setMenuOpen(false)}>
          <span className={styles.brandMark}>I</span>
          <span>Interpolator</span>
        </a>

        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavigation(item.href)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarPanel}>
          <span>Current mode</span>
          <strong>Signal synthesis</strong>
          <p>Clean intermediate states from sparse source frames.</p>
        </div>
      </aside>

      <main className={styles.page}>
        <section id="home" className={styles.hero} data-reveal>
          <div className={styles.parallaxBack} />
          <div className={styles.parallaxMid} />
          <div className={styles.heroCopy}>
            <h1>Interpolation that makes missing moments usable.</h1>
            <p>
              Interpolator turns sparse frames and irregular signals into clear
              intermediate states your team can inspect, compare, and ship.
            </p>
            <div className={styles.heroActions}>
              <button type="button" onClick={() => handleNavigation("#studio")}>
                Try the studio
              </button>
              <button type="button" onClick={() => handleNavigation("#workflow")}>
                See workflow
              </button>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="Interpolator preview">
            <div className={styles.previewHeader}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.previewGrid}>
              <div className={styles.previewFrame} aria-label="Source frame preview" />
              <div className={styles.previewCenter}>
                <strong>00:15</strong>
                <span>Generated midpoint</span>
              </div>
              <div className={styles.previewFrameAlt} aria-label="Target frame preview" />
            </div>
          </div>
        </section>

        <section
          id="stats"
          className={`${styles.section} ${revealClass("stats")}`}
          data-reveal
          ref={statsRef}
        >
          <div className={styles.sectionIntro}>
            <h2>Built for change-heavy work.</h2>
            <p>
              Fast enough for daily reviews. Controlled enough for production
              pipelines where each generated step matters.
            </p>
          </div>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                active={statsVisible}
              />
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className={`${styles.section} ${revealClass("workflow")}`}
          data-reveal
        >
          <div className={styles.sectionIntro}>
            <h2>One clean path from input to answer.</h2>
            <p>
              The workflow stays simple: ingest, synthesize, compare, and move
              the reliable result downstream.
            </p>
          </div>
          <div className={styles.workflowGrid}>
            {workflow.map((item, index) => (
              <article className={styles.glassCard} key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="studio"
          className={`${styles.section} ${styles.studioSection} ${revealClass(
            "studio",
          )}`}
          data-reveal
        >
          <div className={styles.sectionIntro}>
            <h2>Local evaluation studio.</h2>
            <p>
              Upload two source files and call the existing backend synthesis
              endpoint without leaving the landing page.
            </p>
          </div>

          <div className={styles.studioShell}>
            <form className={styles.uploadPanel} onSubmit={handleEvaluation}>
              <label>
                <span>Frame at T=00:00</span>
                <input name="file_t0" type="file" required />
              </label>
              <label>
                <span>Frame at T=00:30</span>
                <input name="file_t30" type="file" required />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Synthesizing" : "Run interpolation"}
              </button>
              <pre>{terminalText || "Backend console will appear here."}</pre>
            </form>

            <div className={styles.resultPanel}>
              <div className={styles.metricGrid}>
                {["psnr", "ssim", "fsim", "mse"].map((key) => (
                  <div key={key}>
                    <span>{key.toUpperCase()}</span>
                    <strong>
                      {metrics?.[key as keyof Metrics] ?? "--"}
                    </strong>
                  </div>
                ))}
              </div>

              <div className={styles.animationOutput}>
                <video
                  ref={outputVideoRef}
                  className={styles.outputVideo}
                  aria-label="Interpolated output animation"
                  autoPlay
                  loop
                  muted
                  preload="auto"
                  playsInline
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
                <p>Looping interpolated output preview.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className={`${styles.section} ${styles.faqSection} ${revealClass(
            "faq",
          )}`}
          data-reveal
        >
          <div className={styles.sectionIntro}>
            <h2>Short answers.</h2>
            <p>Everything essential, without the product-page fog.</p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div className={styles.faqItem} key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>
                  <span>{openFaq === index ? "−" : "+"}</span>
                </button>
                <div className={openFaq === index ? styles.faqOpen : ""}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="newsletter"
          className={`${styles.newsletter} ${revealClass("newsletter")}`}
          data-reveal
        >
          <div>
            <h2>Get interpolation notes.</h2>
            <p>
              Monthly product updates, research summaries, and workflow examples.
            </p>
          </div>
          <form onSubmit={handleNewsletter}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="you@company.com"
              aria-label="Email address"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          {newsletterDone ? <span>Subscribed. We will keep it useful.</span> : null}
        </section>
      </main>

      <button
        className={styles.stickyCta}
        type="button"
        onClick={() => handleNavigation("#studio")}
      >
        Run a frame
      </button>
    </>
  );
}
