'use client';

import { useState, useRef, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import TryOnModal from './components/TryOnModal';
import './globals.css';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI shopping assistant. Tell me what you're looking for! For example: 'red khaadi kurta for men under ₹3000' or 'beige sneakers under ₹2000'"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, userId })
      });

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.content,
        products: data.products || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreference = async (productId, action) => {
    try {
      await fetch('/api/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, action })
      });

      if (action === 'save') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'assistant',
          content: 'Item saved to your wishlist! ❤️'
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTryOn = (product) => {
    setTryOnProduct(product);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛍️ AI Shopping Assistant</h1>
        <button
          className="wishlist-btn"
          onClick={() => setInput('show my wishlist')}
        >
          ❤️ Wishlist
        </button>
      </header>

      <div className="chat-container">
        <div className="messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.type}`}>
              {msg.type === 'assistant' && (
                <div className="avatar">🤖</div>
              )}
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.products && msg.products.length > 0 && (
                  <div className="products-grid">
                    {msg.products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSave={() => handlePreference(product.id, 'save')}
                        onDislike={() => handlePreference(product.id, 'dislike')}
                        onTryOn={() => handleTryOn(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
              {msg.type === 'user' && (
                <div className="avatar">👤</div>
              )}
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your request... (e.g., 'red kurta under ₹3000')"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>

      {tryOnProduct && (
        <TryOnModal
          product={tryOnProduct}
          onClose={() => setTryOnProduct(null)}
        />
      )}
    </div>
  );
}
