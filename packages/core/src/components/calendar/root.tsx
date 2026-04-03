import css from "sass:./calendar.scss";
import { mountStyle, noop } from "solid-tiny-utils";
import { getMonth, getYear } from "time-core";
import { MainPanel } from "./main-panel";

export function Root(props: { current: Date }) {
  mountStyle(css, "tiny-calendar");
  return (
    <div>
      <MainPanel
        current={props.current}
        month={getMonth(props.current)}
        onDateClick={noop}
        onYearMonthChange={noop}
        year={getYear(props.current)}
      />
    </div>
  );
}
