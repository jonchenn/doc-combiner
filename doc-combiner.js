const puppeteer = require('puppeteer');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const glob = require('glob');
const assert = require('assert');
const fs = require('fs');
const PDFDocument = require('pdfkit');

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
  await page.setViewport({ width: 800, height: 1200});

  let files = glob.sync(resolveHome(inputRegex), {});

  let outputFiles = [];

  for (let i=0; i<files.length; i++) {
    let filename = files[i];  
    let absolutePath = path.resolve(filename);
    let outputFilename = outputPath + '/' + path.basename(filename) + '-screenshot.png';

    console.log(`Loading "${absolutePath}"`);
    await page.goto('file://' + absolutePath);

    console.log(`Output to ${outputFilename}`);
    await page.screenshot({path: outputFilename});
    outputFiles.push(path.resolve(outputFilename));
  }

  await browser.close();  

  // Output merged PDF
  console.log('Writing into a PDF file...');
  let doc = new PDFDocument();

  for (let j=0; j<outputFiles.length; j++) {
    filename = outputFiles[j];
    console.log(filename);

    doc.image(filename, 0, 0, {
      width: doc.page.width,
      align: 'center',
      valign: 'center'
    });
    if (j < outputFiles.length - 1) doc.addPage();
  }
  doc.pipe(fs.createWriteStream(outputPath + '/output.pdf'));
  doc.end();

  console.log('Complete.');
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

function test() {
  let doc = new PDFDocument();
  doc.image('./tmp/test.png', 0, 0, {
    width: doc.page.width,
    align: 'center',
    valign: 'center'
  });
  
  doc.pipe(fs.createWriteStream('./tmp/output.pdf'));
  doc.end();  
}

module.exports = {
  begin,
  test,
};