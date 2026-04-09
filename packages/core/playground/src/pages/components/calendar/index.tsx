import { createStore } from "solid-js/store";
import { Calendar } from "~";
import { PlayIt } from "~play/components/play-it";

export default function CalendarPage() {
  const [params, setParams] = createStore({
    disabled: false,
  });

  const [d, setD] = createStore({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    current: new Date(),
  });

  return (
    <PlayIt onChange={setParams} properties={params} typeDeclaration={{}}>
      <div>
        <div>Year: {d.year}</div>
        <div>Month: {d.month}</div>
      </div>
      <Calendar
        current={d.current}
        onYearMonthChange={(year, month) => setD({ year, month })}
      />
    </PlayIt>
  );
}
