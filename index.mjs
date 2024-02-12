import { writeFileSync } from 'fs';
import { join, resolve } from 'path';

import magic from 'markdown-magic';
import { markdownTable } from 'markdown-table';

import pkg from './package.json' assert { type: 'json' };
import badgeConfig from './badge.json' assert { type: 'json' };

const key = pkg.stats?.user;
const __dirname = resolve();

if (!key) {
	throw new Error('Please add `user` in the `stats` field of your package.json');
}

function generateMarkdownTable(tableRows, sum) {
	const config = {
		transforms: {
			PACKAGES() {
				return markdownTable([['Name', 'Downloads'], ...tableRows, ['**Sum**', `**${sum}**`]]);
			}
		}
	};

	magic(join(__dirname, 'README.md'), config, d => {
		console.log(`Updated total downloads ${sum}`);
	});
}

(async () => {
	console.log(`Fetching data for user ${key} from NPM. Please wait...`);

	const today = new Date();
	const endDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

	const own = await fetch(`https://api.npms.io/v2/search?q=author:${key}&size=250&from=0`).then(r => r.json());
	const co = await fetch(`https://api.npms.io/v2/search?q=maintainer:${key}&size=250&from=0`).then(r => r.json());
	const names = Array.from(new Set([...own.results, ...co.results].map(p => p.package.name)));
	const data = [];

	for (const name of names) {
		const count = await fetch(`https://api.npmjs.org/downloads/range/${pkg.stats.startDate}:${endDate}/${name}`)
			.then(r => r.json())
			.then(response => response.downloads.map(item => item.downloads).reduce((sum, curr) => sum + curr, 0));

		data.push({
			name,
			count
		});
	}

	const sum = data.reduce((sum, curr) => sum + curr.count, 0);

	const sortedStats = data
		.sort(({ name: aName }, { name: bName }) => (aName > bName ? 1 : aName < bName ? -1 : 0))
		.map(item => {
			const { name, count } = item;

			return [`[${name}](https://www.npmjs.com/package/${name})`, count];
		});

	badgeConfig.message = `${sum} Downloads`;

	await writeFileSync('./badge.json', JSON.stringify(badgeConfig, null, 2));

	generateMarkdownTable(sortedStats, sum);
})();
