import {
    Plugin,
    PluginSettingTab,
    View,
    Setting,
    App,
    Notice,
    TextComponent
} from 'obsidian';

import HeadingAliasesPlugin from './main'

export class SettingsTab extends PluginSettingTab {
    plugin: HeadingAliasesPlugin;


    constructor(app: App, plugin: HeadingAliasesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let ignoredField: TextComponent;
        const { containerEl } = this;

        containerEl.empty();

        const title = containerEl.createEl("h2", { text: "Heading to Alias Plugin Settings" });
        title.style.marginBottom = "16px";
        title.style.marginTop = "16px";
        title.style.fontWeight = "750";

        new Setting(containerEl)
            .setName("Maximum Heading Depth")
            .setDesc("The maximum depth of headings (number of \#s) that should be added to alias list")
            .addDropdown((depth) =>
                depth
                    .addOption("1", "1")
                    .addOption("2", "2")
                    .addOption("3", "3")
                    .addOption("4", "4")
                    .addOption("5", "5")
                    .addOption("6", "6")
                    .setValue(this.plugin.settings.maxHeadingLevel.toString())
                    .onChange(async (value: string) => {
                        this.plugin.settings.maxHeadingLevel = parseInt(value);
                        await this.plugin.saveSettings();
                    }));

        new Setting(containerEl)
            .setName("Add heading as written")
            .setDesc("Add headings in the form they are written")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.addAsWritten)
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.addAsWritten = value;
                        await this.plugin.saveSettings();
                    }))

        new Setting(containerEl)
            .setName("Add heading in lower case")
            .setDesc("Add headings in their lower-case form")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.addLowerDuplicate)
                    .onChange(async (value: boolean) => {
                        this.plugin.settings.addLowerDuplicate = value;
                        await this.plugin.saveSettings();
                    }))

        new Setting(containerEl)
            .setName('Alias Blacklist')
            .setDesc('Common headings that shouldn\'t be added to alias lists. All various capitalisations will be ignored.')
            .addText(text => {
                ignoredField = text;
                text.setPlaceholder('e.g. Examples, Summary')
                text.onChange(async (value) => {
                    this.plugin.settings.ignoredHeadingInput = value.toLowerCase();
                    await this.plugin.saveSettings();
                })
            })

            .addButton((button) => {
                button.setTooltip("Add to ignore list");
                button.setButtonText("Add");
                button.onClick(() => {
                    if (this.plugin.settings.ignoredHeadings.includes(this.plugin.settings.ignoredHeadingInput)) {
                        new Notice("Heading already ignored.", 2000)
                    }
                    else {
                        // Push ignored headings to list
                        this.plugin.settings.ignoredHeadings.push(this.plugin.settings.ignoredHeadingInput);

                        // Reset field to placeholder
                        ignoredField.setValue('');
                        
                        // Post notice
                        new Notice(`Heading "${this.plugin.settings.ignoredHeadingInput}" added to ignore list!`);
                        
                        this.updateIgnoredHeadingsUI(ignoredHeadingsContainer);
                        this.plugin.settings.ignoredHeadingInput = '';

                        (async () => {
                            await this.plugin.saveSettings();
                        })();
                    }
                });
            })

        const ignoredHeadingsContainer = containerEl.createEl("div", { cls: "heading-to-alias-ignoredHeadingsContainer" })
        this.updateIgnoredHeadingsUI(ignoredHeadingsContainer);
    }

    updateIgnoredHeadingsUI(container: HTMLDivElement): void {
        container.empty();

        this.plugin.settings.ignoredHeadings.forEach(heading => {
            console.log(heading);

            new Setting(container)
                .setClass("heading-to-alias-ignoredHeading")
                .setName(heading)
                .addButton((removeButton) => {
                    removeButton.setIcon("trash")
                    removeButton.setTooltip(`Remove ignore rule for "${heading}"`)
                    removeButton.onClick(async () => {
                        this.plugin.settings.ignoredHeadings.remove(heading);
                        new Notice(`Removed ignore rule for "${heading}"`);
                        this.updateIgnoredHeadingsUI(container);
                        await this.plugin.saveSettings();
                    })
                })
        });

        (async () => {
            await this.plugin.saveSettings();
        })();

    }
}

