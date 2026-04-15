import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6 border-b border-zinc-800/50", className)}>
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="text-base text-gray-400 font-light">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}