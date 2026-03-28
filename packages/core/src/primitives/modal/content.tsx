/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: The modal overlay needs to be interactive to handle close events (click outside, Escape key). */

import { mergeRefs } from "@solid-primitives/refs";
import type { ComponentProps } from "solid-js";
import { onMount, splitProps } from "solid-js";
import { combineStyle, runSolidEventHandler } from "solid-tiny-utils";
import { context } from "./context";

export function ContentWrapper(props: ComponentProps<"div">) {
  const [local, others] = splitProps(props, ["style", "onKeyDown", "ref"]);
  const [state, actions] = context.useContext();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && state.closeOnEsc) {
      e.preventDefault();
      actions.setState("open", false);
    }

    runSolidEventHandler(e, local.onKeyDown);
  };

  const handlerClick = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    if (state.closeOnClickMask) {
      actions.setState("open", false);
    }
  };

  let refWrapper!: HTMLDivElement;

  onMount(() => {
    refWrapper.focus();
  });

  return (
    <div
      {...others}
      onClick={handlerClick}
      onKeyDown={handleKeyDown}
      ref={mergeRefs(local.ref, (el) => {
        refWrapper = el;
      })}
      style={combineStyle(
        {
          position: "fixed",
          inset: 0,
        },
        local.style
      )}
      tabIndex={-1}
    />
  );
}

export function Content(props: ComponentProps<"div">) {
  const [localProps, otherProps] = splitProps(props, ["children", "style"]);

  const [, actions] = context.useContext();

  return (
    <div
      ref={(el) => {
        actions.setState("refContent", el);
      }}
      role="dialog"
      style={combineStyle({}, localProps.style)}
      {...otherProps}
    >
      {localProps.children}
    </div>
  );
}
