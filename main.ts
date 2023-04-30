import { Plugin, MenuItem } from "obsidian";
import {
    LocalLlmPluginSettings,
    LocalLlmSettingTab,
    DEFAULT_SETTINGS,
} from "src/settings";

import {
    performCanvasMonkeyPatch,
    removeCanvasMonkeyPatch,
} from "src/canvas-patch";


const METADATA_TEMPLATE = `
\`\`\`yaml
metadata:
- id: "{{id}}"
- finish_reason: "{{finish_reason}}"
- object_type: "{{object_type}}"
- created: "{{created}}"
- prompt_template: "{{prompt_template}}"
- prompt_text: "{{prompt_text}}"
- model: "{{model}}"
- temperature: {{temperature}}
- top_p: {{top_p}}
- top_k: {{top_k}}
- promp_tokens: {{promp_tokens}}
- completion_tokens: {{completion_tokens}}
- total_tokens: {{total_tokens}}
\`\`\`
`

const PROMPT_TEMPLATE = `\n\n### Instructions: {{text}}\n\n### Response:\n`

function createResponseNode(canvas: any, prompNode: any) {
    let nodeSettings = {
        pos: {
            x: prompNode.x,
            y: prompNode.y + prompNode.height + 32,
        },
        size: {
            width: prompNode.width,
            height: prompNode.height
        }
    };

    const node = canvas.createTextNode(nodeSettings);

    node.setText(`Prompting...`);
    canvas.requestSave();
    return node;
}

function template(templateString: string, data: Record<string, unknown>): string {
    return templateString.replace(/{{(\w*)}}/g, (_, key) => {
      return data.hasOwnProperty(key) ? String(data[key]) : "";
    });
  }



export default class LocalLlmPlugin extends Plugin {
    settings: LocalLlmPluginSettings;

    onPromptLLM(node: any) {
        const text = node.text;
        const canvas = node.canvas;

        let url = `${this.settings.apiUrl}/completions`
        let responseNode = createResponseNode(canvas, node);
        let prompt_text = template(PROMPT_TEMPLATE, {text: text})
        let query = {
            prompt:prompt_text,
            stop: this.settings.stops,
            max_tokens: this.settings.maxTokens,
            temperature: this.settings.temperature,
            repeat_penalty: this.settings.repeat_penalty,
            top_p: this.settings.top_p,
            top_k: this.settings.top_k,
            stream: false
        };

        let spinner = ['|', '/', '-', '\\'];
        let i = 0;

        let spinnerInterval = setInterval(() => {
            responseNode.setText(` \`${spinner[i]}\` Prompting...`);
            i = (i + 1) % spinner.length;
        }, 250);


        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            clearInterval(spinnerInterval);
            if (data.choices[0].text.length <= 0) {
                responseNode.setText("`Empty responce...`")
                responseNode.setColor(this.settings.warning_color);
            } else {
                responseNode.setColor(this.settings.success_color);

                let nodeText = `${data.choices[0].text}`;

                if (this.settings.display_metadata) {
                    nodeText += template(METADATA_TEMPLATE, {
                        id: data.id,
                        finish_reason: data.choices[0].finish_reason,
                        object_type: data.object,
                        created: data.created,
                        prompt_template: PROMPT_TEMPLATE.replace(/\n/ig, "\\n"),
                        prompt_text: text,
                        temperature: this.settings.temperature,
                        top_p: this.settings.top_p,
                        top_k: this.settings.top_k,
                        model: data.model,
                        promp_tokens: data.usage.prompt_tokens,
                        completion_tokens: data.usage.completion_tokens,
                        total_tokens: data.usage.total_tokens,
                    })
                }
                responseNode.setText(nodeText)
            }
        })
        .catch(error => {
            clearInterval(spinnerInterval);
            responseNode.setText(`Error: ${error}`)
            responseNode.setColor(this.settings.error_color);
            console.error('Error:', error);
        });
    }

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new LocalLlmSettingTab(this.app, this));


        this.registerEvent(
            this.app.workspace.on(
                "llm-instruction:canvas-menu",
                (node, menu) => {
                    menu.addSeparator();
                    menu.addItem((item: MenuItem) => {
                        item.setTitle("LLM Instruction")
                            .setIcon("wand")
                            .onClick(() => this.onPromptLLM(node));
                    });
                }
            )
        );

        performCanvasMonkeyPatch(this);
    }

    onunload() {
        removeCanvasMonkeyPatch();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

declare module "obsidian" {
    interface Workspace {
        /**
         * Fires when a canvas node is right-clicked.
         *
         * This is a custom event because the official API does not support it.
         *
         * @param node The node that was right-clicked.
         * @param menu The menu that will be shown.
         */
        on(
            event: "llm-instruction:canvas-menu",
            callback: (node: any, menu: Menu) => void
        ): EventRef;

    }
}
