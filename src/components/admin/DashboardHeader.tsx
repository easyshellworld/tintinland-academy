// src/components/admin/DashboardHeader.tsx
import { CalendarClock } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <CalendarClock className="mr-2 h-4 w-4" />
        {currentDate}
      </div>
    </div>
  );
}