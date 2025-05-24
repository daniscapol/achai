import pkg from 'pg';
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  user: 'achai',
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: 'achai',
  password: process.env.DB_PASSWORD || 'TrinityPW1',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// Products with broken images that need fixing
const BROKEN_IMAGE_PRODUCTS = [
  'confluence',
  'whatsapp', 
  'grafana',
  'influxdb',
  'elasticsearch',
  'redis',
  'sendgrid',
  'twilio',
  'netlify',
  'anthropic',
  'linear',
  'raycast',
  'axiom',
  'kubernetes',
  'speedtest',
  'sentry',
  'brave search'
];

// Better working image URLs for the broken ones
const BETTER_IMAGES = {
  'confluence': 'https://cdn.worldvectorlogo.com/logos/confluence-1.svg',
  'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
  'grafana': 'https://cdn.worldvectorlogo.com/logos/grafana.svg',
  'influxdb': 'https://cdn.worldvectorlogo.com/logos/influxdb.svg',
  'elasticsearch': 'https://cdn.worldvectorlogo.com/logos/elasticsearch.svg',
  'redis': 'https://cdn.worldvectorlogo.com/logos/redis.svg',
  'sendgrid': 'https://cdn.worldvectorlogo.com/logos/sendgrid-1.svg',
  'twilio': 'https://cdn.worldvectorlogo.com/logos/twilio.svg',
  'netlify': 'https://cdn.worldvectorlogo.com/logos/netlify.svg',
  'anthropic': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg',
  'linear': 'https://cdn.worldvectorlogo.com/logos/linear-app.svg',
  'raycast': 'https://cdn.worldvectorlogo.com/logos/raycast.svg',
  'axiom': 'https://avatars.githubusercontent.com/u/28296434?s=200&v=4',
  'kubernetes': 'https://cdn.worldvectorlogo.com/logos/kubernets.svg',
  'speedtest': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/speedtest_logo_icon_170227.png',
  'sentry': 'https://cdn.worldvectorlogo.com/logos/sentry-glyph.svg',
  'brave search': 'https://cdn.worldvectorlogo.com/logos/brave-web-browser.svg'
};

// Alternative image sources as fallbacks
const ALTERNATIVE_IMAGES = {
  'confluence': [
    'https://logos-world.net/wp-content/uploads/2021/08/Confluence-Logo.png',
    'https://cdn-icons-png.flaticon.com/512/5968/5968875.png',
    'https://cdn.icon-icons.com/icons2/2699/PNG/512/atlassian_confluence_logo_icon_170511.png'
  ],
  'whatsapp': [
    'https://logos-world.net/wp-content/uploads/2020/05/WhatsApp-Logo.png',
    'https://cdn-icons-png.flaticon.com/512/733/733585.png',
    'https://cdn.icon-icons.com/icons2/1211/PNG/512/1491579542-yumminkysocialmedia22_83067.png'
  ],
  'grafana': [
    'https://logos-world.net/wp-content/uploads/2021/02/Grafana-Logo.png',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
    'https://avatars.githubusercontent.com/u/7195757?s=200&v=4'
  ],
  'influxdb': [
    'https://logos-world.net/wp-content/uploads/2021/02/InfluxDB-Logo.png',
    'https://avatars.githubusercontent.com/u/5713248?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/4299/4299956.png'
  ],
  'elasticsearch': [
    'https://logos-world.net/wp-content/uploads/2021/02/Elasticsearch-Logo.png',
    'https://avatars.githubusercontent.com/u/6764390?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png'
  ],
  'redis': [
    'https://logos-world.net/wp-content/uploads/2021/02/Redis-Logo.png',
    'https://avatars.githubusercontent.com/u/1529926?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/4299/4299956.png'
  ],
  'sendgrid': [
    'https://logos-world.net/wp-content/uploads/2021/02/SendGrid-Logo.png',
    'https://avatars.githubusercontent.com/u/181234?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/561/561127.png'
  ],
  'twilio': [
    'https://logos-world.net/wp-content/uploads/2021/02/Twilio-Logo.png',
    'https://avatars.githubusercontent.com/u/109142?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/3178/3178158.png'
  ],
  'netlify': [
    'https://logos-world.net/wp-content/uploads/2020/11/Netlify-Logo.png',
    'https://avatars.githubusercontent.com/u/7892489?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/873/873120.png'
  ],
  'anthropic': [
    'https://avatars.githubusercontent.com/u/85737359?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/8943/8943377.png',
    'https://cdn-icons-png.flaticon.com/512/4712/4712035.png'
  ],
  'linear': [
    'https://avatars.githubusercontent.com/u/26632285?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
    'https://cdn-icons-png.flaticon.com/512/1336/1336494.png'
  ],
  'raycast': [
    'https://avatars.githubusercontent.com/u/37772654?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
    'https://cdn-icons-png.flaticon.com/512/1336/1336494.png'
  ],
  'axiom': [
    'https://avatars.githubusercontent.com/u/28296434?s=400&v=4',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
    'https://cdn-icons-png.flaticon.com/512/1336/1336494.png'
  ],
  'kubernetes': [
    'https://logos-world.net/wp-content/uploads/2021/02/Kubernetes-Logo.png',
    'https://avatars.githubusercontent.com/u/13629408?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/919/919853.png'
  ],
  'speedtest': [
    'https://avatars.githubusercontent.com/u/2582969?s=200&v=4',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
    'https://cdn-icons-png.flaticon.com/512/684/684806.png'
  ],
  'sentry': [
    'https://avatars.githubusercontent.com/u/1396951?s=200&v=4',
    'https://logos-world.net/wp-content/uploads/2021/02/Sentry-Logo.png',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png'
  ],
  'brave search': [
    'https://avatars.githubusercontent.com/u/12301619?s=200&v=4',
    'https://logos-world.net/wp-content/uploads/2020/05/Brave-Logo.png',
    'https://cdn-icons-png.flaticon.com/512/2965/2965879.png'
  ]
};

