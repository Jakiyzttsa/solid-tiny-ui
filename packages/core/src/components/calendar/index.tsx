import { Root } from "./root";

export function Calendar(props: {
  current?: Date;
  onYearMonthChange?: (year: number, month: number) => void;
}) {
  return (
    <Root
      current={props.current || new Date()}
      onYearMonthChange={props.onYearMonthChange}
    />
  );
}
