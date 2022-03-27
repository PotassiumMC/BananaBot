# BananaBot

The bot used in the PotassiumMC Discord server. It currently does nothing, other than displaying the download count in its status.

## Setup

1. Install all dependencies with `yarn install`.
2. Copy `config.example.json` to `config.json`.
3. In the `keys` section of `config.json`, add your bot's API key.
4. (optional) In the `projects` section, add the project ids of the Modrinth and CurseForge projects to track. *Note: When using CurseForge, you **must** specify a CurseForge API key in the `keys` section.*
5. Start the bot by executing `index.js`.