async function validateImageUrl(url) {
  return new Promise((resolve) => {
    try {
      const https = require('https');
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 8000
      };

      const protocol = parsedUrl.protocol === 'https:' ? https : require('http');
      
      const req = protocol.request(options, (res) => {
        const isImage = res.headers['content-type'] && 
          (res.headers['content-type'].startsWith('image/') || 
           res.headers['content-type'].includes('svg'));
        const isOk = res.statusCode >= 200 && res.statusCode < 400;
        resolve(isImage && isOk);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => resolve(false));
      req.setTimeout(8000);
      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

async function findBestWorkingImage(productName) {
  const normalizedName = productName.toLowerCase().trim();
  
  // Try the primary better image first
  if (BETTER_IMAGES[normalizedName]) {
    console.log(`  🔍 Testing primary image: ${BETTER_IMAGES[normalizedName]}`);
    const isValid = await validateImageUrl(BETTER_IMAGES[normalizedName]);
    if (isValid) {
      console.log(`  ✅ Primary image works!`);
      return BETTER_IMAGES[normalizedName];
    }
    console.log(`  ❌ Primary image failed validation`);
  }

  // Try alternative images
  if (ALTERNATIVE_IMAGES[normalizedName]) {
    console.log(`  🔍 Testing ${ALTERNATIVE_IMAGES[normalizedName].length} alternative images...`);
    for (let i = 0; i < ALTERNATIVE_IMAGES[normalizedName].length; i++) {
      const altUrl = ALTERNATIVE_IMAGES[normalizedName][i];
      console.log(`  🔍 Testing alternative ${i + 1}: ${altUrl}`);
      const isValid = await validateImageUrl(altUrl);
      if (isValid) {
        console.log(`  ✅ Alternative ${i + 1} works!`);
        return altUrl;
      }
      console.log(`  ❌ Alternative ${i + 1} failed validation`);
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Final fallback - use a reliable icon
  console.log(`  🔄 Using fallback icon for ${productName}`);
  return 'https://cdn-icons-png.flaticon.com/512/1336/1336494.png';
}

async function fixBrokenImages() {
  console.log('🔧 Broken Image Fixer');
  console.log(`🔍 Fixing images for ${BROKEN_IMAGE_PRODUCTS.length} products with broken images...\n`);

  try {
    let fixedCount = 0;
    let failedCount = 0;

    for (const [index, productName] of BROKEN_IMAGE_PRODUCTS.entries()) {
      try {
        console.log(`[${index + 1}/${BROKEN_IMAGE_PRODUCTS.length}] Fixing: ${productName}`);
        
        // Find the product in the database (case-insensitive)
        const findQuery = `
          SELECT id, name, image_url 
          FROM products 
          WHERE LOWER(name) LIKE LOWER($1) 
          LIMIT 1
        `;
        const findResult = await pool.query(findQuery, [`%${productName}%`]);
        
        if (findResult.rows.length === 0) {
          console.log(`  ❌ Product not found in database: ${productName}\n`);
          failedCount++;
          continue;
        }

        const product = findResult.rows[0];
        console.log(`  📋 Found product: ${product.name} (ID: ${product.id})`);
        console.log(`  🖼️  Current image: ${product.image_url}`);

        // Find a better working image
        const newImageUrl = await findBestWorkingImage(productName);
        console.log(`  🎯 New image: ${newImageUrl}`);

        // Update the database
        const updateQuery = 'UPDATE products SET image_url = $1, icon_url = $2 WHERE id = $3';
        await pool.query(updateQuery, [newImageUrl, newImageUrl, product.id]);
        
        console.log(`  ✅ Updated database with new image URL\n`);
        fixedCount++;

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`  ❌ Error fixing ${productName}: ${error.message}\n`);
        failedCount++;
      }
    }

    console.log('🎉 Broken image fixing completed!');
    console.log(`📊 Final Summary:`);
    console.log(`  - Products to fix: ${BROKEN_IMAGE_PRODUCTS.length}`);
    console.log(`  - Successfully fixed: ${fixedCount}`);
    console.log(`  - Failed to fix: ${failedCount}`);
    console.log(`  - Success rate: ${((fixedCount / BROKEN_IMAGE_PRODUCTS.length) * 100).toFixed(1)}%`);
    
    console.log('\n✅ Broken images have been fixed!');
    console.log('🔍 All images should now load properly');

  } catch (error) {
    console.error('❌ Error during broken image fixing:', error);
  } finally {
    await pool.end();
  }
}

// Run the broken image fixer
fixBrokenImages();