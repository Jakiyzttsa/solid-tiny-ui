import css from "sass:./date-input.scss";
import { createStore } from "solid-js/store";
import { clamp, createWatch, mountStyle } from "solid-tiny-utils";
import { type DateArgs, getDates } from "time-core";
import { CalendarLine } from "../../../icons/calender-line";
import { VisuallyHidden } from "../../visually-hidden";

const pad = (num: number) => String(num).padStart(2, "0");

export function DateInput(props: {
  date: DateArgs;
  onChange: (timestamps: number) => void;
}) {
  mountStyle(css, "tiny-date-input");
  const [internalDate, setInternalDate] = createStore({
    year: 0,
    month: 0,
    day: 0,
  });

  createWatch(
    () => getDates(props.date),
    (date) => {
      setInternalDate({
        year: date[0],
        month: date[1],
        day: date[2],
      });
    }
  );

  const safeDate = (val: number, field: keyof typeof internalDate) => {
    switch (field) {
      case "year":
        return clamp(val, 0, 9999);
      case "month":
        return clamp(val, 1, 12);
      case "day": {
        const daysInMonth = new Date(
          internalDate.year,
          internalDate.month,
          0
        ).getDate();
        return clamp(val, 1, daysInMonth);
      }
      default:
        return val;
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent,
    field: keyof typeof internalDate
  ) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const delta = e.key === "ArrowUp" ? 1 : -1;
      setInternalDate(field, (prev) => {
        return safeDate(prev + delta, field);
      });
    }
  };

  return (
    <div class="tiny-date-input">
      <VisuallyHidden as="input" />
      <button
        class="tiny-date-input__btn"
        onKeyDown={(e) => handleKeyDown(e, "year")}
        type="button"
      >
        {internalDate.year}
      </button>
      <span>-</span>
      <button
        class="tiny-date-input__btn"
        onKeyDown={(e) => handleKeyDown(e, "month")}
        type="button"
      >
        {pad(internalDate.month)}
      </button>
      <span>-</span>
      <button
        class="tiny-date-input__btn"
        onKeyDown={(e) => handleKeyDown(e, "day")}
        type="button"
      >
        {pad(internalDate.day)}
      </button>

      <CalendarLine />
    </div>
  );
}
