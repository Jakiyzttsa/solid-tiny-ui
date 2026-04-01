import { For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { list } from "solid-tiny-utils";
import { Button, Combobox, Drawer, DrawerHelper, useToaster } from "~";
import { PlayIt } from "../../../components/play-it";

export default function DrawerPage() {
  const [params, setParams] = createStore({
    closeOnEsc: true,
    closeOnClickMask: true,
    closable: true,
    placement: "right" as "left" | "right" | "top" | "bottom",
    longContent: false,
  });

  const toast = useToaster();

  return (
    <div>
      <PlayIt
        onChange={setParams}
        properties={params}
        typeDeclaration={{
          placement: ["left", "right", "top", "bottom"],
        }}
      >
        <Drawer
          closeOnClickMask={params.closeOnClickMask}
          closeOnEsc={params.closeOnEsc}
        >
          <Drawer.Trigger>
            <Button>Open Drawer</Button>
          </Drawer.Trigger>
          <Drawer.Content placement={params.placement}>
            <DrawerHelper>
              <DrawerHelper.Header
                closable={params.closable}
                title="Drawer title"
              />
              <DrawerHelper.Body>
                <Show
                  fallback={
                    <p>
                      This is drawer content{" "}
                      <Button
                        onClick={() => {
                          toast("This is a toaster message!");
                        }}
                        size="small"
                        variant="outline"
                      >
                        fire toaster
                      </Button>
                      <Combobox
                        options={list(20).map((v) => ({
                          label: `Option ${v + 1}`,
                          value: v + 1,
                          disabled: (v + 1) % 4 === 0,
                        }))}
                        size="small"
                      />
                    </p>
                  }
                  when={params.longContent}
                >
                  <div>
                    <For each={list(100)}>
                      {(item) => <p>{`This is line ${item}`}</p>}
                    </For>
                  </div>
                </Show>
              </DrawerHelper.Body>
              <DrawerHelper.Footer>
                <DrawerHelper.Close>
                  <Button>Cancel</Button>
                </DrawerHelper.Close>
                <Button>Submit</Button>
              </DrawerHelper.Footer>
            </DrawerHelper>
          </Drawer.Content>
        </Drawer>
      </PlayIt>
    </div>
  );
}
