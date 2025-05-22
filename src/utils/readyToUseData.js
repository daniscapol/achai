/**
 * Ready to Use products data
 */

// Ready to Use products data for search and display
export const readyToUseProducts = [
  {
    id: 'relevance-ai',
    name: 'Relevance AI',
    description: 'Create and deploy your own AI workforce without coding',
    type: 'ready-to-use',
    categoryType: 'ready-to-use',
    category: 'AI Workforce Platform',
    tags: ['ai agents', 'automation', 'workflow', 'no-code', 'enterprise', 'business'],
    official: false,
    stars_numeric: 4500,
    local_image_path: '/assets/affiliate-images/relevance-ai/relevance-ai.png'
  },
  {
    id: 'customgpt',
    name: 'CustomGPT.ai',
    description: 'Build powerful AI chatbots that deliver exceptional customer experiences using your own business content',
    type: 'ready-to-use',
    categoryType: 'ready-to-use',
    category: 'AI Chatbot Platform',
    tags: ['chatbot', 'customer support', 'ai', 'automation', 'business', 'enterprise'],
    official: false,
    stars_numeric: 4200,
    local_image_path: '/assets/affiliate-images/customgpt/customgpt-logo-new.png'
  },
  {
    id: 'aistudios',
    name: 'AI Studios',
    description: 'Create lifelike AI avatars and videos for marketing, training, and customer engagement',
    type: 'ready-to-use',
    categoryType: 'ready-to-use',
    category: 'AI Video Platform',
    tags: ['video', 'avatar', 'marketing', 'content', 'production', 'multilingual'],
    official: false,
    stars_numeric: 3800,
    local_image_path: '/assets/affiliate-images/aistudios/aistudios-logo.png'
  },
  {
    id: 'rytr',
    name: 'Rytr',
    description: 'AI writing assistant that helps you create high-quality content in just seconds, at a fraction of the cost',
    type: 'ready-to-use',
    categoryType: 'ready-to-use',
    category: 'AI Writing Platform',
    tags: ['writing', 'content', 'marketing', 'copywriting', 'blog', 'social media'],
    official: false,
    stars_numeric: 4100,
    local_image_path: '/assets/affiliate-images/rytr/rytr-logo.png'
  }
];

// To ensure Ollama is not categorized as Ready to Use
export const excludeFromReadyToUse = ['ollama', 'local llm', 'llama'];