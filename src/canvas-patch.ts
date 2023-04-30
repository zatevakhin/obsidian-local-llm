import { ItemView, Menu, Plugin } from "obsidian";

let canvasNodePrototype: any;
let originalCanvasNodeShowMenu: any;

function onCanvasMenu(menu: Menu) {
    let node = this;
    originalCanvasNodeShowMenu.apply(this, arguments);
    this.canvas.app.workspace.trigger(
        "llm-instruction:canvas-menu",
        node,
        menu
    );
}

export function performCanvasMonkeyPatch(plugin: Plugin) {
    const view = app.workspace.getActiveViewOfType(ItemView);
    checkCanvasMonkeyPatch(view);

    if (!canvasNodePrototype) {
        plugin.registerEvent(
            plugin.app.workspace.on("active-leaf-change", () => {
                const view = app.workspace.getActiveViewOfType(ItemView);
                checkCanvasMonkeyPatch(view);
            })
        );
    }
}

function checkCanvasMonkeyPatch(view: ItemView | null) {
    if (view?.getViewType() == "canvas") {
        const canvas = (view as any).canvas;

        const nodes = canvas.nodes as Map<string, any>;
        if (nodes.size > 0) {
            const node = nodes.values().next().value;
            const nodePrototype = Object.getPrototypeOf(node);
            if (nodePrototype.showMenu != onCanvasMenu) {
                canvasNodePrototype = nodePrototype;
                originalCanvasNodeShowMenu = nodePrototype.showMenu;
                nodePrototype.showMenu = onCanvasMenu;
            }
        }
    }
}

export function removeCanvasMonkeyPatch() {
    if (canvasNodePrototype) {
        canvasNodePrototype.showMenu = originalCanvasNodeShowMenu;
        canvasNodePrototype = null;
    }
}
