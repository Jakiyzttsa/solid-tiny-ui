import css from "sass:./modal.scss";
import { createMemo, type JSX, onMount } from "solid-js";
import {
  combineClass,
  combineStyle,
  dataIf,
  mountStyle,
} from "solid-tiny-utils";
import { ModalCore } from "../../primitives/modal";
import { createClassStyles } from "../../utils";
import type { ClassNames, Styles } from "../../utils/types";

function Root(props: Parameters<typeof ModalCore>[0]) {
  onMount(() => {
    const $preWarm = document.querySelector<HTMLDivElement>(
      "#tiny-modal-prewarm"
    );
    if (!$preWarm) {
      const div = document.createElement("div");
      div.id = "tiny-modal-prewarm";
      const preWarmStyle =
        "backdrop-filter: blur(10px);position: fixed;width: 0;height: 0;opacity: 0;pointer-events: none;";
      div.style.cssText = preWarmStyle;
      document.body.appendChild(div);
    }
  });
  return <ModalCore {...props} />;
}

function Content(props: {
  children: JSX.Element;
  width?: string;
  classNames?: ClassNames<"mask" | "wrapper" | "content">;
  styles?: Styles<"mask" | "wrapper" | "content">;
}) {
  mountStyle(css, "tiny-modal");
  const [, , { presencePhase }] = ModalCore.useContext();
  const [classes, styles] = createClassStyles(
    () => props.classNames,
    () => props.styles
  );

  const isEntering = createMemo(() =>
    ["pre-enter", "entering"].includes(presencePhase())
  );
  const isExiting = createMemo(() => ["exiting"].includes(presencePhase()));

  return (
    <ModalCore.Portal>
      <ModalCore.Mask
        class={combineClass("tiny-modal__mask", classes().mask)}
        data-entering={dataIf(isEntering())}
        data-exiting={dataIf(isExiting())}
        style={styles().mask}
      />
      <ModalCore.ContentWrapper
        class={combineClass(
          "tiny-modal__wrapper tiny-modal-vars",
          classes().wrapper
        )}
        style={combineStyle({}, styles().wrapper)}
      >
        <ModalCore.Content
          class={combineClass("tiny-modal__content", classes().content)}
          data-entering={dataIf(isEntering())}
          data-exiting={dataIf(isExiting())}
          style={combineStyle(
            {
              width: props.width || "500px",
            },
            styles().content
          )}
        >
          {props.children}
        </ModalCore.Content>
      </ModalCore.ContentWrapper>
    </ModalCore.Portal>
  );
}

export const Modal = Object.assign(Root, {
  Trigger: ModalCore.Trigger,
  Content,
  useContext: ModalCore.useContext,
});

export { ModalHelper } from "./helpers";
