const metaTags = {
  home: {
    title: 'ETC Hub - The Future of Ethereum Classic',
    description: 'Join the premier community platform for Ethereum Classic enthusiasts. Connect, share insights, and shape the future of decentralized blockchain technology.',
    image: 'https://etc-hub.onrender.com/resources/hub.jpeg',
    type: 'website'
  },
  news: {
    title: 'ETC News & Insights - ETC Hub',
    description: 'Stay informed with the latest news, analysis, and community discussions about Ethereum Classic.',
    image: 'https://etc-hub.onrender.com/resources/hub.jpeg',
    type: 'website'
  },
  submit: {
    title: 'Submit Your Article - ETC Hub',
    description: 'Share your insights, knowledge, and experiences about Ethereum Classic with our community.',
    image: 'https://etc-hub.onrender.com/resources/hub.jpeg',
    type: 'website'
  },
  article: {
    title: '{{TITLE}}',
    description: '{{DESCRIPTION}}',
    image: 'https://etc-hub.onrender.com/resources/hub.jpeg',
    type: 'article'
  }
};

function generateMetaTags(pageType, customData = {}) {
  const data = { ...metaTags[pageType], ...customData };
  return `
    <!-- Open Graph Meta Tags for Social Sharing -->
    <meta property="og:title" content="${data.title}">
    <meta property="og:description" content="${data.description}">
    <meta property="og:image" content="${data.image}">
    <meta property="og:type" content="${data.type}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${data.title}">
    <meta name="twitter:description" content="${data.description}">
    <meta name="twitter:image" content="${data.image}">`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { metaTags, generateMetaTags };
}
