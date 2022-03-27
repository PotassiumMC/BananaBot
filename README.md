# BananaBot

The bot used in the PotassiumMC Discord server.

## Setup

1. Install all dependencies with `yarn install`.
2. Copy `config.example.json` to `config.json`.
3. In the `keys` section of `config.json`, add your bot's API key.
4. (optional) In the `projects` section, add the project ids of the Modrinth and CurseForge projects to track. *Note: When using CurseForge, you **must** specify a CurseForge API key in the `keys` section.*
5. Register all slash commands by executing `deploy-commands.js`. You only need to run this command after a change has been made to the bot's available commands.
6. Start the bot by executing `index.js`.
