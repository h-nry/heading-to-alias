import { 
	App, 
	CachedMetadata,
	FrontMatterCache,
	HeadingCache,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile 
} from 'obsidian';

import {
    SettingsTab,
} from './settings';

interface MyPluginSettings {
	ignoredHeadingInput: string;
	ignoredHeadings: string[];
	maxHeadingLevel: number;
	addLowerDuplicate: boolean;
	addAsWritten: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	ignoredHeadingInput: "",
	ignoredHeadings: [],
	maxHeadingLevel: 1,
	addLowerDuplicate: false,
	addAsWritten: true,
}

export default class HeadingAliasesPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'heading-to-alias',
			name: 'Add file headings to frontmatter alias list.',
			callback: () => {
				// Command execution here
				this.headingToAliases();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

	}

	onunload() {

	}

	async headingToAliases() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView || !activeView.file) return null;
	
		const currentFile: TFile = activeView.file;
		
		// Get all cache for file, exit if no cache.
		const fileCache: CachedMetadata | null = this.app.metadataCache.getFileCache(currentFile);
		if (!fileCache) return null;
	
		// Get headings cache from cache, return none if no headings.
		const headings: HeadingCache[] | undefined = fileCache.headings;
		if (!headings || headings.length === 0) return null;

		const frontmatter: FrontMatterCache | undefined = fileCache.frontmatter;

		var addedHeadingsCount = 0;

		this.app.fileManager.processFrontMatter(currentFile, (frontmatter) => {
			if (frontmatter['aliases'] == undefined) {frontmatter['aliases'] = ""}
			headings.forEach(heading => {	
				// Skip headings below settings level
				if (heading.level > this.settings.maxHeadingLevel) return;

				// Skip headings already added
				if (frontmatter['aliases'].includes(heading.heading)) return;

				// Skip headings ignored in settings
				if (this.settings.ignoredHeadings.includes(heading.heading)) return;

				// Add headings to frontmatter	
				frontmatter['aliases'] += ',' + heading.heading;
				addedHeadingsCount++;
			})
			new Notice(`Added ${addedHeadingsCount} new aliases to this file.`, 2000);
			this.app.workspace.requestSaveLayout();
			}
		);
		
	}


	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
