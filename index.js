const fs = require('fs');
const path = require('path');

const magic = require('markdown-magic');
const table = require('markdown-table');
const npmtotal = require('npmtotal');

const pkg = require('./package.json');
const badgeConfig = require('./badge.json');

const key = pkg['npm-username'];

if (!key) {
	throw new Error('Please add `npm-username` to your package.json'); // eslint-disable-line
}

function generateMarkdownTable(tableRows, sum) {
	const config = {
		transforms: {
			PACKAGES() {
				return table([['Name', 'Downloads'], ...tableRows, ['**Sum**', `**${sum}**`]]);
			}
		}
	};

	magic(path.join(__dirname, 'README.md'), config, d => {
		console.log(`Updated total downloads ${sum}`);
	});
}

(async () => {
	console.log(`Fetching data for user ${key} from NPM. Please wait...`);

	const stats = await npmtotal(key);

	console.log(stats);

	const sortedStats = stats.stats
		.sort(([aName], [bName]) => (aName > bName ? 1 : aName < bName ? -1 : 0))
		.map(item => {
			const [name, count] = item;

			return [`[${name}](https://www.npmjs.com/package/${name})`, count];
		});

	badgeConfig.message = `${stats.sum} Downloads`;

	await fs.writeFileSync('./badge.json', JSON.stringify(badgeConfig, null, 2));

	generateMarkdownTable(sortedStats, stats.sum);
})();
