import css from "sass:./date-input.scss";
import { createSignal, type JSX, Show } from "solid-js";
import { createStore } from "solid-js/store";
import {
  clamp,
  createDebouncedWatch,
  createWatch,
  dataIf,
  mountStyle,
} from "solid-tiny-utils";
import { type DateArgs, getDates, getTimes, isDateArgsValid } from "time-core";
import { CalendarLine } from "../../../icons/calender-line";
import { VisuallyHidden } from "../../visually-hidden";

const pad = (num: number, width = 2) => String(num).padStart(width, "0");

const safer = (val: number, field: DateFields, year: number, month: number) => {
  switch (field) {
    case "year":
      return clamp(val, 0, 9999);
    case "month":
      if (val < 1) {
        return 12;
      }
      if (val > 12) {
        return 1;
      }
      return val;
    case "day": {
      const daysInMonth = new Date(year, month, 0).getDate();

      if (val < 1) {
        return daysInMonth;
      }
      if (val > daysInMonth) {
        return 1;
      }
      return val;
    }
    case "hour":
      if (val < 0) {
        return 23;
      }
      if (val > 23) {
        return 0;
      }
      return val;
    case "minute":
    case "second":
      if (val < 0) {
        return 59;
      }
      if (val > 59) {
        return 0;
      }
      return val;
    default:
      return val;
  }
};

function Layer(props: { children: JSX.Element }) {
  return <span class="tiny-date-input__layer">{props.children}</span>;
}

const dateFields = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
] as const;
type DateFields = (typeof dateFields)[number];

const getPrevField = (field: DateFields): DateFields | null => {
  const idx = dateFields.indexOf(field);
  if (idx > 0) {
    return dateFields[idx - 1];
  }

  return null;
};

const getNextField = (field: DateFields): DateFields | null => {
  const idx = dateFields.indexOf(field);
  if (idx >= 0 && idx < dateFields.length - 1) {
    return dateFields[idx + 1];
  }
  return null;
};

/**
 * A compatible date input component that implements modern `<input type="date">` and `<input type="datetime-local">` features, with better accessibility and user experience.
 *
 * It should supports most of the features of native date input - keyboard input, dropdown calendar
 *
 * type="datetime-local"
 */
export function DateInput(props: {
  value: DateArgs;
  type?: "date" | "datetime-local" | "month";
  size?: "small" | "medium" | "large";
  invalid?: boolean;
  onChange: (date: string) => void;
}) {
  mountStyle(css, "tiny-date-input");
  const [internalDate, setInternalDate] = createStore({
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  });

  createWatch(
    () => props.value,
    (v) => {
      if (isDateArgsValid(v)) {
        const dates = [...getDates(v), ...getTimes(v)] as const;
        setInternalDate({
          year: dates[0],
          month: dates[1],
          day: dates[2],
          hour: dates[3],
          minute: dates[4],
          second: dates[5],
        });
      }
    }
  );

  const safeDate = (val: number, field: DateFields) => {
    return safer(val, field, internalDate.year, internalDate.month);
  };

  const [currentEdit, setCurrentEdit] = createSignal<DateFields | null>(null);
  const [tempEditContent, setTempEditContent] = createSignal("");
  const refs = {} as Record<DateFields, HTMLButtonElement | undefined>;

  const maxLen = (field: DateFields) => {
    switch (field) {
      case "year":
        return 4;
      default:
        return 2;
    }
  };

  const isFieldAvailable = (field: DateFields) => {
    if (field === "hour" || field === "minute" || field === "second") {
      return props.type === "datetime-local";
    }
    if (field === "day") {
      return props.type !== "month";
    }
    return true;
  };

  const handleIntKeyDown = (e: KeyboardEvent, field: DateFields) => {
    if (Number.isInteger(Number(e.key))) {
      setCurrentEdit((prev) => {
        if (prev !== field) {
          setTempEditContent("");
        }
        return field;
      });
      const maxLength = maxLen(field);
      setTempEditContent((prev) => prev + e.key);
      if (tempEditContent().length === maxLength) {
        const nextField = getNextField(field);
        if (nextField && isFieldAvailable(nextField)) {
          refs[nextField]?.focus();
        }
      }
      if (tempEditContent().length > maxLength) {
        setTempEditContent(e.key);
      }
    }
  };

  const handleArrowKeyDown = (e: KeyboardEvent, field: DateFields) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const delta = e.key === "ArrowUp" ? 1 : -1;
      setInternalDate(field, (prev) => {
        return safeDate(prev + delta, field);
      });
    }

    if (e.key === "ArrowRight") {
      const nextField = getNextField(field);
      if (nextField && isFieldAvailable(nextField)) {
        refs[nextField]?.focus();
      }
    }

    if (e.key === "ArrowLeft") {
      const prevField = getPrevField(field);
      if (prevField && isFieldAvailable(prevField)) {
        refs[prevField]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent, field: DateFields) => {
    const supportedKeys = [
      "ArrowUp",
      "ArrowDown",
      "Backspace",
      "ArrowRight",
      "ArrowLeft",
    ];
    if (!(supportedKeys.includes(e.key) || Number.isInteger(Number(e.key)))) {
      return;
    }
    e.preventDefault();

    handleArrowKeyDown(e, field);

    if (e.key === "Backspace") {
      setTempEditContent("");
      setCurrentEdit(field);
    }

    handleIntKeyDown(e, field);
  };

  const handleBlur = () => {
    setCurrentEdit((prev) => {
      if (prev !== null) {
        const newValue = Number(tempEditContent());
        if (Number.isInteger(newValue)) {
          setInternalDate(prev, safeDate(newValue, prev));
        }
      }

      return null;
    });
    setTempEditContent("");
  };

  createDebouncedWatch(
    () => [{ ...internalDate }, props.type] as const,
    ([date, t]) => {
      let result = `${pad(date.year, 4)}-${pad(date.month)}`;
      if (t === "datetime-local") {
        result += `-${pad(date.day)}T${pad(date.hour)}:${pad(date.minute)}:${pad(date.second)}`;
      }
      if (t === "date") {
        result += `-${pad(date.day)}`;
      }
      if (result !== props.value) {
        props.onChange(result);
      }
    },
    {
      delay: 300,
    }
  );

  const Holder = (props: { field: DateFields }) => (
    <button
      class="tiny-date-input__btn"
      data-editing={dataIf(currentEdit() === props.field)}
      onBlur={handleBlur}
      onKeyDown={(e) => handleKeyDown(e, props.field)}
      ref={(el) => {
        refs[props.field] = el;
      }}
      type="button"
    >
      <span class="tiny-date-input__content">
        {pad(internalDate[props.field], maxLen(props.field))}
      </span>
      <Layer>{tempEditContent()}</Layer>
    </button>
  );

  return (
    <div
      class="tiny-date-input"
      data-invalid={dataIf(props.invalid ?? false)}
      data-size={props.size ?? "medium"}
    >
      <VisuallyHidden as="input" />
      <Holder field="year" />
      <span>/</span>
      <Holder field="month" />
      <Show when={props.type !== "month"}>
        <span>/</span>
        <Holder field="day" />
      </Show>

      <Show when={props.type === "datetime-local"}>
        <span>&nbsp;</span>
        <Holder field="hour" />
        <span>:</span>
        <Holder field="minute" />
        <span>:</span>
        <Holder field="second" />
      </Show>

      <span>&nbsp;</span>
      <CalendarLine />
    </div>
  );
}
