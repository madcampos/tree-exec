/*eslint-env node*/
/*global process*/
'use strict';
let fs = require('fs');
let path = require('path');
let minimatch = require('minimatch');

/**
 * Filters a path based on a regexp or glob pattern.
 * @param {String} basePath The base path where the search will be performed.
 * @param {String} pattern A string defining a regexp of a glob pattern.
 * @param {String} type The search pattern type, can be a regexp or a glob.
 * @param {Object} options A object containing options to the search.
 * @param {Object} options.globOptions The options passed to minimatch's glob parser.
 * @param {String} options.flags A string containig the flags that will be passed to the regexp pattern.
 * @param {Number} options.depth The maximum directory depth to do the search.
 * @param {Boolean} options.excludeDot A option to set if files and directories starting with `.` will be excluded from the search.
 * @return {Array} A list containing the filtered paths.
 * @see https://github.com/isaacs/minimatch
 */
function pathFilter(basePath, pattern, type, options){
	let fileList = [];
	let searchPattern;
	let maxDepth = options.depth || 10;

	/**
	 * Walks a directory
	 * @param {String} dir The directory path to search.
	 * @param {Number} currentDepth The current directory depth.
	 */
	function walk(dir, currentDepth){
		fs.readdirSync(dir).forEach((file) => {
			let fullPath = path.join(dir, file);
			if (fs.lstatSync(fullPath).isDirectory()) {
				if (currentDepth < maxDepth) {
					walk(path.join(fullPath), currentDepth + 1);
				}
			} else {
				fileList.push(fullPath);
			}
		});
	}

	if (!fs.lstatSync(basePath).isDirectory()) {
		throw new Error('Path is not a directory.');
	}

	walk(basePath, 0);

	if (type === 'glob') {
		return fileList.filter(minimatch.filter(pattern, options.globOptions));
	}

	if (options.excludeDot) {
		let excludeDotRegexp = /\\\.|\/\./;
		fileList = fileList.filter((file) => !excludeDotRegexp.test(file));
	}

	if (options.excludeLibrary) {
		let excludeNodeModules = /node_modules|jspm_packages|bower_components/;
		fileList = fileList.filter((file) => !excludeNodeModules.test(file));
	}

	if (type === 'all') {
		searchPattern = new RegExp('^.*$', options.flags);
	}

	if (type === 'regexp') {
		searchPattern = new RegExp(pattern, options.flags);
	}

	return fileList.filter((file) => searchPattern.test(file));
}
/**
 * Path transformation function based on given string parameters.
 * @param {String} transformString The transformation string.
 * @returns {Function} A function that accepts a path as argument and return it's transformation.
 */
function transformPath(transformString){
	let flags = transformString.match(/[~pnerfszmt]/gi);

	if (!flags) {
		throw new Error('No transformation pattern.');
	}

	/**
	 * Formats a given date.
	 * @param {Date} date The date to format.
	 * @return {String} A string containing the formated date.
	 */
	function dateFormat(date){
		return `${date.getFullYear()}${('00' + date.getMonth()).slice(-2)}${('00' + date.getDate()).slice(-2)}${('00' + date.getHours()).slice(-2)}${('00' + date.getMinutes()).slice(-2)}${('00' + date.getSeconds()).slice(-2)}${('000' + date.getMilliseconds()).slice(-3)}`;
	}

	/**
	 * Formats a size to human redable numbers.
	 * @param {Number} size The size in bytes.
	 * @returns {String} The size in human redable format.
	 */
	function sizeFormat(size){
		//TODO: refatcor the method, see if there is a better alternative
		let i = -1;
		let byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		let bytes = size;

		do {
			bytes = bytes / 1024;
			i++;
		} while (bytes > 1024);

		return Math.max(bytes, 0.1).toFixed(1) + byteUnits[i];
	}

	//Optimize for the most common case
	if (flags.indexOf('f') !== -1 && flags.length === 1) {
		return (file) => file;
	}

	return function(file){
		let status = fs.lstatSync(file);
		let filePath = '';

		if (flags.indexOf('a') !== -1) {
			//TODO: add attributes flag
		}

		if (flags.indexOf('m') !== -1) {
			filePath += dateFormat(status.ctime);
		}

		if (flags.indexOf('t') !== -1) {
			filePath += dateFormat(status.birthtime);
		}

		if (flags.indexOf('z') !== -1) {
			filePath += status.size;
		}

		if (flags.indexOf('s') !== -1) {
			filePath += sizeFormat(status.size);
		}

		if (flags.indexOf('r') !== -1 && flags.indexOf('p') === -1 && flags.indexOf('f') === -1) {
			filePath += path.dirname(path.relative(process.cwd(), file)) + path.sep;
		}

		if (flags.indexOf('p') !== -1 && flags.indexOf('f') === -1) {
			filePath += path.dirname(path.resolve(file)) + path.sep;
		}

		if (flags.indexOf('f') !== -1) {
			filePath += path.resolve(file);
		}

		if (flags.indexOf('n') !== -1) {
			filePath += path.basename(file, path.extname(file));
		}

		if (flags.indexOf('e') !== -1) {
			filePath += path.extname(file);
		}

		if (flags.indexOF('~') !== -1) {
			filePath = `"${filePath}"`;
		}

		return filePath;
	};
}

module.exports = {
	filter: pathFilter,
	transform: transformPath
};