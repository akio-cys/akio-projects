import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Phone } from 'lucide-react';
import { useCurrency } from '../App';
import { getItemDB, setItemDB } from '../db';

const PAYMENT_METHODS = [
  { image: '/media/زين كاش.jpg', icon: '💸', name: 'زين كاش', detail: 'ZainCash' },
  { image: '/media/اسياسيل.jpg', icon: '📱', name: 'أسياسيل', detail: 'AsiaCell Pay' },
  { image: '/media/fib.jpg', icon: '🏦', name: 'FIB', detail: 'First Iraqi Bank' },
  { image: '/media/ماستر كارد.jpg', icon: '💳', name: 'ماستر كارد', detail: 'Mastercard' },
  { icon: '₿', name: 'باينانس', detail: 'Binance P2P' },
  { icon: '🔷', name: 'OKX', detail: 'OKX Exchange' },
  { icon: '💎', name: 'TronKeeper', detail: 'TON / USDT' },
  { icon: '🏦', name: 'راجحي / سوا', detail: 'Al Rajhi / STC Pay' },
];

const DEFAULT_ITEMS = [
  {
    id: '1',
    title: 'تعليق صوتي إعلاني',
    desc: 'تسجيل صوتي احترافي بنبرة حماسية للإعلانات التجارية. التسليم بجودة عالية مع هندسة صوتية.',
    price: 75000,
    type: 'Audio',
    mediaUrl: '/media/Picsart_26-03-31_01-34-34-941.png',
  },
  {
    id: '2',
    title: 'تصميم بوستر إبداعي',
    desc: 'تصميم احترافي بأسلوب فني عصري للسوشيال ميديا والإعلانات.',
    price: 37500,
    type: 'Image',
    mediaUrl: '/media/5332426005542540590_119.jpg',
  },
  {
    id: '4',
    title: 'موشن جرافيك 30 ثانية',
    desc: 'فيديو موشن جرافيك احترافي مع تحريك نصوص وعناصر ديناميكية.',
    price: 180000,
    type: 'Video',
    mediaUrl: '/media/3fad0cf4b704051a325a091fe12886a6_1.mp4',
  },
];

const SECTIONS = [
  { id: 'All', title: 'الرئيسية', subtitle: 'جميع الأعمال' },
  { id: 'Audio', title: 'تعليق صوتي', subtitle: 'تسجيلات صوتية احترافية' },
  { id: 'Image', title: 'تصاميم', subtitle: 'تصاميم جرافيك وإعلانات' },
  { id: 'Video', title: 'موشن جرافيك', subtitle: 'مقاطع فيديو متحركة' },
];

