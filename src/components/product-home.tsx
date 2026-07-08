import {
  Archive,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Database,
  ExternalLink,
  FileClock,
  Fingerprint,
  LockKeyhole,
  Play,
  ShieldCheck,
  Siren,
  TerminalSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const repoUrl = "https://github.com/neelpote/ai-incident-black-box";

const workflow = [
  {
    time: "10:02",
    title: "Deploy shipped",
    detail: "Release metadata enters the incident capsule.",
  },
  {
    time: "10:05",
    title: "Alert fired",
    detail: "Logs, dashboard notes, and screenshots become evidence.",
  },
  {
    time: "10:07",
    title: "Agent investigates",
    detail: "The agent cites evidence and separates facts from unknowns.",
  },
  {
    time: "10:12",
    title: "Capsule stored",
    detail: "Filecoin Pin returns CID, piece CID, and retrieval proof path.",
  },
];

const proofItems = [
  "Raw alert text",
  "Service logs",
  "Deploy metadata",
  "Agent timeline",
  "Root-cause summary",
  "Postmortem hash",
];

const capabilities = [
  {
    icon: <Siren size={20} />,
    title: "Incident intake",
    text: "Collect alert text, logs, deployment notes, on-call notes, and screenshot evidence in one place.",
  },
  {
    icon: <TerminalSquare size={20} />,
    title: "AI triage",
    text: "Generate a conservative timeline, suspected root cause, immediate fix, and prevention checklist.",
  },
  {
    icon: <Fingerprint size={20} />,
    title: "Evidence manifest",
    text: "Hash every input and output so the final postmortem can be checked against the original record.",
  },
  {
    icon: <Database size={20} />,
    title: "Filecoin archive",
    text: "Store the Incident Capsule through Filecoin Pin when credentials are configured.",
  },
  {
    icon: <ClipboardCheck size={20} />,
    title: "Verification",
    text: "Retrieve the archived capsule by CID and compare hashes before trusting the postmortem.",
  },
  {
    icon: <LockKeyhole size={20} />,
    title: "Demo-safe fallback",
    text: "Mock mode keeps the same receipt interface when a funded Filecoin wallet is not available.",
  },
];

export function ProductHome() {
  return (
    <main className="min-h-screen bg-[var(--recorder-black)] text-[var(--paper-white)]">
      <SiteNav />
      <HeroSection />
      <ProofConsole />
      <CapabilitySection />
      <ArchitectureSection />
      <SubmissionSection />
    </main>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(16,17,18,0.94)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <Image
            src="/blackboxops-logo.svg"
            alt="AI Incident Black Box logo"
            width={42}
            height={42}
            priority
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--signal-amber)]">
              Filecoin recorder
            </p>
            <p className="text-sm font-semibold sm:text-base">
              AI Incident Black Box
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-paper)] md:flex">
          <a className="hover:text-[var(--paper-white)]" href="#proof">
            Proof
          </a>
          <a className="hover:text-[var(--paper-white)]" href="#architecture">
            Architecture
          </a>
          <a className="hover:text-[var(--paper-white)]" href="#submit">
            Submission
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="hidden h-10 items-center justify-center gap-2 border border-[var(--line)] px-3 text-sm text-[var(--muted-paper)] transition hover:border-[var(--paper-white)] hover:text-[var(--paper-white)] sm:inline-flex"
            href={repoUrl}
            target="_blank"
          >
            <ExternalLink size={16} />
            Repo
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 bg-[var(--signal-amber)] px-4 text-sm font-semibold text-[var(--recorder-black)] transition hover:bg-[var(--paper-white)]"
            href="/console"
          >
            Open console
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-[var(--line)] bg-[var(--panel-graphite)] px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--proof-cyan)]">
              <span className="h-2 w-2 bg-[var(--proof-cyan)]" />
              Filecoin TLDR Cycle 2
            </div>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              The black box recorder for AI-powered incident response.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-paper)]">
              Capture outage evidence, let an agent build a conservative root-cause timeline, then store the Incident Capsule on Filecoin so the postmortem can be retrieved and verified later.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Capsule" value="CID" />
            <Metric label="Evidence" value="SHA-256" />
            <Metric label="Storage" value="Filecoin Pin" />
          </div>
        </div>

        <div className="flex items-center">
          <RecorderSurface />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel-graphite)] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-paper)]">
        {label}
      </p>
      <p className="mt-3 font-mono text-xl text-[var(--paper-white)]">{value}</p>
    </div>
  );
}

