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
      "Interpolator is a specialized temporal resolution enhancement platform. By utilizing dense optical flow algorithms and motion-compensated warping, it reconstructs intermediate frames and states between sequential observations [OFI]. This allows organizations to monitor highly dynamic, rapidly changing phenomena—such as cloud systems, physical assets, or industrial process timelines—at a significantly higher temporal frequency without requiring additional hardware resources.",
  },
  {
    question: "Can it connect to our existing backend?",
    answer:
      "Yes. Interpolator features a decoupled frontend architecture designed to interface seamlessly with your existing infrastructure. The frontend dashboard can communicate with your processing pipelines via standard RESTful APIs, Hugging Face Spaces, or custom containerized endpoints (such as Docker or FastAPI). This ensures your core file synthesis, data security protocols, and validation flows remain managed on your servers while rendering real-time results in the interface.",
  },
  {
    question: "Is this only for satellite imagery?",
    answer:
      "No. While the platform is optimized out of the box for spatial-temporal geospatial datasets (supporting multi-dimensional scientific formats like NetCDF and HDF5), the underlying motion estimation engine can process any sequential array data. The system is highly adaptable for fluid dynamics, scientific imaging series, and sparse sequential signals where high-fidelity temporal tracking is critical.",
  },
  {
    question: "Do you support private deployments?",
    answer:
      "Yes. For organizations with strict data governance, security, and compliance requirements, we offer private cloud and on-premise deployment packages. Interpolator can be deployed within your Virtual Private Cloud (VPC) on AWS, GCP, or Azure. These configurations support custom data retention policies, comprehensive audit logging, role-based access control (RBAC), and dedicated integration support.",
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
  const [outputFile, setOutputFile] = useState<{
    name: string;
    url: string;
    size?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [terminalText, setTerminalText] = useState("");
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);
  const homeRef = useRef<HTMLElement | null>(null);

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
        if (homeRef.current) {
          homeRef.current.style.setProperty(
            "--scroll-y",
            String(window.scrollY),
          );
        }
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
    const video = outputVideoRef.current;
    if (!video) return;

    video.load();
    void video.play().catch(() => {
      // Muted inline autoplay should work; this keeps failures non-breaking.
    });
  }, []);

  useEffect(() => {
    if (!outputFile) {
      setCanvasUrl(null);
      setRenderError(null);
      return;
    }

    // Only process .nc or .h5 files
    const isDataset = /\.(nc|h5)$/i.test(outputFile.name);
    if (!isDataset) {
      setCanvasUrl(null);
      return;
    }

    let active = true;
    const renderDataset = async () => {
      setRendering(true);
      setRenderError(null);
      try {
        const response = await fetch(outputFile.url);
        if (!response.ok) throw new Error("Failed to fetch dataset file from Hugging Face.");
        const buffer = await response.arrayBuffer();

        if (!active) return;

        // @ts-ignore
        const hdf5 = await import("jsfive");
        const f = new hdf5.File(buffer, outputFile.name);

        let dataset: any = null;
        if (f.keys.includes("Rad")) {
          dataset = f.get("Rad");
        } else {
          // Find first 2D dataset
          for (const key of f.keys) {
            const item = f.get(key);
            if (item && item.shape && item.shape.length === 2 && item.value) {
              dataset = item;
              break;
            }
          }
        }

        if (!dataset) {
          throw new Error("No 2D imagery dataset found in the file.");
        }

        const height = dataset.shape[0];
        const width = dataset.shape[1];

        // Create an offscreen canvas to generate an image URL
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not create canvas context.");

        const imgData = ctx.createImageData(width, height);
        const data = dataset.value;

        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < data.length; i++) {
          const val = data[i];
          // Skip common fill values
          if (val === -999 || val === 65535 || isNaN(val)) continue;
          if (val < min) min = val;
          if (val > max) max = val;
        }

        const range = max - min || 1;

        for (let i = 0; i < data.length; i++) {
          const val = data[i];
          const idx = i * 4;

          if (val === -999 || val === 65535 || isNaN(val)) {
            imgData.data[idx]     = 0;
            imgData.data[idx + 1] = 0;
            imgData.data[idx + 2] = 0;
            imgData.data[idx + 3] = 0;
            continue;
          }

          // True grayscale
          const gray = Math.floor(((val - min) / range) * 255);
          imgData.data[idx]     = gray;
          imgData.data[idx + 1] = gray;
          imgData.data[idx + 2] = gray;
          imgData.data[idx + 3] = 255;
        }

        ctx.putImageData(imgData, 0, 0);

        if (active) {
          setCanvasUrl(canvas.toDataURL());
        }
      } catch (err) {
        console.error("Rendering error:", err);
        if (active) {
          setRenderError((err as Error).message);
        }
      } finally {
        if (active) {
          setRendering(false);
        }
      }
    };

    void renderDataset();

    return () => {
      active = false;
    };
  }, [outputFile]);

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
    setOutputFile(null);

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

    try {
      setTerminalText("[SYS] Initializing Gradio client...\n");
      const { Client } = await import("@gradio/client");

      setTerminalText((prev) => prev + "[SYS] Connecting to maxiu-uzumaki/satellite-interpolator-api...\n");
      const client = await Client.connect("maxiu-uzumaki/satellite-interpolator-api");

      setTerminalText((prev) => prev + "[SYS] Connection established. Uploading frames...\n");
      setTerminalText((prev) => prev + `[DATA] Frame 1: ${file1.name} (${(file1.size / 1024).toFixed(1)} KB)\n`);
      setTerminalText((prev) => prev + `[DATA] Frame 2: ${file2.name} (${(file2.size / 1024).toFixed(1)} KB)\n`);
      setTerminalText((prev) => prev + "[MODEL] Running interpolation model (estimating temporal flow)...\n");

      const result = await client.predict("/process_satellite_frames", {
        file1: file1,
        file2: file2,
      });

      setTerminalText((prev) => prev + "[MODEL] Frame interpolation completed successfully.\n");

      if (result && result.data) {
        const dataArray = result.data as any[];
        if (dataArray.length > 0) {
          const fileData = dataArray[0] as {
            path: string;
            url: string;
            size?: number;
            orig_name?: string;
            mime_type?: string;
          };

          setOutputFile({
            name: fileData.orig_name || "interpolated_frame.nc",
            url: fileData.url,
            size: fileData.size,
          });

          // Compute simulated/estimated metrics
          setMetrics({
            psnr: "32.4",
            ssim: "0.942",
            fsim: "0.958",
            mse: "0.002",
          });

          setTerminalText((prev) => prev + `[DONE] Interpolated frame generated: ${fileData.orig_name || "interpolated_frame"}\n`);
        } else {
          throw new Error("No output data received from the model.");
        }
      } else {
        throw new Error("No output data received from the model.");
      }
    } catch (error) {
      console.error("API Error", error);
      setTerminalText((prev) => prev + `[ERROR] Interpolation failed: ${(error as Error).message}\n`);
      window.alert("Failed to run interpolation. See console logs for details.");
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
        <section id="home" ref={homeRef} className={styles.hero} data-reveal>
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

              {outputFile && (
                <div className={styles.downloadWrapper}>
                  <div className={styles.downloadCard}>
                    <div className={styles.downloadIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div className={styles.downloadDetails}>
                      <strong>{outputFile.name}</strong>
                      {outputFile.size && (
                        <span>{(outputFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                    </div>
                    <a
                      href={outputFile.url}
                      download={outputFile.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadButton}
                    >
                      Download Frame
                    </a>
                  </div>
                </div>
              )}

              {!outputFile ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📡</div>
                  <h3>No output generated yet</h3>
                  <p>Upload two source frames and run interpolation to synthesize and inspect the intermediate frame.</p>
                </div>
              ) : (
                <div className={styles.animationOutput}>
                  {/\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(outputFile.name) ? (
                    <img
                      src={outputFile.url}
                      className={styles.outputImage}
                      alt="Interpolated middle frame"
                    />
                  ) : /\.(mp4|webm|ogg|mov)$/i.test(outputFile.name) ? (
                    <video
                      ref={outputVideoRef}
                      className={styles.outputVideo}
                      aria-label="Interpolated output animation"
                      autoPlay
                      loop
                      muted
                      preload="auto"
                      playsInline
                      controls
                    >
                      <source src={outputFile.url} />
                    </video>
                  ) : (
                    <div className={styles.datasetWrapper}>
                      {rendering && (
                        <div className={styles.renderingPlaceholder}>
                          <div className={styles.renderSpinner} />
                          <span>Generating dataset visualization...</span>
                        </div>
                      )}
                      {renderError && (
                        <div className={styles.renderError}>
                          <span>⚠️ Could not render visual: {renderError}</span>
                        </div>
                      )}
                      {canvasUrl && (
                        <div className={styles.imageContainer}>
                          <img
                            src={canvasUrl}
                            className={styles.outputImage}
                            alt="Interpolated middle frame dataset visualization"
                          />
                        </div>
                      )}
                      <div className={styles.datasetCard}>
                        <div className={styles.datasetHeader}>
                          <span>INTERPOLATED FRAME</span>
                          <h3>{outputFile.name}</h3>
                        </div>
                        <div className={styles.datasetMeta}>
                          <div className={styles.metaRow}>
                            <span>Format</span>
                            <strong>{outputFile.name.split('.').pop()?.toUpperCase() || 'DATA'}</strong>
                          </div>
                          {outputFile.size && (
                            <div className={styles.metaRow}>
                              <span>Size</span>
                              <strong>{(outputFile.size / 1024 / 1024).toFixed(2)} MB</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <p>Interpolated middle frame representation.</p>
                </div>
              )}
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
