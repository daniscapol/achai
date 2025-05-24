import https from 'https';
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

// Function to search for images using a simple image search approach
async function searchForImage(productName, productType) {
  const searchTerms = [
    `${productName} logo`,
    `${productName} icon`,
    `${productName} ${productType}`,
    productName,
    `${productName} github`,
    `${productName} project`
  ];

  // Common image URLs for popular projects
  const knownImages = {
    // MCP Servers - Official ones
    'filesystem': 'https://cdn-icons-png.flaticon.com/512/716/716784.png',
    'git': 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png',
    'github': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    'postgresql': 'https://www.postgresql.org/media/img/about/press/elephant.png',
    'sqlite': 'https://www.sqlite.org/images/sqlite370_banner.gif',
    'fetch': 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    'puppeteer': 'https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png',
    'slack': 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
    'google drive': 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png',
    'google maps': 'https://developers.google.com/static/maps/images/maps-icon.svg',
    'brave search': 'https://brave.com/static-assets/images/brave-logo.png',
    'everart': 'https://cdn-icons-png.flaticon.com/512/3659/3659898.png',
    'aws': 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png',
    'time': 'https://cdn-icons-png.flaticon.com/512/684/684806.png',
    'everything': 'https://www.voidtools.com/Everything.ico',
    'memory': 'https://cdn-icons-png.flaticon.com/512/2997/2997933.png',
    'sentry': 'https://sentry-brand.storage.googleapis.com/sentry-logo-black.png',
    'youtube': 'https://www.youtube.com/img/desktop/yt_1200.png',
    'speedtest': 'https://www.speedtest.net/images/icons/speedtest.png',
    'azure': 'https://swimburger.net/media/ppnn3pcl/azure.png',
    'cloudflare': 'https://www.cloudflare.com/img/logo-web-badges/cf-logo-on-white-bg.svg',
    'docker': 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png',
    'kubernetes': 'https://kubernetes.io/images/kubernetes-horizontal-color.png',
    'neon': 'https://neon.tech/brand/neon-logo-dark-color.svg',
    'axiom': 'https://axiom.co/assets/logo.svg',
    'raycast': 'https://www.raycast.com/uploads/raycast-logo.png',
    'linear': 'https://linear.app/favicon/favicon.png',
    'obsidian': 'https://obsidian.md/images/obsidian-logo-gradient.svg',
    'notion': 'https://www.notion.so/images/logo-ios.png',
    'anthropic': 'https://www.anthropic.com/images/icons/anthropic-icon.svg',
    'openai': 'https://openai.com/favicon.ico',
    'supabase': 'https://supabase.com/_next/image?url=%2Fimages%2Flogo-preview.jpg&w=1200&q=75',
    'firebase': 'https://firebase.google.com/images/brand-guidelines/logo-logomark.png',
    'vercel': 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png',
    'netlify': 'https://www.netlify.com/img/press/logos/full-logo-light.svg',
    'stripe': 'https://stripe.com/img/v3/home/social.png',
    'twilio': 'https://www.twilio.com/content/dam/twilio-com/global/en/blog/legacy/2017/TwilioLogo_Red.png',
    'sendgrid': 'https://sendgrid.com/wp-content/themes/sgdotcom/pages/resource/brand/2016/SendGrid-Logomark.png',
    'mongodb': 'https://www.mongodb.com/assets/images/global/favicon.ico',
    'redis': 'https://redis.io/images/redis-white.png',
    'elasticsearch': 'https://static-www.elastic.co/v3/assets/bltefdd0b53724fa2ce/blt6ae3d6980b5fd629/5bbca1d1af3a954c36f95ed3/logo-elastic-elasticsearch-lt.svg',
    'influxdb': 'https://www.influxdata.com/wp-content/uploads/influxdb-logo.png',
    'prometheus': 'https://prometheus.io/assets/prometheus_logo_grey.svg',
    'grafana': 'https://grafana.com/static/img/logos/grafana_logo.svg',
    'discord': 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
    'telegram': 'https://telegram.org/img/t_logo.png',
    'whatsapp': 'https://static.whatsapp.net/rsrc.php/v3/yz/r/ujTY9i_3-1_.png',
    'jira': 'https://wac-cdn.atlassian.com/dam/jcr:e348b562-4152-4cdc-8a55-3d297e509cc8/Jira%20Software-blue.svg',
    'confluence': 'https://wac-cdn.atlassian.com/dam/jcr:5fa10460-6749-41b4-9069-0c4c4c72c8b4/Confluence-blue.svg',
    'trello': 'https://a.trellocdn.com/prgb/dist/images/header-logo-spirit-loading.87e1af770a49ce8e84e3.gif',

    // AI Agents
    'autogen': 'https://microsoft.github.io/autogen/assets/images/autogen_agentchat-250c3e2b77b87e070f7879e78d81b567.png',
    'autogpt': 'https://github.com/Significant-Gravitas/AutoGPT/raw/master/assets/AutoGPT_Logo.png',
    'babyagi': 'https://raw.githubusercontent.com/yoheinakajima/babyagi/main/babyagi_logo.png',
    'crewai': 'https://raw.githubusercontent.com/joaomdmoura/crewAI/main/docs/crewai_logo.png',
    'langgraph': 'https://python.langchain.com/assets/images/langchain_logo-7ca3d1ed1dd6e1c63e1893ec3f8f61d3.svg',
    'metagpt': 'https://github.com/geekan/MetaGPT/raw/main/docs/resources/MetaGPT-logo.jpeg',
    'agentgpt': 'https://github.com/reworkd/AgentGPT/raw/main/public/banner.png',
    'gpt engineer': 'https://github.com/AntonOsika/gpt-engineer/raw/main/docs/logo.png',
    'gpt pilot': 'https://raw.githubusercontent.com/Pythagora-io/gpt-pilot/main/pilot-logo.png',
    'aider': 'https://aider.chat/assets/aider-logo.svg',
    'cursor': 'https://cursor.sh/favicon.ico',
    'gpt researcher': 'https://raw.githubusercontent.com/assafelovic/gpt-researcher/master/docs/gptr-logo.png',
    'browser-use': 'https://cdn-icons-png.flaticon.com/512/1183/1183621.png',
    'lavague': 'https://raw.githubusercontent.com/lavague-ai/LaVague/main/docs/assets/logo.png',
    'webvoyager': 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
    'chatdev': 'https://github.com/OpenBMB/ChatDev/raw/main/misc/logo1.png',
    'agentscope': 'https://raw.githubusercontent.com/modelscope/agentscope/main/docs/sphinx_doc/en/source/_static/image/agentscope-logo.png',
    'langchain': 'https://python.langchain.com/assets/images/langchain_logo-7ca3d1ed1dd6e1c63e1893ec3f8f61d3.svg',
    'haystack': 'https://haystack.deepset.ai/images/haystack-logo.png',
    'semantic kernel': 'https://github.com/microsoft/semantic-kernel/raw/main/docs/media/logo.png',
    'whisper': 'https://openai.com/favicon.ico',
    'pandas ai': 'https://github.com/gventuri/pandas-ai/raw/main/assets/logo.png',
    
    // Default fallbacks by type
    'mcp_server_default': 'https://cdn-icons-png.flaticon.com/512/1336/1336494.png',
    'ai_agent_default': 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png'
  };

  // Try to find a known image first
  const normalizedName = productName.toLowerCase().trim();
  
  // Check exact matches
  if (knownImages[normalizedName]) {
    return knownImages[normalizedName];
  }

  // Check partial matches
  for (const [key, url] of Object.entries(knownImages)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return url;
    }
  }

  // GitHub specific handling
  if (productName.toLowerCase().includes('github') || productName.toLowerCase().includes('git')) {
    return 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
  }

  // Google specific handling
  if (productName.toLowerCase().includes('google')) {
    return 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
  }

  // Microsoft specific handling
  if (productName.toLowerCase().includes('microsoft') || productName.toLowerCase().includes('azure')) {
    return 'https://swimburger.net/media/ppnn3pcl/azure.png';
  }

  // AWS specific handling
  if (productName.toLowerCase().includes('aws') || productName.toLowerCase().includes('amazon')) {
    return 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png';
  }

  // AI/ML specific handling
  if (productName.toLowerCase().includes('gpt') || productName.toLowerCase().includes('ai')) {
    return 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png';
  }

  // Database specific handling
  if (productName.toLowerCase().includes('sql') || productName.toLowerCase().includes('database') || productName.toLowerCase().includes('db')) {
    return 'https://cdn-icons-png.flaticon.com/512/4299/4299956.png';
  }

  // Web specific handling
  if (productName.toLowerCase().includes('web') || productName.toLowerCase().includes('browser') || productName.toLowerCase().includes('http')) {
    return 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png';
  }

  // Mobile specific handling
  if (productName.toLowerCase().includes('mobile') || productName.toLowerCase().includes('app')) {
    return 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png';
  }

  // Use default based on product type
  if (productType === 'mcp_server') {
    return knownImages['mcp_server_default'];
  } else if (productType === 'ai_agent') {
    return knownImages['ai_agent_default'];
  }

  // Final fallback
  return 'https://cdn-icons-png.flaticon.com/512/1336/1336494.png';
}

