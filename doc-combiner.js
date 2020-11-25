const puppeteer = require('puppeteer');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const glob = require('glob');
const assert = require('assert');
const fs = require('fs-extra');

/**
 * Main CLI function.
 */
async function begin() {
  let inputRegex = argv['_'][0];
  let outputPath = argv['_'][1];

  if (!inputRegex || !outputPath) {
    printUsage();
    return;
  }

  assert(inputRegex, 'Missing inputRegex in the parameter.');
  assert(outputPath, 'Missing outputPath in the parameter.');
  console.log(`Using regex: ${inputRegex}`);
  console.log(`Using outputPath: ${outputPath}`);

  if (!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath);
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let files = glob.sync(resolveHome(inputRegex), {});

  console.log(files);

  for (let i=0; i<files.length; i++) {
    let filename = files[i];  
    let absolutePatth = path.resolve(filename);
    let outputFilename = outputPath + '/' + path.basename(filename) + '-screenshot.png';

    console.log(`Loading "${absolutePatth}"`);
    await page.goto('file://' + absolutePatth);

    console.log(`Output to ${outputFilename}`);
    await page.screenshot({path: outputFilename});
  }

  await browser.close();  
}

const printUsage = () => {
  let usage = `
Usage: ./combiner <INPUT_REGEX> <OUTPUT_PATH>
  `;
  console.log(usage);
}

function resolveHome(filepath) {
  if (filepath[0] === '~') {
      return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

module.exports = {
  begin,
};