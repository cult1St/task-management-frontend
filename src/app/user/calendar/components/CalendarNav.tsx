import { formatMonthTitle } from "@/utils/dateUtil";

interface CalendarNavProps {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarNav({
  currentMonth,
  onPrev,
  onNext,
}: CalendarNavProps) {
  return (
    <div className="calendar-nav">
      <button className="calendar-nav-btn" onClick={onPrev}>
        ‹
      </button>
      <div className="calendar-title">{formatMonthTitle(currentMonth)}</div>
      <button className="calendar-nav-btn" onClick={onNext}>
        ›
      </button>
    </div>
  );
}