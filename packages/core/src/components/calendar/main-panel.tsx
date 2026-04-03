import { createMemo, For, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import {
  clamp,
  createWatch,
  dataIf,
  list,
  runAtNextAnimationFrame,
} from "solid-tiny-utils";
import {
  addMonths,
  addWeeks,
  getDay,
  getMonth,
  getYear,
  isSameDate,
} from "time-core";
import { getThisWeekDates } from "./utils";

export function MainPanel(props: {
  year: number;
  month: number;
  current: Date;
  onDateClick: (date: Date) => void;
  onYearMonthChange: (year: number, month: number) => void;
}) {
  const padding = 8;
  const visibleRowsCount = 6;
  const rowHeight = 32;
  const [$inter, set$inter] = createStore({
    year: 0,
    month: 0,
    wheelIndex: 0,
  });
  let ref!: HTMLDivElement;

  createWatch(
    () => [props.year, props.month],
    ([year, month]) => {
      set$inter("year", year);
      set$inter("month", month);
      set$inter("wheelIndex", padding);
    }
  );

  onMount(() => {
    runAtNextAnimationFrame(() => {
      ref.style.transition = "transform 150ms ease-out";
    });
  });

  const dateLines = createMemo(() => {
    return list(padding * 2)
      .map((v) => addWeeks([$inter.year, $inter.month, 1], -padding + v))
      .map((d) => getThisWeekDates(d));
  });

  const maxWheelIndex = createMemo(() => dateLines().length - visibleRowsCount);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    set$inter("wheelIndex", (prev) =>
      clamp(prev + Math.sign(e.deltaY), 1, maxWheelIndex())
    );
  };

  const checkPos = () => {
    const index = $inter.wheelIndex;
    const lines = dateLines();

    const shiftMonthAndResetIndex = (offset: number) => {
      // Keep the visible week stable when swapping month data at the edge.
      const anchorDate = lines[index]?.[0];
      const newD = addMonths([$inter.year, $inter.month, 1], offset);
      const nextYear = getYear(newD);
      const nextMonth = getMonth(newD);
      set$inter({
        year: nextYear,
        month: nextMonth,
      });
      const nextLines = dateLines();

      const nextIndex = anchorDate
        ? nextLines.findIndex((line) => isSameDate(line[0], anchorDate))
        : -1;

      set$inter({
        wheelIndex: nextIndex >= 0 ? nextIndex : padding,
      });
      props.onYearMonthChange(nextYear, nextMonth);
    };

    if (index === 1) {
      ref.style.transition = "none";
      shiftMonthAndResetIndex(-1);

      runAtNextAnimationFrame(() => {
        ref.style.transition = "transform 150ms ease-out";
      });
    }

    if (index === maxWheelIndex()) {
      ref.style.transition = "none";
      shiftMonthAndResetIndex(1);
      runAtNextAnimationFrame(() => {
        ref.style.transition = "transform 150ms ease-out";
      });
    }
  };

  return (
    <div
      onTransitionEnd={checkPos}
      onWheel={handleWheel}
      style={{
        width: `${7 * rowHeight}px`,
        height: `${visibleRowsCount * rowHeight}px`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        class="tiny-calendar__main-panel"
        ref={ref}
        style={{
          transform: `translate3d(0, ${$inter.wheelIndex * -rowHeight}px, 0)`,
          "will-change": "transform",
        }}
      >
        <For each={dateLines()}>
          {(line) => (
            <div class="tiny-calendar__a-line">
              <For each={line}>
                {(date) => (
                  <div
                    class="tiny-calendar__a-day"
                    data-current={dataIf(isSameDate(date, props.current))}
                    data-current-month={dataIf(getMonth(date) === $inter.month)}
                    style={{
                      width: `${rowHeight}px`,
                      height: `${rowHeight}px`,
                    }}
                  >
                    {getDay(date)}
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
