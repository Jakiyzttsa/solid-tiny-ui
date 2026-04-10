import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { DateInput } from "../../../../../src/components/form-components/date-input";
import { PlayIt } from "../../../components/play-it";

export default function DateInputPage() {
  const [params, setParams] = createStore({
    type: "date" as const,
    size: "medium" as "small" | "medium" | "large",
  });

  const [date, setDate] = createSignal(new Date().toISOString());

  return (
    <div>
      <PlayIt
        onChange={setParams}
        properties={params}
        typeDeclaration={{
          type: ["date", "datetime-local", "month"],
          size: ["small", "medium", "large"],
        }}
      >
        <DateInput
          onChange={setDate}
          size={params.size}
          type={params.type}
          value={date()}
        />
        date: {date()}
      </PlayIt>
    </div>
  );
}
