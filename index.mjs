import { writeFileSync } from 'fs';
import { join, resolve } from 'path';

import magic from 'markdown-magic';
import npmtotal from 'npmtotal';
import { markdownTable } from 'markdown-table';

import pkg from './package.json';
import badgeConfig from './badge.json';

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

	const stats = await npmtotal(
		key,
		pkg.stats?.startDate
			? {
					startDate: pkg.stats.startDate
			  }
			: undefined
	);

	const sortedStats = stats.stats
		.sort(([aName], [bName]) => (aName > bName ? 1 : aName < bName ? -1 : 0))
		.map(item => {
			const [name, count] = item;

			return [`[${name}](https://www.npmjs.com/package/${name})`, count];
		});

	badgeConfig.message = `${stats.sum} Downloads`;

	await writeFileSync('./badge.json', JSON.stringify(badgeConfig, null, 2));

	generateMarkdownTable(sortedStats, stats.sum);
})();
