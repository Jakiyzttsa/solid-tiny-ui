import { createStore } from "solid-js/store";
import { Calendar } from "~";
import { PlayIt } from "~play/components/play-it";

export default function CalendarPage() {
  const [params, setParams] = createStore({
    disabled: false,
  });

  return (
    <PlayIt onChange={setParams} properties={params} typeDeclaration={{}}>
      <Calendar />
    </PlayIt>
  );
}
