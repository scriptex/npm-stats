import { writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { randomBytes } from 'crypto';

import { markdownMagic } from 'markdown-magic';
import { markdownTable } from 'markdown-table';

import pkg from './package.json' with { type: 'json' };
import badgeConfig from './badge.json' with { type: 'json' };

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

function randomFloat() {
	const buf = randomBytes(4);
	const num = buf.readUInt32BE(0);
	return num / 0xffffffff;
}

async function fetchPackageDownloads(name, maxRetries = 3) {
	const today = new Date();
	const endDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
	const startDate = pkg.stats.startDate;
	const url = `https://api.npmjs.org/downloads/range/${startDate}:${endDate}/${name}`;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const res = await fetch(url);

			if (!res.ok) {
				console.error(`❌ [${name}] HTTP ${res.status} ${res.statusText}`);

				throw new Error(`HTTP ${res.status}`);
			}

			const text = await res.text();

			if (!text.trim().startsWith('{')) {
				console.warn(`⚠️  [${name}] Response not JSON (probably rate-limited)`);

				throw new Error('Non-JSON response');
			}

			const json = JSON.parse(text);
			const count = json.downloads ? json.downloads.reduce((sum, d) => sum + d.downloads, 0) : 0;

			console.log(`✅ [${name}] ${count.toLocaleString()} downloads`);

			return count;
		} catch (err) {
			const delay = 1000 * Math.pow(2, attempt - 1) + randomFloat() * 500;

			console.warn(`⏳ [${name}] Retry ${attempt}/${maxRetries} in ${Math.round(delay)}ms (${err.message})`);

			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}

	console.error(`❌ [${name}] Failed after ${maxRetries} retries`);

	return 0;
}

(async () => {
	console.log(`⏳ Fetching packages downloads data for user ${key} from NPM. Please wait...`);

	const data = [];

	for (const name of names) {
		const count = await fetchPackageDownloads(name);
		const delay = 1500 + randomFloat() * 500;

		data.push({ name, count });

		console.log(`⏸ Waiting ${Math.round(delay)}ms before next package...`);

		await new Promise(resolve => setTimeout(resolve, delay));
	}

	const sum = data.reduce((sum, curr) => sum + curr.count, 0);

	const sortedStats = data.toSorted(({ name: aName }, { name: bName }) =>
		aName > bName ? 1 : aName < bName ? -1 : 0
	);

	const mappedStats = sortedStats.map(item => {
		const { name, count } = item;

		return [`[${name}](https://www.npmjs.com/package/${name})`, count];
	});

	badgeConfig.message = `${sum} Downloads`;

	await writeFileSync('./badge.json', JSON.stringify(badgeConfig, null, 2));

	await markdownMagic(join(__dirname, 'README.md'), {
		matchWord: 'AUTO-GENERATED-CONTENT',
		transforms: {
			customTransform: () => markdownTable([['Name', 'Downloads'], ...mappedStats, ['**Sum**', `**${sum}**`]])
		}
	});
})();
