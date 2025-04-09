# Heading to Alias Plugin

This is a sample plugin for Obsidian (https://obsidian.md).

This plugin lets you automatically add headings (`# Heading`)  from a file to it's YAML Frontmatter under the 'aliases' category. This allows the file to be found by searching for the heading, and for the heading to appear when using [internal links](https://help.obsidian.md/links). 

The plugin allows this functionality to be customised in the following ways:
- Control maximum 'depth' of headings included (heading levels 1-6)
- Exclude certain commonly used headings *e.g. Summary, Examples*

## How to install the plugin

- Simply install directly from Obsidian
- or you can just copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/codeblock-customizer/`.