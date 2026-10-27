const fs = require('fs');
let c = fs.readFileSync('src/router.tsx', 'utf8');

const target = `path: 'shop-portal',
        element: <ShopkeeperPortalPage />,`;

const replacement = `path: 'shop-portal',
        element: <ShopkeeperPortalPage />,
      },
      {
        path: 'shopkeeper-portal',
        element: <ShopkeeperPortalPage />,
      },
      {
        path: 'analytics',
        element: <ManufacturingLineagePage />,`;

c = c.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (c.includes(normTarget)) {
  c = c.replace(normTarget, normReplacement);
  fs.writeFileSync('src/router.tsx', c, 'utf8');
  console.log('Successfully updated router.tsx with aliases!');
} else {
  console.log('Target not found in router.tsx');
}

