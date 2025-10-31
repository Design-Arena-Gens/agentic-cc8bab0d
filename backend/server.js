const express = require('express');
const cors = require('cors');
const redis = require('redis');
const Razorpay = require('razorpay');
const productData = require('./productData.json');
const { parseQuery } = require('./utils/parseQuery');

const app = express();
app.use(cors());
app.use(express.json());

// Redis client
let redisClient;
(async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.log('Redis connection failed, using in-memory fallback');
    redisClient = null;
  }
})();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Helper function for Redis operations with fallback
const inMemoryStore = {};
async function setData(key, value) {
  if (redisClient) {
    await redisClient.set(key, JSON.stringify(value));
  } else {
    inMemoryStore[key] = value;
  }
}

async function getData(key) {
  if (redisClient) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } else {
    return inMemoryStore[key] || null;
  }
}

// Search products endpoint
app.post('/api/search', async (req, res) => {
  const { query, userId = 'guest' } = req.body;

  // Parse query using LLM-like logic
  const filters = parseQuery(query);

  // Filter products
  let results = productData.filter(product => {
    if (filters.category && !product.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
    if (filters.color && !product.color.toLowerCase().includes(filters.color.toLowerCase())) return false;
    if (filters.brand && !product.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
    if (filters.material && !product.material.toLowerCase().includes(filters.material.toLowerCase())) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.gender && !product.gender.toLowerCase().includes(filters.gender.toLowerCase())) return false;
    return true;
  });

  // Get user preferences
  const userPrefs = await getData(`user:${userId}:prefs`) || { liked: [], disliked: [] };

  // Filter out disliked items
  results = results.filter(p => !userPrefs.disliked.includes(p.id));

  // Limit to 5 results
  results = results.slice(0, 5);

  res.json({
    products: results,
    filters: filters,
    followUp: results.length === 0
      ? "I couldn't find exact matches. Would you like to broaden your search?"
      : results.length < 3
        ? "Would you like to see more options with different filters?"
        : "Would you like to filter by delivery time or rating?"
  });
});

// Save user preference
app.post('/api/preference', async (req, res) => {
  const { userId = 'guest', productId, action } = req.body;

  const userPrefs = await getData(`user:${userId}:prefs`) || { liked: [], disliked: [], saved: [] };

  if (action === 'like' && !userPrefs.liked.includes(productId)) {
    userPrefs.liked.push(productId);
  } else if (action === 'dislike' && !userPrefs.disliked.includes(productId)) {
    userPrefs.disliked.push(productId);
  } else if (action === 'save' && !userPrefs.saved.includes(productId)) {
    userPrefs.saved.push(productId);
  }

  await setData(`user:${userId}:prefs`, userPrefs);

  res.json({ success: true, preferences: userPrefs });
});

// Get saved items
app.get('/api/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  const userPrefs = await getData(`user:${userId}:prefs`) || { saved: [] };

  const savedProducts = productData.filter(p => userPrefs.saved.includes(p.id));

  res.json({ products: savedProducts });
});

// Create Razorpay order
app.post('/api/payment/create', async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.json({
      orderId: `order_mock_${Date.now()}`,
      amount: amount * 100,
      currency: currency,
      mock: true
    });
  }
});

// Verify Razorpay payment
app.post('/api/payment/verify', async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  // In production, verify the signature
  // For now, mock success
  res.json({ success: true, verified: true });
});

// Chat endpoint with LLM-like responses
app.post('/api/chat', async (req, res) => {
  const { message, userId = 'guest' } = req.body;

  const lowerMsg = message.toLowerCase();

  let response = {
    type: 'text',
    content: ''
  };

  // Check for greetings
  if (lowerMsg.match(/^(hi|hello|hey)/)) {
    response.content = "Hello! I'm your AI shopping assistant. Tell me what you're looking for! For example: 'red khaadi kurta for men under ₹3000' or 'beige sneakers under ₹2000'";
  }
  // Check for wishlist request
  else if (lowerMsg.includes('wishlist') || lowerMsg.includes('saved')) {
    const userPrefs = await getData(`user:${userId}:prefs`) || { saved: [] };
    const savedProducts = productData.filter(p => userPrefs.saved.includes(p.id));

    response.type = 'products';
    response.products = savedProducts;
    response.content = savedProducts.length > 0
      ? `Here are your ${savedProducts.length} saved items:`
      : "Your wishlist is empty. Save items by clicking the heart icon!";
  }
  // Product search
  else {
    const filters = parseQuery(message);
    const userPrefs = await getData(`user:${userId}:prefs`) || { liked: [], disliked: [] };

    let results = productData.filter(product => {
      if (filters.category && !product.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      if (filters.color && !product.color.toLowerCase().includes(filters.color.toLowerCase())) return false;
      if (filters.brand && !product.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
      if (filters.material && !product.material.toLowerCase().includes(filters.material.toLowerCase())) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.gender && !product.gender.toLowerCase().includes(filters.gender.toLowerCase())) return false;
      return true;
    });

    results = results.filter(p => !userPrefs.disliked.includes(p.id)).slice(0, 5);

    response.type = 'products';
    response.products = results;
    response.content = results.length > 0
      ? `I found ${results.length} products matching your search:`
      : "I couldn't find exact matches. Try adjusting your filters or browse our collection!";
  }

  res.json(response);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
