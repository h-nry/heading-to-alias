import {
    Plugin,
    PluginSettingTab,
    View,
    Setting,
    App,
    Notice
} from 'obsidian';

import HeadingAliasesPlugin from './main'

export class SettingsTab extends PluginSettingTab {
    plugin: HeadingAliasesPlugin;


    constructor(app: App, plugin: HeadingAliasesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
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
            .setName('Alias Blacklist')
            .setDesc('Common headings that shouldn\'t be added to alias lists')
            .addText(text => text
                .setPlaceholder('e.g. Examples, Summary')
                .onChange(async (value) => {
                    this.plugin.settings.ignoredHeadingInput = value;
                    await this.plugin.saveSettings();
                }))
            .addButton((button) => {
                button.setTooltip("Add to ignore list");
                button.setButtonText("Add");
                button.onClick(() => {
                    if (this.plugin.settings.ignoredHeadings.includes(this.plugin.settings.ignoredHeadingInput)) {
                        new Notice("Heading already ignored.", 2000)
                    }
                    else {
                        this.plugin.settings.ignoredHeadings.push(this.plugin.settings.ignoredHeadingInput);
                        console.log(this.plugin.settings.ignoredHeadings);
                        new Notice(`Heading "${this.plugin.settings.ignoredHeadingInput}" added to ignore list!`);
                        this.updateIgnoredHeadings(ignoredHeadingsContainer);
                        (async () => {
                          await this.plugin.saveSettings();
                        })();
                    }
                });
            })

            const ignoredHeadingsContainer = containerEl.createEl("div", {cls: "heading-to-alias-ignoredHeadingsContainer"})
            this.updateIgnoredHeadings(ignoredHeadingsContainer);
    }

    updateIgnoredHeadings(container: HTMLDivElement): void {
        container.empty();

        this.plugin.settings.ignoredHeadings.forEach(heading => {
            console.log(heading);

            const headingSetting = new Setting(container)
                .setClass("heading-to-alias-ignoredHeading")
                .setName(heading)
                .addButton((removeButton) => {
                    removeButton.setIcon("trash")
                    removeButton.setTooltip(`Remove ignore rule for "${heading}"`)
                    removeButton.onClick(async () => {
                        this.plugin.settings.ignoredHeadings.remove(heading);
                        new Notice(`Removed ignore rule for "${heading}"`);
                        this.updateIgnoredHeadings(container);
                        await this.plugin.saveSettings();
                    })
                })
        });

        (async () => {
            await this.plugin.saveSettings();
          })();

    }
}

