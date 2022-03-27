const fetch = require('node-fetch');

module.exports = {
    getModrinthDownloadCounts: async (projects) => {
        const downloadCounts = [];

        for (const projectId of projects) {
            const req = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);

            // Silently fail
            if (req.status !== 200) continue;

            const data = await req.json();
            downloadCounts.push(data.downloads);
        }

        return downloadCounts;
    },
    getCurseForgeDownloadCounts: async (key, projects) => {
        if (key === '' || projects.length === 0) return [];

        const req = await fetch(`https://api.curseforge.com/v1/mods`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': key
            },
            body: JSON.stringify({
                modIds: projects
            })
        });

        // Silently fail
        if (req.status !== 200) return [];

        const { data } = await req.json();
        return data.map(mod => mod.downloadCount);
    }
};
