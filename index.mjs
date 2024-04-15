import { writeFileSync } from 'fs';
import { join, resolve } from 'path';

import { markdownMagic } from 'markdown-magic';
import { markdownTable } from 'markdown-table';

import pkg from './package.json' assert { type: 'json' };
import badgeConfig from './badge.json' assert { type: 'json' };

const key = pkg.stats?.user;
const __dirname = resolve();

if (!key) {
	throw new Error('Please add `user` in the `stats` field of your package.json');
}

const names = [
	'@three11/accordion',
	'@three11/animate-top-offset',
	'@three11/debounce',
	'@three11/dom-helpers',
	'@three11/extract-query-arg',
	'@three11/infinite-scroll',
	'@three11/istouch',
	'@three11/optisize',
	'@three11/scrollspy',
	'animateme',
	'async-array-prototype',
	'attr-i18n',
	'create-pwa',
	'create-react-app-ts',
	'dator',
	'gitlab-calendar',
	'hover-media-query',
	'html-head-component',
	'html5-form-validator',
	'introscroll',
	'itcss',
	'itscss',
	'lastfm-ts-api',
	'localga',
	'node-mysql-client',
	'npm-maintainer',
	'pass-score',
	'postcss-watch-folder',
	'random-splice',
	'react-accordion-ts',
	'react-dropper',
	'react-round-carousel',
	'react-svg-donuts',
	'round-carousel-component',
	'scriptex-socials',
	'scss-goodies',
	'simple-calendar-widget',
	'svg-symbol-sprite',
	'svg64',
	'svgo-add-viewbox',
	'svgo-viewbox',
	'touchsweep',
	'typed-usa-states',
	'universal-github-client',
	'webpack-mpa',
	'webpack-mpa-next',
	'webpack-mpa-ts'
];

(async () => {
	console.log(`Fetching data for user ${key} from NPM. Please wait...`);

	const today = new Date();
	const endDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

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

	await markdownMagic(join(__dirname, 'README.md'), {
		matchWord: 'AUTO-GENERATED-CONTENT',
		transforms: {
			customTransform: () => markdownTable([['Name', 'Downloads'], ...sortedStats, ['**Sum**', `**${sum}**`]])
		}
	});
})();
