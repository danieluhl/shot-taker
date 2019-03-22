const puppeteer = require('puppeteer');
const IMG_DIR = 'shots';

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
