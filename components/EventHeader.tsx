// ---------------------------------------------------------------------------
// EventHeader — title block at the top of the event detail page.
// ---------------------------------------------------------------------------

import type { NormalizedEvent } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface Props {
  event: NormalizedEvent;
}

export default function EventHeader({ event }: Props) {
  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">{event.day}. Gün</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-500">{event.scheduledTime}</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-500">{event.category}</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-500">{event.round}</span>
      </div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
        <StatusBadge status={event.status} />
      </div>
    </div>
  );
}
