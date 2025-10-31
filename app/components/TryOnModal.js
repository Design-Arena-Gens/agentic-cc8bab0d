import { useState } from 'react';

export default function TryOnModal({ product, onClose }) {
  const [selectedBodyType, setSelectedBodyType] = useState('average');

  const bodyTypes = [
    { id: 'slim', label: 'Slim', emoji: '🧍' },
    { id: 'average', label: 'Average', emoji: '🧍‍♂️' },
    { id: 'athletic', label: 'Athletic', emoji: '💪' },
    { id: 'plus', label: 'Plus Size', emoji: '🧍‍♀️' }
  ];

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: product.price })
      });

      const data = await response.json();

      if (data.mock) {
        alert(`Mock Payment Initiated!\nOrder ID: ${data.orderId}\nAmount: ₹${product.price}\n\nIn production, Razorpay checkout would open here.`);
      } else {
        // Real Razorpay integration would go here
        const options = {
          key: 'rzp_test_dummy',
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: 'AI Shopping Assistant',
          description: product.title,
          handler: function(response) {
            alert('Payment successful!');
            onClose();
          }
        };

        // const razorpay = new Razorpay(options);
        // razorpay.open();
        alert(`Payment flow would open with Razorpay.\nOrder ID: ${data.orderId}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>Virtual Try-On</h2>
        <p className="modal-subtitle">{product.title}</p>

        <div className="tryon-container">
          <div className="body-selector">
            <h3>Select Body Type:</h3>
            <div className="body-types">
              {bodyTypes.map(type => (
                <button
                  key={type.id}
                  className={`body-type-btn ${selectedBodyType === type.id ? 'active' : ''}`}
                  onClick={() => setSelectedBodyType(type.id)}
                >
                  <span className="body-emoji">{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="tryon-preview">
            <div className="avatar-container">
              <div className="avatar-body">
                <span style={{ fontSize: '150px' }}>
                  {bodyTypes.find(t => t.id === selectedBodyType)?.emoji}
                </span>
              </div>
              <div className="product-overlay">
                <img src={product.image} alt={product.title} />
              </div>
            </div>
          </div>

          <div className="tryon-info">
            <div className="info-row">
              <strong>Color:</strong> {product.color}
            </div>
            <div className="info-row">
              <strong>Material:</strong> {product.material}
            </div>
            <div className="info-row">
              <strong>Available Sizes:</strong> {product.size.join(', ')}
            </div>
            <div className="info-row">
              <strong>Price:</strong> ₹{product.price}
            </div>
          </div>
        </div>

        <div className="modal-note">
          <p>📝 <strong>Note:</strong> This is a mock virtual try-on. Real AI-powered try-on can be integrated using services like Wannaby, VTO, or custom ML models.</p>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePayment}>
            💳 Buy Now - ₹{product.price}
          </button>
        </div>
      </div>
    </div>
  );
}
