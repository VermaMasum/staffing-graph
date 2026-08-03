import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-10">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div>
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
