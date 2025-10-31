// LLM-like query parser to extract filters from natural language
function parseQuery(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Extract category
  const categories = ['kurta', 'saree', 'jeans', 'jacket', 't-shirt', 'tshirt', 'shirt', 'dress', 'sneakers', 'shoes', 'blazer', 'trousers', 'pants'];
  for (const cat of categories) {
    if (lowerQuery.includes(cat)) {
      filters.category = cat;
      break;
    }
  }

  // Extract colors
  const colors = ['red', 'blue', 'black', 'white', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray', 'beige', 'maroon', 'navy', 'golden'];
  for (const color of colors) {
    if (lowerQuery.includes(color)) {
      filters.color = color;
      break;
    }
  }

  // Extract brands
  const brands = ['nike', 'adidas', 'puma', 'manyavar', 'fabindia', 'zara', 'h&m', 'levis', "levi's", 'raymond', 'biba', 'sabyasachi'];
  for (const brand of brands) {
    if (lowerQuery.includes(brand)) {
      filters.brand = brand;
      break;
    }
  }

  // Extract materials
  const materials = ['cotton', 'silk', 'khaadi', 'khadi', 'leather', 'denim', 'wool', 'linen', 'polyester', 'canvas', 'synthetic'];
  for (const material of materials) {
    if (lowerQuery.includes(material)) {
      filters.material = material;
      break;
    }
  }

  // Extract gender
  if (lowerQuery.includes('men') || lowerQuery.includes('male') && !lowerQuery.includes('female')) {
    filters.gender = 'men';
  } else if (lowerQuery.includes('women') || lowerQuery.includes('female')) {
    filters.gender = 'women';
  }

  // Extract price using regex
  const pricePatterns = [
    /under ₹?(\d+)/i,
    /below ₹?(\d+)/i,
    /less than ₹?(\d+)/i,
    /max ₹?(\d+)/i,
    /₹?(\d+) or less/i,
    /up to ₹?(\d+)/i
  ];

  for (const pattern of pricePatterns) {
    const match = query.match(pattern);
    if (match) {
      filters.maxPrice = parseInt(match[1]);
      break;
    }
  }

  const minPricePatterns = [
    /above ₹?(\d+)/i,
    /over ₹?(\d+)/i,
    /more than ₹?(\d+)/i,
    /min ₹?(\d+)/i
  ];

  for (const pattern of minPricePatterns) {
    const match = query.match(pattern);
    if (match) {
      filters.minPrice = parseInt(match[1]);
      break;
    }
  }

  // Range pattern
  const rangeMatch = query.match(/₹?(\d+)\s*(?:to|-)\s*₹?(\d+)/i);
  if (rangeMatch) {
    filters.minPrice = parseInt(rangeMatch[1]);
    filters.maxPrice = parseInt(rangeMatch[2]);
  }

  return filters;
}

module.exports = { parseQuery };
