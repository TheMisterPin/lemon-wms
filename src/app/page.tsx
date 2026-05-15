import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Layers,
  Package,
  Scan,
  Shield,
  Users,
  Zap,
} from 'lucide-react'

import LemonHeader from '@/components/primitives/typography/lemon-header'

const FEATURES = [
  {
    icon: Building2,
    title: 'Warehouse Hierarchy',
    description:
      'Organize your operation into warehouses, zones, and bins. Navigate any level of your floor at a glance.',
    iconBg: 'var(--entity-warehouse-soft)',
    iconColor: 'var(--entity-warehouse)',
  },
  {
    icon: Package,
    title: 'Bin-Level Inventory',
    description:
      'Know exactly where every SKU lives. Real-time accuracy down to the individual bin.',
    iconBg: 'var(--entity-bin-soft)',
    iconColor: 'var(--entity-bin)',
  },
  {
    icon: BarChart3,
    title: 'Office Dashboard',
    description:
      'Managers see the full picture — utilization, activity, and warehouse health in one view.',
    iconBg: 'var(--dash-blue-dim)',
    iconColor: 'var(--dash-blue)',
  },
  {
    icon: Scan,
    title: 'Floor Execution',
    description:
      'Workers sign in with badge + PIN on any terminal. A fast, task-focused UI built for the floor.',
    iconBg: 'var(--dash-green-dim)',
    iconColor: 'var(--dash-green)',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description:
      'Owners, office managers, and warehouse workers each see only what they need.',
    iconBg: 'var(--dash-amber-dim)',
    iconColor: 'var(--dash-amber)',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description:
      'JWT sessions, device-bound floor logins, and scoped permissions at every layer.',
    iconBg: 'var(--dash-red-dim)',
    iconColor: 'var(--dash-red)',
  },
] as const

const STATS = [
  { value: '3-level', label: 'Location hierarchy' },
  { value: '5 roles', label: 'Access control tiers' },
  { value: 'Real-time', label: 'Inventory visibility' },
  { value: 'Dual UX', label: 'Office + floor interfaces' },
] as const

export default function LandingPage() {
  return (
    <div className="h-full overflow-y-auto bg-brand-bg text-brand-text">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 border-b border-brand-border bg-brand-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <LemonHeader />
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand-primary to-brand-primary-end px-4 py-2 text-sm font-semibold text-white shadow transition-opacity hover:opacity-90"
          >
            Sign in <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-1.5 text-sm font-medium text-brand-muted shadow-sm">
          <Zap className="size-3.5 text-brand-accent" aria-hidden />
          Warehouse Management, Simplified
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black leading-tight tracking-tight">
          The WMS built for{' '}
          <span className="bg-linear-to-r from-brand-accent via-brand-accent-mid to-brand-accent-end bg-clip-text text-transparent">
            teams that move fast
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-brand-muted">
          Lemon WMS connects your office and warehouse floor in one unified system — real-time
          inventory, zone management, and role-based access, out of the box.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-brand-primary to-brand-primary-end px-6 py-3 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90"
          >
            Get started <ArrowRight className="size-5" aria-hidden />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-6 py-3 text-base font-semibold text-brand-text shadow-sm transition-colors hover:bg-brand-content-bg"
          >
            Sign in to dashboard
          </Link>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-brand-border bg-brand-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-brand-border px-6 py-8 md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-6 py-2 text-center">
              <div className="text-2xl font-black text-brand-text">{value}</div>
              <div className="mt-1 text-sm text-brand-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black tracking-tight text-brand-text">
            Everything your warehouse needs
          </h2>
          <p className="mt-3 text-brand-muted">
            From floor execution to management reporting — one platform covers it all.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, iconBg, iconColor }) => (
            <div
              key={title}
              className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="mb-4 inline-flex size-10 items-center justify-center rounded-xl"
                style={{ background: iconBg, color: iconColor }}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="font-bold text-brand-text">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two tracks ───────────────────────────────────────────────────── */}
      <section className="border-t border-brand-border bg-brand-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight text-brand-text">
              Built for every role
            </h2>
            <p className="mt-3 text-brand-muted">
              Two purpose-built interfaces — one for the office, one for the floor.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Office */}
            <div className="rounded-2xl border border-brand-border bg-brand-bg p-8">
              <span className="inline-flex items-center rounded-full bg-linear-to-br from-brand-primary to-brand-primary-end px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                Office
              </span>
              <h3 className="mt-5 text-xl font-black text-brand-text">Dashboard for managers</h3>
              <p className="mt-2 text-brand-muted">
                A full-featured web dashboard to manage warehouses, zones, bins, users, and
                inventory. Owners and managers get deep visibility into every corner of the
                operation.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-brand-muted">
                {[
                  'Warehouse & zone configuration',
                  'User and role management',
                  'Inventory overview and reporting',
                  'Real-time utilization metrics',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-brand-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
              >
                Open dashboard <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            {/* Warehouse floor */}
            <div className="rounded-2xl border border-brand-border bg-brand-bg p-8">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest text-white"
                style={{
                  background: 'linear-gradient(to bottom right, var(--entity-warehouse), var(--entity-warehouse-end))',
                }}
              >
                Warehouse
              </span>
              <h3 className="mt-5 text-xl font-black text-brand-text">Floor app for workers</h3>
              <p className="mt-2 text-brand-muted">
                A streamlined execution interface optimized for speed and simplicity. Workers sign
                in with badge + PIN — no passwords, no friction.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-brand-muted">
                {[
                  'Badge + PIN authentication',
                  'Device-bound sessions',
                  'Fast bin lookup and scanning',
                  'Task-focused, distraction-free UI',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--entity-warehouse)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: 'var(--entity-warehouse)' }}
              >
                Open floor app <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-black tracking-tight text-brand-text">
          Ready to take control of your warehouse?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-brand-muted">
          Sign in to get started. Your team can be up and running in minutes.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-brand-primary to-brand-primary-end px-8 py-3.5 text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          Sign in to Lemon WMS <ArrowRight className="size-5" aria-hidden />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-brand-border bg-brand-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-2">
            <LemonHeader />
          </div>
          <p className="text-sm text-brand-subtle">Internal warehouse management platform</p>
        </div>
      </footer>
    </div>
  )
}
