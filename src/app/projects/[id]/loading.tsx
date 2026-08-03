import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-xl lg:col-span-2" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
