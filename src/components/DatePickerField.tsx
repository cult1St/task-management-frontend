"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toISODate } from "@/utils/dateUtil";

type DatePickerFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
};

type TimePickerFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  stepMinutes?: number;
};

function parseISODate(value?: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function parseTime(value?: string): Date | null {
  if (!value) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatTime(date: Date | null): string {
  if (!date) return "";
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function DatePickerField({
  value,
  onChange,
  placeholder,
  minDate,
}: DatePickerFieldProps) {
  const selected = parseISODate(value);

  return (
    <DatePicker
      selected={selected}
      onChange={(date: Date | null) => onChange(date ? toISODate(date) : "")}
      placeholderText={placeholder || "Select date"}
      className="form-input"
      wrapperClassName="datepicker-wrapper"
      dateFormat="yyyy-MM-dd"
      minDate={minDate}
    />
  );
}

export function TimePickerField({
  value,
  onChange,
  placeholder,
  stepMinutes = 15,
}: TimePickerFieldProps) {
  const selected = parseTime(value);

  return (
    <DatePicker
      selected={selected}
      onChange={(date: Date | null) => onChange(formatTime(date))}
      placeholderText={placeholder || "Select time"}
      className="form-input"
      wrapperClassName="datepicker-wrapper"
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={stepMinutes}
      timeCaption="Time"
      dateFormat="HH:mm"
    />
  );
}

