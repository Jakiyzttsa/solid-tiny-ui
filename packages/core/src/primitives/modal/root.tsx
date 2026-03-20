import { createUniqueId } from "solid-js";
import {
  callMaybeCallableChild,
  createPresence,
  createWatch,
  type MaybeCallableChild,
  mountStyle,
} from "solid-tiny-utils";
import { getAnimationDurationMs } from "../../utils/duration";
import { context } from "./context";

export function Root(props: {
  children: MaybeCallableChild<ReturnType<typeof context.useContext>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnClickMask?: boolean;
  closeOnEsc?: boolean;
}) {
  const Context = context.initial({
    closeOnClickMask: () => props.closeOnClickMask,
    closeOnEsc: () => props.closeOnEsc,
    open: () => props.open,
  });
  const [state, _, staticData] = Context.value;

  const presence = createPresence(() => state.open, {
    enterDuration: () => getAnimationDurationMs(state.refContent),
    exitDuration: () => getAnimationDurationMs(state.refContent),
  });

  staticData.isMounted = presence.isMounted;
  staticData.presencePhase = presence.phase;

  const id = `ps__${createUniqueId()}`;

  createWatch(
    () => [presence.isMounted()],
    ([mounted]) => {
      if (mounted) {
        mountStyle("html body{overflow:hidden}", id);
      } else {
        const el = document.querySelector(`#${id}`);
        el?.remove();
      }
    }
  );

  createWatch(
    () => [state.open] as const,
    ([open]) => {
      if (open !== props.open) {
        props.onOpenChange?.(open);
      }
    },
    { defer: true }
  );

  return (
    <Context.Provider>
      {callMaybeCallableChild(props.children, ...Context.value)}
    </Context.Provider>
  );
}
