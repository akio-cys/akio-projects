import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { Briefcase, Settings, Instagram, Send, Music2, VolumeX, ArrowRight } from 'lucide-react';
import { getItemDB } from './db';

export const CurrencyContext = createContext();

const RATES = { IQD: 1, USD: 1 / 1500, SAR: 1 / 300 };
const SYMBOLS = { IQD: 'د.ع', USD: '$', SAR: 'ر.س' };

export function useCurrency() { return useContext(CurrencyContext); }

function App() {
  const [currency, setCurrency] = useState(() => localStorage.getItem('preferredCurrency') || 'IQD');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgMusic, setBgMusic] = useState(null);
  
  const audioRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load background music from indexedDB
    const loadSettings = () => {
      getItemDB('siteSettings').then(savedSettings => {
        if (savedSettings && savedSettings.bgMusic) {
          setBgMusic(savedSettings.bgMusic);
        }
      });
    };
    loadSettings();
    window.addEventListener('bgMusicUpdated', loadSettings);
    return () => window.removeEventListener('bgMusicUpdated', loadSettings);
  }, [location.pathname]); // Re-check if admin changes it

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, bgMusic]);

  // Autoplay on first interaction to bypass browser restrictions
  const hasInteracted = useRef(false);
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted.current && bgMusic && audioRef.current) {
        hasInteracted.current = true;
        setIsPlaying(true);
      }
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };

    if (!hasInteracted.current) {
      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      document.addEventListener('scroll', handleInteraction);
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
  }, [bgMusic]);

  // Synchronize background volume with other playing media
  useEffect(() => {
    const handleOtherMediaPlay = (e) => {
      if (audioRef.current && e.target !== audioRef.current) {
        audioRef.current.volume = 0; // Mute background when other media plays
      }
    };

    const handleOtherMediaEndedOrPaused = (e) => {
      if (audioRef.current && e.target !== audioRef.current) {
        audioRef.current.volume = 1; // Unmute
      }
    };

    document.addEventListener('play', handleOtherMediaPlay, true);
    document.addEventListener('pause', handleOtherMediaEndedOrPaused, true);
    document.addEventListener('ended', handleOtherMediaEndedOrPaused, true);

    return () => {
      document.removeEventListener('play', handleOtherMediaPlay, true);
      document.removeEventListener('pause', handleOtherMediaEndedOrPaused, true);
      document.removeEventListener('ended', handleOtherMediaEndedOrPaused, true);
    };
  }, []);

  const toggleMusic = () => {
    if (!bgMusic) {
      alert("لم يتم إضافة موسيقى خلفية من لوحة الإدارة بعد!");
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleCurrency = (c) => {
    setCurrency(c);
    localStorage.setItem('preferredCurrency', c);
  };

  const convert = (iqdPrice) => {
    const num = parseFloat(iqdPrice);
    if (isNaN(num)) return iqdPrice;
    
    // IQD doesn't need fractions, others might look better with 2 max if needed, 
    // but the user's previous maxFractionDigits: 0 was set. I will use 0.
    const converted = (num * RATES[currency]).toLocaleString('en-US', { maximumFractionDigits: (currency === 'IQD' ? 0 : 2) });
    return `${converted} ${SYMBOLS[currency]}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, convert, RATES, SYMBOLS }}>
      {/* Cinematic Intro Loading Splash */}
      <div className="intro-splash">
        <div className="intro-logo-container">
          <img src="/media/Picsart_26-03-31_01-34-34-941.png" alt="AKIO" className="intro-image" />
        </div>
      </div>

      {/* Legendary 3D Animated Background */}
      <div className="bg-animation">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {bgMusic && <audio ref={audioRef} src={bgMusic} loop />}

      {/* Floating Controls (Music + Back) */}
      <div className="floating-controls">
        {location.pathname !== '/' && (
          <button className="float-btn" onClick={() => navigate(-1)} title="رجوع">
            <ArrowRight size={24} />
          </button>
        )}
        <button className={`float-btn ${isPlaying ? 'playing' : ''}`} onClick={toggleMusic} title="الموسيقى">
          {isPlaying ? <Music2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      <div className="container">
        <nav className="navbar">
          <div className="logo" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}} onClick={() => navigate('/')} onDoubleClick={() => navigate('/admin')}>
            <img src="/media/Picsart_26-03-31_01-34-34-941.png" alt="AKI" style={{height: '45px', mixBlendMode: 'screen'}} onError={(e) => {e.target.style.display = 'none';}} />
            <span>Akio Projects</span>
          </div>
          
          <div className="nav-right">
            <div className="social-links">
              <a href="https://instagram.com/akio_voice" target="_blank" rel="noreferrer" className="social-btn insta">
                <Instagram size={14} /> akio_voice
              </a>
              <a href="https://t.me/a_k_i" target="_blank" rel="noreferrer" className="social-btn tele">
                <Send size={14} /> a_k_i
              </a>
            </div>

            <div className="currency-selector">
              {['IQD', 'USD', 'SAR'].map(c => (
                <button
                  key={c}
                  className={`currency-btn ${currency === c ? 'active' : ''}`}
                  onClick={() => handleCurrency(c)}
                >
                  {c === 'USD' ? '$' : c === 'IQD' ? 'د.ع' : 'ر.س'}
                </button>
              ))}
            </div>

            <div className="nav-links">
              <Link to="/"><Briefcase size={18}/>الرئيسية</Link>
              <Link to="/admin"><Settings size={18}/>الإدارة</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </CurrencyContext.Provider>
  );
}

export default App;
