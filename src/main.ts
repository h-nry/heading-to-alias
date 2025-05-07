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
				this.headingsToAlias();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

	}

	onunload() {

	}

	async headingsToAlias() {
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

		this.app.fileManager.processFrontMatter(currentFile, (frontmatter) => {

			if (frontmatter['aliases'] == undefined) {frontmatter['aliases'] = []}

			// Get length of alias list
			const aliasCount = frontmatter['aliases'].length;

			headings.forEach(heading => {	
				if (this.settings.addAsWritten) {
					this.pushHeadingtoAlias(heading.heading, heading.level, frontmatter);
				}
				if (this.settings.addLowerDuplicate) {
					this.pushHeadingtoAlias(heading.heading.toLowerCase(), heading.level, frontmatter);
				}
			})
			new Notice(`Added ${frontmatter['aliases'].length - aliasCount} new aliases to this file.`, 2000);
			this.app.workspace.requestSaveLayout();
			}
		);
		
	}

	async pushHeadingtoAlias(heading: string, level: number, frontmatter: FrontMatterCache) {
		// Skip headings below max heading depth
		if (level > this.settings.maxHeadingLevel) return false;

		// Skip headings already added
		if (frontmatter['aliases'].includes(heading)) return false;

		// Skip headings ignored in settings
		if (this.settings.ignoredHeadings.includes(heading.toLowerCase())) return false;

		// Add headings to frontmatter	
		if (this.settings.addAsWritten) {
		frontmatter['aliases'].push(heading);
		}

		return true;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
