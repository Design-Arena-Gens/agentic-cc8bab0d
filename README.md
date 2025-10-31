# AI Shopping Assistant 🛍️

A complete AI-powered shopping assistant with conversational interface, product recommendations, virtual try-on, and payment integration.

## Features

✅ **Natural Language Shopping**: Ask for products in plain English
- "red khaadi kurta for men under ₹3000"
- "beige sneakers under ₹2000"
- "show my wishlist"

✅ **Smart Product Search**: AI-powered query parsing
- Extracts category, color, brand, material, price range, gender
- Filters products based on user preferences
- Learns from likes/dislikes

✅ **Product Cards**: Rich product information
- Title, brand, color, size, material, price
- Thumbnail image with hover effects
- Ratings and delivery time
- View product links

✅ **User Interactions**:
- ❤️ Save to wishlist
- 👎 Dislike (hide from future results)
- 👗 Virtual try-on
- 🔗 View product page

✅ **Virtual Try-On**: Mock AR try-on experience
- Select body type (slim, average, athletic, plus size)
- Product overlay on avatar
- Product details display
- Direct purchase option

✅ **Payment Integration**: Razorpay test mode
- Create orders
- Mock payment flow
- Order verification

✅ **Redis Storage**: User preferences and wishlist
- Persistent user data
- Like/dislike tracking
- Saved items management

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Backend**: Node.js, Express
- **Database**: Redis
- **Payment**: Razorpay
- **Styling**: Custom CSS with animations

## Project Structure

```
.
├── app/                          # Next.js app directory
│   ├── api/                      # API route handlers
│   │   ├── chat/route.js         # Chat endpoint
│   │   ├── preference/route.js   # User preferences
│   │   └── payment/              # Payment endpoints
│   ├── components/               # React components
│   │   ├── ProductCard.js        # Product display card
│   │   └── TryOnModal.js         # Virtual try-on modal
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home page (chat interface)
├── backend/                      # Express backend
│   ├── server.js                 # Main server file
│   ├── productData.json          # Mock product database
│   └── utils/
│       └── parseQuery.js         # NLP query parser
├── package.json                  # Dependencies
├── next.config.js                # Next.js configuration
├── .env.local                    # Environment variables
└── README.md                     # This file
```

## Installation & Setup

### Prerequisites

- Node.js 18+
- Redis server (optional - falls back to in-memory storage)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
REDIS_URL=redis://localhost:6379
```

### 3. Start Redis (Optional)

If you have Redis installed:

```bash
redis-server
```

If Redis is not available, the app will use in-memory storage.

### 4. Start Backend Server

```bash
npm run server
```

Backend runs on `http://localhost:3001`

### 5. Start Frontend (in another terminal)

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### 6. Open Application

Visit `http://localhost:3000` in your browser.

## Usage Examples

### Example Conversations

**User**: "Looking for red khaadi kurta for men under ₹3000"
**Assistant**: Returns 4-5 matching kurta products with filters applied

**User**: "beige sneakers under ₹2000"
**Assistant**: Shows beige sneakers within budget

**User**: "show my wishlist"
**Assistant**: Displays all saved items

### Testing Virtual Try-On

1. Search for a product
2. Click "👗 Try On" button
3. Select body type
4. See product overlay on avatar
5. Click "Buy Now" for mock payment

### Testing Payment Flow

1. Click "Buy Now" in try-on modal
2. Mock Razorpay order is created
3. Alert shows order details
4. In production, Razorpay checkout would open

## Redis Setup (Detailed)

### Install Redis

**macOS**:
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian**:
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows**:
Download from https://redis.io/download or use WSL

### Verify Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### View Stored Data

```bash
redis-cli
> KEYS *
> GET user:guest:prefs
```

## Razorpay Setup (Detailed)

### 1. Create Razorpay Account

- Visit https://razorpay.com
- Sign up for test account
- Get API keys from dashboard

### 2. Update Environment Variables

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
```

### 3. Test Mode

The app runs in test mode by default. No real payments are processed.

### 4. Production Integration

To enable real payments:
1. Get production API keys
2. Add Razorpay checkout script to `app/layout.js`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

3. Update payment handler in `TryOnModal.js`

## Customization

### Add More Products

Edit `backend/productData.json`:

```json
{
  "id": "prod_016",
  "title": "Your Product",
  "brand": "Brand Name",
  "category": "category",
  "color": "color",
  "size": ["S", "M", "L"],
  "price": 1999,
  "material": "material",
  "gender": "men/women/unisex",
  "image": "image_url",
  "link": "product_url",
  "rating": 4.5,
  "delivery": "2-3 days"
}
```

### Enhance Query Parser

Edit `backend/utils/parseQuery.js` to add:
- More categories
- More colors
- More brands
- More materials
- Complex price ranges

### Integrate Real LLM

Replace query parser with OpenAI GPT:

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseQueryWithGPT(query) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "system",
      content: "Extract product filters from user query as JSON: {category, color, brand, material, maxPrice, gender}"
    }, {
      role: "user",
      content: query
    }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### Connect Real E-commerce API

Replace mock data with real API calls:

```javascript
// backend/server.js
app.post('/api/search', async (req, res) => {
  const filters = parseQuery(req.body.query);

  // Call real e-commerce API
  const response = await fetch('https://api.shop.com/products', {
    method: 'POST',
    body: JSON.stringify(filters)
  });

  const products = await response.json();
  res.json({ products });
});
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy Backend Separately

For production, deploy backend to:
- Railway
- Render
- Heroku
- AWS/GCP

Update `NEXT_PUBLIC_API_URL` to point to deployed backend.

## Future Enhancements

- [ ] Real AI-powered try-on (Wannaby, VTO API)
- [ ] Advanced recommendation engine
- [ ] Social sharing
- [ ] Order history
- [ ] Multi-language support
- [ ] Voice search
- [ ] Image search (upload photo)
- [ ] Size recommendation AI
- [ ] Price drop alerts
- [ ] Live chat with human agents

## Troubleshooting

**Backend not connecting**:
- Check if backend is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

**Redis errors**:
- App will work without Redis (in-memory fallback)
- Check Redis is running: `redis-cli ping`

**Payment not working**:
- Verify Razorpay keys
- Check test mode is enabled
- See console for error messages

**Products not showing**:
- Check browser console for errors
- Verify backend API is responding
- Check `productData.json` is valid

## License

MIT License - feel free to use for your projects!

## Support

For issues or questions, check:
- Console logs (browser & terminal)
- Network tab in browser DevTools
- Redis logs: `redis-cli MONITOR`

---

Built with ❤️ using AI-powered development
