import { useState } from 'react';

export default function ProductCard({ product, onSave, onDislike, onTryOn }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onSave();
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} className="product-image" />
      <div className="product-info">
        <h3>{product.title}</h3>
        <p className="brand">{product.brand}</p>
        <div className="product-details">
          <span className="detail">🎨 {product.color}</span>
          <span className="detail">📏 {product.size.join(', ')}</span>
          <span className="detail">🧵 {product.material}</span>
        </div>
        <div className="product-footer">
          <span className="price">₹{product.price}</span>
          <span className="rating">⭐ {product.rating}</span>
        </div>
        <p className="delivery">🚚 {product.delivery}</p>
        <div className="product-actions">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            🔗 View Product
          </a>
          <button className="btn btn-secondary" onClick={onTryOn}>
            👗 Try On
          </button>
        </div>
        <div className="product-reactions">
          <button
            className={`btn-icon ${saved ? 'active' : ''}`}
            onClick={handleSave}
            disabled={saved}
          >
            ❤️ {saved ? 'Saved' : 'Save'}
          </button>
          <button className="btn-icon" onClick={onDislike}>
            👎 Dislike
          </button>
        </div>
      </div>
    </div>
  );
}
