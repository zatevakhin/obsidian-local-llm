import LocalLlmPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface LocalLlmPluginSettings {
    apiUrl: string;
    maxTokens: number;
    temperature: number;
    top_p: number;
    top_k: number;
    repeat_penalty: number;
    stops: Array<string>;
    display_metadata: boolean;
    typewriter_mode: boolean;
    success_color: string;
    warning_color: string;
    error_color: string;
}

export const DEFAULT_SETTINGS: LocalLlmPluginSettings = {
    apiUrl: "http://localhost:8000/v1",
    maxTokens: 256,
    temperature: 0.1,
    top_p: 0.95,
    top_k: 40,
    repeat_penalty: 1.1,
    stops: ["###"],
    display_metadata: false,
    typewriter_mode: true,
    success_color: "#44CF6E",
    warning_color: "#E0DE71",
    error_color: "#FB464C"
};

export class LocalLlmSettingTab extends PluginSettingTab {
    plugin: LocalLlmPlugin;

    constructor(app: App, plugin: LocalLlmPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", {
            text: "Settings for Local LLM Plugin",
        });


        new Setting(containerEl)
        .setName("API URL")
        .setDesc("URL of llama-cpp-python API")
        .addText((text) =>
            text
                .setPlaceholder("URL")
                .setValue(this.plugin.settings.apiUrl)
                .onChange(async (value) => {
                    this.plugin.settings.apiUrl = value;
                    await this.plugin.saveSettings();
                })
        );

        new Setting(containerEl)
        .setName("Max Tokens")
        .setDesc("Max tokens in model response")

        .addSlider((slider) => {
            slider
                .setLimits(1, 2048, 1)
                .setValue(this.plugin.settings.maxTokens)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.maxTokens = value;
                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Temperature")
        .setDesc("Controls randomness or creativity by scaling the probabilities, higher temp results in more diverse text, lower temp results in more predictable text.")

        .addSlider((slider) => {
            slider
                .setLimits(0, 2, 0.05)
                .setValue(this.plugin.settings.temperature)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.temperature = value;
                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Repeat penalty")
        .setDesc("This parameter penalizes the model for generating repeated tokens or sequences in the generated text, encouraging more diverse output.")

        .addSlider((slider) => {
            slider
                .setLimits(1, 2, 0.01)
                .setValue(this.plugin.settings.repeat_penalty)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.repeat_penalty = value;
                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Top P")
        .setDesc("Controls the diversity of generated text by selecting the most likely words until their cumulative probability adds up to a specified value (p), which can be set between 0 and 1")

        .addSlider((slider) => {
            slider
                .setLimits(0, 1, 0.05)
                .setValue(this.plugin.settings.top_p)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.top_p = value;
                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Top K")
        .setDesc("Limits the number of most likely words to consider, avoiding repetitive or boring text.")

        .addSlider((slider) => {
            slider
                .setLimits(0, 200, 1)
                .setValue(this.plugin.settings.top_k)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.top_k = value;
                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Stops")
        .setDesc("List of stop sequences that will cause text generation to halt.")

        .addTextArea((text) => {
            text
                .setValue(this.plugin.settings.stops.join("\n"))
                .onChange(async (value) => {
                    this.plugin.settings.stops = (value.length > 0) ? value.split("\n") : [];

                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Typewriter mode")
        .setDesc("If enabled, it will type token-by-token in real time. If not will send a response at once after the generation is completed.")

        .addToggle((text) => {
            text
                .setValue(this.plugin.settings.typewriter_mode)
                .onChange(async (value) => {
                    this.plugin.settings.typewriter_mode = value;

                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Display metadata")
        .setDesc("If enabled will add query metadata to the node")

        .addToggle((text) => {
            text
                .setValue(this.plugin.settings.display_metadata)
                .onChange(async (value) => {
                    this.plugin.settings.display_metadata = value;

                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Successful answer node color")
        .setDesc("Apply color if there succeful answer")

        .addColorPicker((text) => {
            text
                .setValue(this.plugin.settings.success_color)
                .onChange(async (value) => {
                    this.plugin.settings.success_color = value;

                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Empty answer node color")
        .setDesc("Apply color if there an empty answer")

        .addColorPicker((text) => {
            text
                .setValue(this.plugin.settings.warning_color)
                .onChange(async (value) => {
                    this.plugin.settings.warning_color = value;

                    await this.plugin.saveSettings();
                })
        });

        new Setting(containerEl)
        .setName("Error during answer node color")
        .setDesc("Apply color if there error during answer")

        .addColorPicker((text) => {
            text
                .setValue(this.plugin.settings.error_color)
                .onChange(async (value) => {
                    this.plugin.settings.error_color = value;

                    await this.plugin.saveSettings();
                })
        });

    }
}