function RecorderSurface() {
  return (
    <div className="w-full border border-[var(--line)] bg-[var(--panel-graphite)] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.38)]">
      <div className="border border-[var(--signal-amber)] bg-[var(--recorder-black)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center border border-[var(--signal-amber)] text-[var(--signal-amber)]">
              <FileClock size={20} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-paper)]">
                Incident capsule
              </p>
              <p className="font-semibold">payment-webhook-outage</p>
            </div>
          </div>
          <span className="border border-[var(--failure-red)] px-3 py-1 font-mono text-xs text-[var(--failure-red)]">
            SEV2
          </span>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.82fr]">
          <div className="space-y-3">
            {workflow.map((item) => (
              <div
                className="grid grid-cols-[64px_1fr] border border-[var(--line)] bg-[var(--field-gray)]"
                key={item.time}
              >
                <div className="border-r border-[var(--line)] p-3 font-mono text-sm text-[var(--signal-amber)]">
                  {item.time}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-paper)]">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-[var(--line)] bg-[var(--field-gray)] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--proof-cyan)]">
              Verification receipt
            </p>
            <div className="mt-4 space-y-4">
              <Receipt label="Root CID" value="bafy...553t4" />
              <Receipt label="Piece CID" value="bafk...wfq" />
              <Receipt label="Manifest" value="sha256:6eb9...807" />
            </div>
            <div className="mt-5 flex items-center gap-2 border border-[var(--proof-cyan)] p-3 text-[var(--proof-cyan)]">
              <CheckCircle2 size={18} />
              <span className="font-mono text-xs uppercase tracking-[0.14em]">
                Retrieved and verified
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--line)] p-4 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--signal-amber)] px-4 text-sm font-semibold text-[var(--recorder-black)] transition hover:bg-[var(--paper-white)]"
            href="/console"
          >
            <Play size={16} />
            Run sample incident
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted-paper)] transition hover:border-[var(--proof-cyan)] hover:text-[var(--proof-cyan)]"
            href={repoUrl}
            target="_blank"
          >
            <ExternalLink size={16} />
            View source
          </Link>
        </div>
      </div>
    </div>
  );
}

function Receipt({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-paper)]">
        {label}
      </p>
      <p className="hash-break mt-1 font-mono text-sm text-[var(--paper-white)]">
        {value}
      </p>
    </div>
  );
}

function ProofConsole() {
  return (
    <section id="proof" className="border-b border-[var(--line)]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <SectionIntro
          eyebrow="Why it exists"
          title="AI agents need an audit trail before they touch production."
          text="The product records what the agent saw, what it inferred, what it recommended, and what evidence supports the postmortem."
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {proofItems.map((item) => (
            <div
              className="flex min-h-28 flex-col justify-between border border-[var(--line)] bg-[var(--panel-graphite)] p-4"
              key={item}
            >
              <Archive className="text-[var(--proof-cyan)]" size={20} />
              <p className="mt-6 text-sm font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitySection() {
  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Production surface"
          title="Built like an operational console, not a chatbot."
          text="The dashboard is evidence-first: every agent conclusion points back to a source, a hash, and a retrieval path."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map((item) => (
            <div
              className="border border-[var(--line)] bg-[var(--panel-graphite)] p-5"
              key={item.title}
            >
              <div className="grid h-10 w-10 place-items-center border border-[var(--line)] text-[var(--signal-amber)]">
                {item.icon}
              </div>
              <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-paper)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="border-b border-[var(--line)]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionIntro
          eyebrow="Filecoin path"
          title="The storage adapter is ready for real Filecoin Pin uploads."
          text="Mock mode keeps the public demo usable. Real mode uses server-side Filecoin Pin with a funded wallet and verifies by retrieving the archived capsule."
        />
        <div className="border border-[var(--line)] bg-[var(--panel-graphite)] p-4">
          {[
            ["Intake", "Logs, alert text, deploy metadata, notes"],
            ["Agent", "Timeline, root cause, recommended fix"],
            ["Capsule", "JSON bundle plus manifest and SHA-256 hashes"],
            ["Filecoin Pin", "CID, piece CID, data set, retrieval URL"],
            ["Verify", "Retrieve capsule and compare manifest hash"],
          ].map(([label, value], index, list) => (
            <div className="grid grid-cols-[110px_1fr]" key={label}>
              <div className="border-r border-[var(--line)] py-4 pr-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--signal-amber)]">
                {label}
              </div>
              <div
                className={`py-4 pl-4 text-sm leading-6 text-[var(--paper-white)] ${
                  index < list.length - 1 ? "border-b border-[var(--line)]" : ""
                }`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SubmissionSection() {
  return (
    <section id="submit">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--proof-cyan)]">
            Hackathon-ready
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A complete demo story for Filecoin TLDR Cycle 2.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-paper)]">
            The repo includes submission copy, the logo, a build plan, tests, mock mode, and real Filecoin Pin wiring for a funded Calibration wallet.
          </p>
        </div>
        <div className="border border-[var(--line)] bg-[var(--panel-graphite)] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-[var(--proof-cyan)]" size={22} />
            <div>
              <h3 className="text-lg font-semibold">Run the live console</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-paper)]">
                Load the sample outage, generate the incident timeline, store a capsule, and verify the receipt.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--signal-amber)] px-4 text-sm font-semibold text-[var(--recorder-black)] transition hover:bg-[var(--paper-white)]"
              href="/console"
            >
              Open console
              <ArrowRight size={16} />
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted-paper)] transition hover:border-[var(--paper-white)] hover:text-[var(--paper-white)]"
              href={repoUrl}
              target="_blank"
            >
              GitHub repo
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--signal-amber)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-paper)]">
        {text}
      </p>
    </div>
  );
}
