import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Music, Mic, Lock, Edit, Trash2, Layers } from 'lucide-react';
import { setItemDB, getItemDB } from '../db';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'url'
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', desc: '', price: '', type: 'Image', mediaUrl: '', mediaData: ''
  });

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [dragCat, setDragCat] = useState(false);

  // Settings
  const [settings, setSettings] = useState({ bgMusic: '' });
  const [dragBg, setDragBg] = useState(false);
  const [tempBgMusic, setTempBgMusic] = useState(null);

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    getItemDB('portfolioData').then(saved => {
      if (saved) setItems(saved);
    });

    getItemDB('customCategories').then(saved => {
      if (saved) setCategories(saved);
    });

    getItemDB('siteSettings').then(savedSettings => {
      if (savedSettings) setSettings(savedSettings);
    });

    const isAuth = sessionStorage.getItem('akio_admin_auth');
    if (isAuth === 'true') setIsAuthenticated(true);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setFormData(f => ({ ...f, mediaData: dataUrl, mediaUrl: '' }));
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (e) => processFile(e.target.files[0]);

  // Drag and Drop Handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const finalMedia = inputMode === 'upload' ? formData.mediaData : formData.mediaUrl;
    if (!finalMedia && !editingId) { alert('من فضلك أضف ملف أو رابط الوسائط'); return; }

    const updatedItem = {
      id: editingId || Date.now().toString(),
      title: formData.title,
      desc: formData.desc,
      price: parseFloat(formData.price),
      type: formData.type,
      mediaUrl: finalMedia || items.find(i => i.id === editingId)?.mediaUrl,
    };
    
    let updated;
    if (editingId) {
      updated = items.map(i => i.id === editingId ? updatedItem : i);
    } else {
      updated = [...items, updatedItem];
    }
    
    try {
      await setItemDB('portfolioData', updated);
      setItems(updated);
      setFormData({ title: '', desc: '', price: '', type: formData.type, mediaUrl: '', mediaData: '' });
      setPreview(null);
      setEditingId(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch(err) {
      alert("⚠️ حدث خطأ أثناء الحفظ! تأكد من حجم الملف.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      desc: item.desc,
      price: item.price.toString(),
      type: item.type,
      mediaUrl: item.mediaUrl.startsWith('data:') ? '' : item.mediaUrl,
      mediaData: item.mediaUrl.startsWith('data:') ? item.mediaUrl : ''
    });
    setPreview(item.mediaUrl);
    setInputMode(item.mediaUrl.startsWith('data:') ? 'upload' : 'url');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا العمل؟')) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    await setItemDB('portfolioData', updated);
  };

  const processBgMusicPreview = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTempBgMusic(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const confirmBgMusic = async () => {
    if (!tempBgMusic) return;
    const newSettings = { ...settings, bgMusic: tempBgMusic };
    setSettings(newSettings);
    await setItemDB('siteSettings', newSettings);
    window.dispatchEvent(new Event('bgMusicUpdated'));
    setShowToast(true);
    setTempBgMusic(null);
  };

  const handleSettingChange = (e, key) => {
    if (key === 'bgMusic') processBgMusicPreview(e.target.files[0]);
  };

  const onDragOverBg = (e) => { e.preventDefault(); setDragBg(true); };
  const onDragLeaveBg = (e) => { e.preventDefault(); setDragBg(false); };
  const onDropBg = (e) => { e.preventDefault(); setDragBg(false); if (e.dataTransfer.files?.[0]) processBgMusicPreview(e.dataTransfer.files[0]); };

  const handleAddCategory = async () => {
    if (!catName.trim()) return;
    const newCat = { id: Date.now().toString(), name: catName, image: catImage };
    const updated = [...categories, newCat];
    setCategories(updated);
    await setItemDB('customCategories', updated);
    setCatName('');
    setCatImage('');
    alert('✅ تم إضافة القسم بنجاح!');
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('هل تريد حذف هذا القسم؟')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await setItemDB('customCategories', updated);
  };

  const handleCatImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setCatImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onDragOverCat = (e) => { e.preventDefault(); setDragCat(true); };
  const onDragLeaveCat = (e) => { e.preventDefault(); setDragCat(false); };
  const onDropCat = (e) => {
    e.preventDefault();
    setDragCat(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setCatImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const acceptMap = { Image: 'image/*', Video: 'video/*', Audio: 'audio/*' };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'akio200511') {
      sessionStorage.setItem('akio_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('عذراً، كلمة المرور خاطئة. هذه اللوحة لـ "أكيو المطور" فقط.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(138,43,226,0.2)', backdropFilter: 'blur(10px)' }}>
        <Lock size={48} color="var(--primary-color)" style={{marginBottom: '20px'}} />
        <h2 style={{color: 'var(--primary-color)', marginBottom: '10px'}}>لوحة المطور الخاصة</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: '30px'}}>هذه اللوحة مخصصة للمطور (Akio) فقط.</p>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="أدخل رمز المرور..." 
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{marginBottom: '15px', textAlign: 'center'}}
          />
          <button type="submit" className="btn-admin">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
      <div style={{
        position: 'fixed', bottom: showToast ? '30px' : '-100px', left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
        color: 'white', padding: '15px 30px', borderRadius: '30px',
        boxShadow: '0 10px 30px rgba(157,0,255,0.5)', transition: 'bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fontWeight: 'bold', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        ✨ تم نشر العمل بنجاح!
      </div>
      <h2 className="header-title" style={{ fontSize: '2.4rem', marginBottom: '8px' }}>لوحة تحكم Akio </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>أضف أعمالك، عدّل الأسعار، وارفع موسيقاك الخلفية بحرية.</p>

      {/* Global Settings Section (Music + Voice Note) */}
      <div className="settings-section">
        <h4><Music size={18} color="var(--primary-color)"/> إعدادات الصوت في الموقع</h4>
        <div style={{display:'flex', gap:'15px', flexWrap:'wrap', marginTop:'15px'}}>
          <label 
            className={`filter-btn ${dragBg ? 'active' : ''}`} 
            style={{flex: 1, textAlign:'center', border: dragBg ? '2px dashed var(--primary-color)' : '', transition: 'all 0.3s'}}
            onDragOver={onDragOverBg} onDragLeave={onDragLeaveBg} onDrop={onDropBg}
          >
            <input type="file" accept="audio/*" hidden onChange={(e) => handleSettingChange(e, 'bgMusic')} />
            {dragBg ? '⬇️ أفلت الملف هنا' : (settings.bgMusic ? '✅ تحديث موسيقى الخلفية' : '🎵 رفع موسيقى خلفية للموقع')}
          </label>
        </div>

        {tempBgMusic && (
          <div style={{marginTop: '20px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(157,0,255,0.4)', animation: 'modalPop 0.4s ease forwards'}}>
            <h5 style={{marginBottom: '10px', color: '#fff'}}>معاينة الصوت:</h5>
            <audio src={tempBgMusic} controls style={{width: '100%', marginBottom: '15px'}} />
            <button type="button" onClick={confirmBgMusic} className="btn-admin" style={{padding: '10px', fontSize: '1.05rem'}}>
              ✅ اعتماد الصوت كموسيقى خلفية للموقع
            </button>
          </div>
        )}

        <small style={{color:'var(--text-muted)', display:'block', marginTop:'10px'}}>
          * سيتم الاستماع للموسيقى في الخلفية فور ضغط المستخدم على زر الصوت العائم.
        </small>
      </div>

      <form className="admin-card" onSubmit={handleAdd}>
        <div className="form-group">
          <label>عنوان الخدمة أو التصميم</label>
          <input required type="text" name="title" className="form-input"
            value={formData.title} onChange={handleChange}
            placeholder="مثال: إعلان مسرحي بصوت حماسي..." />
        </div>

        <div className="form-group">
          <label>وصف العمل</label>
          <textarea required name="desc" className="form-input"
            value={formData.desc} onChange={handleChange}
            placeholder="اكتب وصفاً جذاباً يشرح أهمية تصميمك أو دقة صوتك..." rows="3" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>نوع العمل (أو القسم)</label>
            <select name="type" className="form-input" value={formData.type} onChange={(e) => {
              if (e.target.value === 'ADD_NEW') {
                const el = document.getElementById('category-management');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.style.boxShadow = '0 0 30px var(--primary-color)';
                  setTimeout(() => el.style.boxShadow = '', 1500);
                } else {
                  alert("انزل لأسفل الصفحة لإدارة الأقسام وإضافتها!");
                }
                handleChange({ target: { name: 'type', value: 'Image' } }); // reset
              } else {
                handleChange(e);
              }
            }}>
              <option value="Image">🖼️ تصميم (صورة)</option>
              <option value="Audio">🎙️ تعليق صوتي (ملف مقطع)</option>
              <option value="Video">🎬 موشن جرافيك (فيديو)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>🏷️ {c.name}</option>
              ))}
              <option value="ADD_NEW" style={{background: 'var(--primary-color)', color: 'white'}}>➕ أضف قسماً آخر (تصنيف جديد)</option>
            </select>
          </div>
          <div className="form-group">
            <label>السعر بالدينار العراقي (IQD)</label>
            <input required type="number" name="price" className="form-input"
              value={formData.price} onChange={handleChange}
              placeholder="مثال: 75000" min="1" />
          </div>
        </div>

        {/* Media Upload & Drag Drop Zone */}
        <div className="form-group">
          <label>مرفقات العمل (اسحب وأفلت الملف هنا!)</label>
          <div className="input-tabs">
            <button type="button" className={`input-tab ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}>
              <Upload size={14} style={{marginLeft:'5px'}}/> رفع وسحب الملفات
            </button>
            <button type="button" className={`input-tab ${inputMode === 'url' ? 'active' : ''}`}
              onClick={() => setInputMode('url')}>
              <LinkIcon size={14} style={{marginLeft:'5px'}}/> إدراج عبر رابط
            </button>
          </div>

          {inputMode === 'upload' ? (
            <label 
              className={`file-upload-area ${isDragging ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input type="file" accept={acceptMap[formData.type]} onChange={handleFile} />
              {preview ? (
                formData.type === 'Image' ? <img src={preview} className="preview-thumb" alt="preview" /> :
                formData.type === 'Video' ? <video src={preview} className="preview-thumb" controls /> :
                <audio src={preview} controls style={{width:'100%', marginTop:'10px'}} />
              ) : (
                <div>
                  <div style={{fontSize:'3rem', marginBottom:'10px'}}>
                    {isDragging ? '⚡' : '📥'}
                  </div>
                  <div style={{fontSize:'1.1rem', fontWeight:'bold', color: isDragging ? '#fff' : 'inherit'}}>
                    {isDragging ? 'أفلت الملف الآن!' : `اسحب وأفلت ملف الـ ${formData.type === 'Image' ? 'صورة' : formData.type === 'Video' ? 'فيديو' : 'صوت'} هنا`}
                  </div>
                  <div style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'5px'}}>أو اضغط لتصفح ملفات جهازك</div>
                </div>
              )}
            </label>
          ) : (
            <input type="text" name="mediaUrl" className="form-input"
              value={formData.mediaUrl} onChange={handleChange}
              placeholder="https://example.com/video.mp4" />
          )}
        </div>

        <button type="submit" className="btn-admin" style={{ marginTop: '20px' }}>
          {editingId ? '🔄 تحديث العمل الحالي' : '✨ نشر العمل الجديد'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', desc: '', price: '', type: 'Image', mediaUrl: '', mediaData: '' }); setPreview(null); setInputMode('upload'); }} className="btn-admin" style={{ marginTop: '10px', background: 'var(--red)', color: 'white' }}>
            ✖️ إلغاء التعديل
          </button>
        )}
      </form>

      {/* Category Management Block */}
      <div id="category-management" className="admin-form" style={{ marginTop: '30px', transition: 'box-shadow 0.4s' }}>
        <h4 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}><Layers size={18} /> إدارة الأقسام (إنشاء أقسام مثل ألعاب، حسابات..)</h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="اسم القسم الجديد (مثال: بونتي راش)" value={catName} onChange={e => setCatName(e.target.value)} className="form-input" style={{ flex: '1 1 200px' }} />
          <label 
            className="btn-admin" 
            style={{ 
              cursor: 'pointer', 
              background: dragCat ? 'rgba(157,0,255,0.4)' : 'var(--surface-color)', 
              color: '#fff', 
              border: dragCat ? '2px dashed #fff' : '1px solid rgba(255,255,255,0.1)', 
              flex: '1 1 150px', 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}
            onDragOver={onDragOverCat}
            onDragLeave={onDragLeaveCat}
            onDrop={onDropCat}
          >
            <input type="file" accept="image/*" hidden onChange={handleCatImage} />
            {dragCat ? '⬇️ أفلت الصورة هنا' : (catImage ? '✅ تم اختيار الغلاف' : '🖼️ إضافة غلاف (اسحب وأفلت هنا)')}
          </label>
        </div>
        <button onClick={handleAddCategory} className="btn-admin" style={{ marginTop: '15px', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
          ➕ إضافة القسم
        </button>

        {categories.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h5 style={{ marginBottom: '10px' }}>الأقسام المضافة:</h5>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {categories.map(c => (
                <div key={c.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {c.image && <img src={c.image} alt={c.name} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />}
                  <span>{c.name}</span>
                  <button onClick={() => handleDeleteCategory(c.id)} style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', outline: 'none' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      <div style={{ marginTop: '50px' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)',textShadow:'0 0 10px rgba(157,0,255,0.4)' }}>
          معرض أعمال Akio ({items.length})
        </h3>
        {items.length === 0 && (
          <p style={{color:'var(--text-muted)'}}>لا توجد أعمال لعرضها.</p>
        )}
        {items.map(item => (
          <div key={item.id} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'rgba(255,255,255,0.03)', padding:'15px', borderRadius:'12px',
            marginBottom:'12px', border:'1px solid rgba(138,43,226,0.1)', gap:'10px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
              {item.type === 'Image' && <img src={item.mediaUrl} alt={item.title} style={{width:'55px', height:'55px', objectFit:'cover', borderRadius:'8px'}} />}
              {item.type === 'Video' && <div style={{width:'55px', height:'55px', background:'#111', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem'}}>🎬</div>}
              {item.type === 'Audio' && <div style={{width:'55px', height:'55px', background:'linear-gradient(135deg, var(--secondary-color), var(--primary-color))', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem'}}>🎙️</div>}
              <div>
                <strong style={{display:'block', fontSize:'1.1rem'}}>{item.title}</strong>
                <small style={{color:'var(--text-muted)'}}>
                  {item.type} · {(item.price || 0).toLocaleString()} د.ع · ${(item.price * (1/1500) || 0).toFixed(0)}
                </small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleEdit(item)}
                style={{background:'var(--secondary-color)', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', transition: 'all 0.3s'}}>
                تعديل ✏️
              </button>
              <button onClick={() => handleDelete(item.id)}
                style={{background:'rgba(192, 57, 43, 0.8)', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', transition: 'all 0.3s'}}>
                إزالة 🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
