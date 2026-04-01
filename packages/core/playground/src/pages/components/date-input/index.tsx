import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { DateInput } from "../../../../../src/components/form-components/date-input";
import { PlayIt } from "../../../components/play-it";

export default function DateInputPage() {
  const [params, setParams] = createStore({});

  const [date, setDate] = createSignal(Date.now());

  return (
    <div>
      <PlayIt
        onChange={setParams}
        properties={params}
        typeDeclaration={{
          placement: ["left", "right", "top", "bottom"],
        }}
      >
        <DateInput date={date()} onChange={setDate} />
        date: {date()}
      </PlayIt>
    </div>
  );
}
