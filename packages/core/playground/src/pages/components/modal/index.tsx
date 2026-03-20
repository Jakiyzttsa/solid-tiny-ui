import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { list } from "solid-tiny-utils";
import { Button, Modal, ModalHelper } from "~";
import { PlayIt } from "../../../components/play-it";

export default function TabsPage() {
  const [params, setParams] = createStore({
    closeOnEsc: true,
    closeOnClickMask: true,
    closable: true,
    longContent: false,
    customStyled: false,
  });

  const [open, setOpen] = createSignal(false);

  return (
    <div>
      <PlayIt onChange={setParams} properties={params}>
        <Modal
          closeOnClickMask={params.closeOnClickMask}
          closeOnEsc={params.closeOnEsc}
        >
          <Modal.Trigger>
            <Button>Open Modal</Button>
          </Modal.Trigger>
          <Modal.Content
            styles={
              params.customStyled
                ? {
                    mask: {
                      background: "rgba(73, 161, 132, 0.1))",
                    },
                    wrapper: {
                      "scrollbar-color": "rgba(255, 4, 4, 0.5) transparent",
                    },
                    content: {
                      "animation-duration": "500ms",
                      "margin-top": "150px",
                    },
                  }
                : undefined
            }
          >
            <ModalHelper>
              <ModalHelper.Header
                closable={params.closable}
                title="Modal title"
              />
              <ModalHelper.Body>
                <Show
                  fallback={<p>This is modal content</p>}
                  when={params.longContent}
                >
                  <div>
                    <For each={list(100)}>
                      {(item) => <p>{`This is line ${item}`}</p>}
                    </For>
                  </div>
                </Show>
              </ModalHelper.Body>
              <ModalHelper.Footer>
                <ModalHelper.Close>
                  <Button>Cancel</Button>
                </ModalHelper.Close>
              </ModalHelper.Footer>
            </ModalHelper>
          </Modal.Content>
        </Modal>
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          Control Modal
        </Button>
        <Modal onOpenChange={setOpen} open={open()}>
          <Modal.Content>
            <ModalHelper>
              <ModalHelper.Header title="Controlled Modal" />
              <ModalHelper.Body>
                <p>This modal is controlled by external state</p>
              </ModalHelper.Body>
              <ModalHelper.Footer>
                <ModalHelper.Close>
                  <Button>Close</Button>
                </ModalHelper.Close>
              </ModalHelper.Footer>
            </ModalHelper>
          </Modal.Content>
        </Modal>
      </PlayIt>
    </div>
  );
}
