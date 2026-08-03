import Link from "next/link";
import type { PersonSummary, SkillLevel } from "@/lib/types";

export function StatusBadge({ status }: { status: "staffing" | "active" | "completed" }) {
  const styles: Record<string, string> = {
    staffing: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    completed: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  };
  const labels: Record<string, string> = {
    staffing: "Staffing",
    active: "Active",
    completed: "Completed",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

const LEVEL_STYLES: Record<SkillLevel, string> = {
  beginner: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  intermediate: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  advanced: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  expert: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

export function SkillPill({
  name,
  level,
  muted,
}: {
  name: string;
  level?: SkillLevel;
  muted?: boolean;
}) {
  const style = level
    ? LEVEL_STYLES[level]
    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style} ${
        muted ? "opacity-60" : ""
      }`}
    >
      {name}
      {level && <span className="text-[10px] opacity-70">· {level}</span>}
    </span>
  );
}

export function PersonAvatar({ person, size = 36 }: { person: PersonSummary; size?: number }) {
  const initials = person.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: person.avatarColor, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function PersonRow({ person, subtitle }: { person: PersonSummary; subtitle?: string }) {
  return (
    <Link
      href={`/people/${person.id}`}
      className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
    >
      <PersonAvatar person={person} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">{person.name}</p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{subtitle ?? person.title}</p>
      </div>
    </Link>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</p>
      {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, retryHref }: { message: string; retryHref?: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">Something went wrong</p>
      <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">{message}</p>
      {retryHref && (
        <Link
          href={retryHref}
          className="mt-3 inline-block rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Try again
        </Link>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 ${className}`}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`} />;
}