function ItemModal({ item, categories = [], onClose }) {
  const { convert, currency, RATES } = useCurrency();
  const [selectedPayment, setSelectedPayment] = useState(null);

  if (!item) return null;

  const handleCheckout = (platform) => {
    if (!selectedPayment) {
      alert("الرجاء اختيار طريقة دفع أولاً قبل متابعة الشراء!");
      return;
    }
    
    const displayedPrice = convert(item.price);
    const message = `مرحباً Akio، أنا أريد طلب هذه الخدمة: ${item.title}\nسعرها: ${displayedPrice}\nوطريقة الدفع التي اخترتها: ${selectedPayment.name}`;
    const encoded = encodeURIComponent(message);
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/9647750418366?text=${encoded}`, '_blank');
    } else {
      window.open(`https://t.me/a_k_i?text=${encoded}`, '_blank');
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-interactive-bg"></div>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          {(item.type === 'Image' || categories.some(c => c.id === item.type)) && <img src={item.mediaUrl} alt={item.title} className="modal-media" />}
          {item.type === 'Video' && <video src={item.mediaUrl} controls className="modal-media" />}
          {item.type === 'Audio' && (
            <div className="audio-wrapper souls-theme-modal">
              <img src="/media/Picsart_26-03-31_01-34-34-941.png" alt="AKIO" className="souls-audio-logo-modal" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block';}} />
              <div className="audio-icon" style={{display:'none'}}>🎙️</div>
              <div className="audio-controls-container">
                <audio src={item.mediaUrl} controls controlsList="nodownload" />
              </div>
            </div>
          )}
          
          <div style={{ color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
            {categories.find(c => c.id === item.type)?.name || (item.type === 'Image' ? 'تصميم صورة' : item.type === 'Video' ? 'موشن جرافيك' : 'تعليق صوتي')}
          </div>
          <h2 className="modal-title">{item.title}</h2>
          <p className="modal-desc">{item.desc}</p>
          
          <div className="prices-row" style={{ justifyContent: 'center', marginBottom: '25px' }}>
            <span className={`price-tag ${currency === 'IQD' ? 'highlighted' : ''}`}>
              {(item.price || 0).toLocaleString()} د.ع
            </span>
            <span className={`price-tag ${currency === 'USD' ? 'highlighted' : ''}`}>
              ${(item.price * RATES.USD || 0).toFixed(0)}
            </span>
            <span className={`price-tag ${currency === 'SAR' ? 'highlighted' : ''}`}>
              {(item.price * RATES.SAR || 0).toFixed(0)} ر.س
            </span>
          </div>

          <div className="payment-panel" style={{ marginBottom: '25px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>
              👇 اختر طريقة الدفع لإتمام إجراء الشراء
            </p>
            <div className="payment-grid">
              {PAYMENT_METHODS.map((p, i) => (
                <div 
                  key={i} 
                  className={`payment-item select-hover ${selectedPayment?.name === p.name ? 'selected-payment' : ''}`}
                  onClick={() => setSelectedPayment(p)}
                >
                  {p.image ? (
                    <>
                      <img src={p.image} alt={p.name} className="payment-image-icon" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline-block'; }} />
                      <span className="payment-icon" style={{display:'none', fontSize: '24px'}}>{p.icon}</span>
                    </>
                  ) : (
                    <span className="payment-icon" style={{fontSize: '24px'}}>{p.icon}</span>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="btn-group">
            <button onClick={() => handleCheckout('whatsapp')} className="btn btn-whatsapp">
              <Phone size={18} /> طلب عبر واتساب
            </button>
            <button onClick={() => handleCheckout('telegram')} className="btn btn-telegram">
              <Send size={18} /> طلب عبر تليجرام
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ item, categories = [], onClick }) {
  const { currency, RATES } = useCurrency();
  const [transformStyle, setTransformStyle] = useState({});

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none',
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease',
    });
  };

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('audio') || e.target.closest('video')) {
      return;
    }
    if (onClick) onClick();
  };

  return (
    <div 
      className="card-item" 
      style={transformStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {(item.type === 'Image' || categories.some(c => c.id === item.type)) && (
        <img src={item.mediaUrl} alt={item.title} className="card-media" />
      )}
      {item.type === 'Video' && (
        <video src={item.mediaUrl} controls className="card-media" muted />
      )}
      {item.type === 'Audio' && (
        <div className="audio-wrapper souls-theme">
          <img src="/media/Picsart_26-03-31_01-34-34-941.png" alt="AKIO" className="souls-audio-logo" onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block';}} />
          <div className="audio-icon" style={{display:'none'}}>🎙️</div>
          <div className="audio-controls-container">
            <audio src={item.mediaUrl} controls controlsList="nodownload" />
          </div>
        </div>
      )}

      <h2 className="card-title">{item.title}</h2>
      <p className="card-desc">{item.desc}</p>

      <div className="prices-row">
        <span className={`price-tag ${currency === 'IQD' ? 'highlighted' : ''}`}>
          {(item.price || 0).toLocaleString()} د.ع
        </span>
        <span className={`price-tag ${currency === 'USD' ? 'highlighted' : ''}`}>
          ${(item.price * RATES.USD || 0).toFixed(0)}
        </span>
        <span className={`price-tag ${currency === 'SAR' ? 'highlighted' : ''}`}>
          {(item.price * RATES.SAR || 0).toFixed(0)} ر.س
        </span>
      </div>

      <button className="payment-toggle" style={{ marginTop: 'auto', background: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}>
        طلب هذه الخدمة
      </button>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const scrollRefs = useRef({});

  useEffect(() => {
    getItemDB('portfolioData').then(saved => {
      if (saved && saved.length > 0) {
        setItems(saved);
      } else {
        setItems(DEFAULT_ITEMS);
        setItemDB('portfolioData', DEFAULT_ITEMS);
      }
    });

    getItemDB('customCategories').then(saved => {
      if (saved) setCategories(saved);
    });
  }, []);

  const getFilteredItems = (sectionId) => {
    if (sectionId === 'All') return items;
    return items.filter(i => i.type === sectionId);
  };

  return (
    <div className="home-container">
      <header className="header-3d">
        <h1 className="header-title">أهلاً، أنا Akio</h1>
        <p className="header-subtitle">
          مُعلِّق صوتي | مصمم صور | موشن جرافيك
        </p>
      </header>

      {SECTIONS.map(section => {
        const sectionItems = getFilteredItems(section.id);
        return (
          <div key={section.id} className="section-block">
            <div className="section-header">
              <h2 className="section-title">{section.title}</h2>
              <p className="section-subtitle">{section.subtitle}</p>
            </div>
            <div 
              className="horizontal-scroll"
              ref={el => scrollRefs.current[section.id] = el}
            >
              {sectionItems.length > 0 ? (
                sectionItems.map(item => (
                  <Card 
                    key={item.id} 
                    item={item} 
                    categories={categories}
                    onClick={() => setSelectedItem(item)} 
                  />
                ))
              ) : (
                <div className="empty-section">
                  <p>لا توجد عناصر في هذا القسم</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <ItemModal 
        item={selectedItem} 
        categories={categories}
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
