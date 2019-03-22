const puppeteer = require('puppeteer');
// const pixelmatch = require('pixelmatch');
const IMG_DIR = 'shots';
// const GOLDEN_DIR = 'golden';

// const setupDirectories = () => {
//   if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR);

//   // And its wide screen/small screen subdirectories.
//   if (!fs.existsSync(`${IMG_DIR}/wide`)) fs.mkdirSync(`${IMG_DIR}/wide`);
//   if (!fs.existsSync(`${IMG_DIR}/narrow`)) fs.mkdirSync(`${IMG_DIR}/narrow`);
// };

// async function compareScreenshots(fileName) {
//   return new Promise((resolve, reject) => {
//     const img1 = fs.createReadStream(`${IMG_DIR}/${fileName}.png`).pipe(new PNG()).on('parsed', doneReading);
//     const img2 = fs.createReadStream(`${GOLDEN_DIR}/${fileName}.png`).pipe(new PNG()).on('parsed', doneReading);

//     let filesRead = 0;
//     function doneReading() {
//       // Wait until both files are read.
//       if (++filesRead < 2) return;

//       // The files should be the same size.
//       // expect(img1.width, 'image widths are the same').equal(img2.width);
//       // expect(img1.height, 'image heights are the same').equal(img2.height);

//       // Do the visual diff.
//       const diff = new PNG({ width: img1.width, height: img2.height });
//       const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });

//       // The files should look the same.
//       resolve();
//     }
//   });
// }

// CONFIGS
const routes = [
  {
    domain: 'https://wayfair.de',
    route: '',
    name: 'de-home'
  },
  {
    domain: 'https://wayfair.com',
    route: '',
    name: 'home'
  }
];

const sizes = [{ width: 375, height: 667 }, { width: 1000, height: 200 }];

async function takeAndCompareScreenshot({ domain, page, route = '', viewport, imagePath }) {
  page.setViewport(viewport);

  // Start the browser, go to that page, and take a screenshot.
  await page.goto(`${domain}/${route}`);
  console.log(`${domain}/${route}`);

  // clear veil
  page.evaluate(() => {
    const popups = document.querySelectorAll('.popup-block');
    popups.forEach(domNode => {
      domNode.parentNode.removeChild(domNode);
    });
  });

  await page.screenshot({ path: imagePath });
  console.log(imagePath);

  // Test to see if it's right.
  // return compareScreenshots(fileName);
}

const imagePaths = [];

(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  const shotFns = [];
  routes.forEach(({ domain, route, name }) => {
    sizes.forEach(viewport => {
      const imagePath = `${IMG_DIR}/${name}-${viewport.width}x${viewport.height}-${route}.png`;
      imagePaths.push(imagePath);
      shotFns.push(() => takeAndCompareScreenshot({ domain, page, route, viewport, name, imagePath }));
    });
  });
  await shotFns.reduce((acc, next) => acc.then(() => next()), Promise.resolve()).catch(e => {
    console.log(e);
  });
  browser.close();
})()
  .then(() => process.exit(1))
  .catch(e => console.log(e));