async function validateImageUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      };

      const protocol = parsedUrl.protocol === 'https:' ? https : require('http');
      
      const req = protocol.request(options, (res) => {
        const isImage = res.headers['content-type'] && res.headers['content-type'].startsWith('image/');
        const isOk = res.statusCode >= 200 && res.statusCode < 400;
        resolve(isImage && isOk);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => resolve(false));
      req.setTimeout(5000);
      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

async function findAndUpdateImages() {
  console.log('🖼️  Image Finder and Updater for MCP Servers and AI Agents');
  console.log('🔍 Finding products with placeholder images...\n');

  try {
    // Find all products with emoji placeholders (🤖 for MCP servers, 🧠 for AI agents)
    const result = await pool.query(`
      SELECT id, name, product_type, image_url, icon_url 
      FROM products 
      WHERE (image_url = '🤖' OR image_url = '🧠' OR icon_url = '🤖' OR icon_url = '🧠')
      ORDER BY product_type, name
    `);
    
    const products = result.rows;
    console.log(`📋 Found ${products.length} products with placeholder images`);
    
    if (products.length === 0) {
      console.log('✅ All products already have proper images!');
      return;
    }

    // Group by type for better organization
    const mcpServers = products.filter(p => p.product_type === 'mcp_server');
    const aiAgents = products.filter(p => p.product_type === 'ai_agent');
    const others = products.filter(p => !['mcp_server', 'ai_agent'].includes(p.product_type));

    console.log(`📊 Breakdown:`);
    console.log(`  - MCP Servers: ${mcpServers.length}`);
    console.log(`  - AI Agents: ${aiAgents.length}`);
    console.log(`  - Others: ${others.length}\n`);

    console.log('🔍 Searching for images and updating database...\n');

    let updatedCount = 0;
    let failedCount = 0;

    for (const [index, product] of products.entries()) {
      try {
        console.log(`[${index + 1}/${products.length}] Processing: ${product.name} (${product.product_type})`);
        
        // Search for an appropriate image
        const imageUrl = await searchForImage(product.name, product.product_type);
        console.log(`  🔍 Found image: ${imageUrl}`);

        // Validate the image URL
        const isValid = await validateImageUrl(imageUrl);
        console.log(`  ✅ Image validation: ${isValid ? 'Valid' : 'Failed, using anyway'}`);

        // Truncate URL if too long for database field
        const truncatedUrl = imageUrl.length > 255 ? imageUrl.substring(0, 255) : imageUrl;
        
        // Update both image_url and icon_url with the found image
        const updateQuery = 'UPDATE products SET image_url = $1, icon_url = $2 WHERE id = $3';
        await pool.query(updateQuery, [truncatedUrl, truncatedUrl, product.id]);
        
        console.log(`  ✅ Updated database with new image URL\n`);
        updatedCount++;

        // Small delay to be respectful to external services
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`  ❌ Error processing ${product.name}: ${error.message}\n`);
        failedCount++;
      }
    }

    console.log('🎉 Image finding and updating completed!');
    console.log(`📊 Final Summary:`);
    console.log(`  - Products processed: ${products.length}`);
    console.log(`  - Successfully updated: ${updatedCount}`);
    console.log(`  - Failed to update: ${failedCount}`);
    console.log(`  - Success rate: ${((updatedCount / products.length) * 100).toFixed(1)}%`);
    
    console.log('\n✅ Images have been updated!');
    console.log('🔍 Note: Images are sourced from official websites and icon libraries');
    console.log('📝 You can manually replace any images that don\'t look good');

  } catch (error) {
    console.error('❌ Error during image finding and updating:', error);
  } finally {
    await pool.end();
  }
}

// Run the image finder and updater
findAndUpdateImages();