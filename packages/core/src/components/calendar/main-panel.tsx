import { createMemo, For } from "solid-js";
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
    noTransition: false,
    isRepositioning: false,
  });

  createWatch(
    () => [props.year, props.month],
    ([year, month]) => {
      set$inter("year", year);
      set$inter("month", month);
      set$inter("wheelIndex", padding);
    }
  );

  const dateLines = createMemo(() => {
    return list(padding * 2)
      .map((v) => addWeeks([$inter.year, $inter.month, 1], -padding + v))
      .map((d) => getThisWeekDates(d));
  });

  const maxWheelIndex = createMemo(() => dateLines().length - visibleRowsCount);

  const makeDateLines = (year: number, month: number) => {
    return list(padding * 2)
      .map((v) => addWeeks([year, month, 1], -padding + v))
      .map((d) => getThisWeekDates(d));
  };

  const shiftMonthAndGetAnchorIndex = (offset: number, anchorDate?: Date) => {
    const newD = addMonths([$inter.year, $inter.month, 1], offset);
    const nextYear = getYear(newD);
    const nextMonth = getMonth(newD);
    const nextLines = makeDateLines(nextYear, nextMonth);

    const nextAnchorIndex = anchorDate
      ? nextLines.findIndex((line) => isSameDate(line[0], anchorDate))
      : -1;

    set$inter({
      year: nextYear,
      month: nextMonth,
    });
    props.onYearMonthChange(nextYear, nextMonth);

    return nextAnchorIndex >= 0 ? nextAnchorIndex : padding;
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if ($inter.isRepositioning) {
      return;
    }

    const direction = Math.sign(e.deltaY);
    if (!direction) {
      return;
    }

    const index = $inter.wheelIndex;
    const lines = dateLines();
    const maxIndex = maxWheelIndex();

    let baseIndex = index;
    let hitBoundary = false;

    if (direction < 0 && index === 4) {
      baseIndex = shiftMonthAndGetAnchorIndex(-1, lines[index]?.[0]);
      hitBoundary = true;
    }

    if (direction > 0 && index === maxIndex) {
      baseIndex = shiftMonthAndGetAnchorIndex(1, lines[index]?.[0]);
      hitBoundary = true;
    }

    if (hitBoundary) {
      set$inter({
        isRepositioning: true,
        noTransition: true,
        wheelIndex: baseIndex,
      });

      runAtNextAnimationFrame(() => {
        set$inter({
          noTransition: false,
          wheelIndex: clamp(baseIndex + direction, 4, maxWheelIndex()),
          isRepositioning: false,
        });
      });
      return;
    }

    set$inter("wheelIndex", (prev) =>
      clamp((prev === index ? baseIndex : prev) + direction, 4, maxWheelIndex())
    );
  };

  return (
    <div
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
        style={{
          transform: `translate3d(0, ${$inter.wheelIndex * -rowHeight}px, 0)`,
          transition: $inter.noTransition
            ? "none"
            : "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)",
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
