import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock } from "lucide-react";

interface AvailabilityData {
  [key: string]: {
    from?: string;
    to?: string;
  };
}

interface AvailabilityTableProps {
  availability: AvailabilityData;
  title?: string;
}

const DAYS_ORDER = [
  "monday",
  "tuesday", 
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const formatDay = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

const formatTime = (time?: string) => {
  if (!time) return "—";
  // Convert 24h to 12h format if needed
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  if (isNaN(hour)) return time;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export function AvailabilityTable({ availability, title = "Availability" }: AvailabilityTableProps) {
  if (!availability || Object.keys(availability).length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No availability data provided
      </div>
    );
  }

  const sortedDays = DAYS_ORDER.filter((day) => day in availability);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4 text-primary" />
        {title}
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Day</TableHead>
              <TableHead className="font-semibold">From</TableHead>
              <TableHead className="font-semibold">To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDays.map((day) => {
              const dayData = availability[day];
              const hasHours = dayData?.from || dayData?.to;
              return (
                <TableRow 
                  key={day}
                  className={!hasHours ? "text-muted-foreground" : ""}
                >
                  <TableCell className="font-medium">{formatDay(day)}</TableCell>
                  <TableCell>{formatTime(dayData?.from)}</TableCell>
                  <TableCell>{formatTime(dayData?.to)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
