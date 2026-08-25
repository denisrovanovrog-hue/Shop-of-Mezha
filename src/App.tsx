import { FormEvent, useState } from 'react';
import { ArrowDown, ArrowRight, Check, Menu, Music2, Send, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const products = [
  { name: 'СВОБОДНЫЙ ХОД', type: 'oversize · 235 г/м²', price: '69 BYN', tone: 'black', mark: '01', image: '/images/1._СВОБОДНЫИ_ХОД.png' },
  { name: 'СИЛУЭТ', type: 'oversize · 235 г/м²', price: '69 BYN', tone: 'bone', mark: '02', image: '/images/5._СИЛУЭТ.png' },
];

type Product = (typeof products)[number];

type FormState = {
  fullName: string;
  phone: string;
  telegram: string;
  size: string;
  pickupPoint: string;
  shippingMethod: string;
};

const initialForm: FormState = {
  fullName: '',
  phone: '',
  telegram: '',
  size: 'M',
  pickupPoint: '',
  shippingMethod: 'Европочта',
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);

  const openOrder = (product: Product) => {
    setSelectedProduct(product);
    setSubmitted(false);
    setError('');
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setError('');

    const order = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      telegram: form.telegram.trim(),
      size: form.size,
      pickupPoint: form.pickupPoint.trim(),
      shippingMethod: form.shippingMethod,
      product: selectedProduct.name,
    };

    if (supabase) {
      const { error: insertError } = await supabase.from('mezha_orders').insert({
        full_name: order.fullName,
        phone: order.phone,
        telegram: order.telegram,
        size: order.size,
        pickup_point: order.pickupPoint,
        shipping_method: order.shippingMethod,
        product: order.product,
      });

      if (insertError) {
        setError('Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.');
        setIsSending(false);
        return;
      }
    }

    const emailjsConfig = {
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    };

    if (!emailjsConfig.serviceId || !emailjsConfig.templateId || !emailjsConfig.publicKey) {
      setError('Заявка сохранена, но EmailJS ещё не подключён. Добавьте настройки сервиса, чтобы получать письма.');
      setIsSending(false);
      return;
    }

    let emailResponse: Response;

    try {
      emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailjsConfig.serviceId,
          template_id: emailjsConfig.templateId,
          user_id: emailjsConfig.publicKey,
          template_params: {
            to_email: 'mezha.mail@gmail.com',
            product: order.product,
            size: order.size,
            full_name: order.fullName,
            phone: order.phone,
            telegram: order.telegram,
            pickup_point: order.pickupPoint,
            delivery_method: order.shippingMethod,
          },
        }),
      });
    } catch {
      setError('Заявка сохранена, но письмо не отправилось. Проверьте подключение к EmailJS.');
      setIsSending(false);
      return;
    }

    if (!emailResponse.ok) {
      setError('Заявка сохранена, но письмо не отправилось. Проверьте настройки EmailJS и повторите отправку.');
      setIsSending(false);
      return;
    }

    setSubmitted(true);
    setForm(initialForm);
    setIsSending(false);
  };

  return (
    <main>
      <nav className="nav container">
        <a className="wordmark" href="#top" aria-label="МЕЖА — в начало">МЕЖА</a>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#about" onClick={() => setMenuOpen(false)}>О бренде</a>
          <a href="#catalog" onClick={() => setMenuOpen(false)}>Каталог</a>
          <a href="#order" onClick={() => setMenuOpen(false)}>Доставка</a>
        </div>
        <a className="nav-order" href="#order">Заказать <ArrowRight size={16} /></a>
        <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Открыть меню">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <section className="hero container" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="dot" /> белорусский streetwear · 2026</p>
          <h1>Одежда<br /><em>твоего</em><br />края.</h1>
          <p className="hero-text">МЕЖА — локальный бренд из Беларуси, созданный на стыке брутального минимализма и глубоких смыслов. Форма для тех, кто не боится очерчивать свои границы.</p>
          <a className="button button-dark" href="#catalog">Смотреть вещи <ArrowDown size={17} /></a>
        </div>
        <div className="hero-art">
          <div className="hero-art-top"><span>МЕЖА / 01</span><span>Беларусь</span></div>
          <img src="/images/98730a84-2a45-4bb2-a96f-a6d410d953f3.png" alt="Логотип бренда МЕЖА" />
          <div className="hero-art-bottom"><span>KEEP YOUR LINE</span><span>53°31′45″ N / 28°02′42″ E</span></div>
          <div className="art-cross cross-one" /><div className="art-cross cross-two" />
        </div>
      </section>

      <div className="ticker" aria-label="МЕЖА — держи свою линию">
        <div className="ticker-track">МЕЖА <span>•</span> ОДЕЖДА ТВОЕГО КРАЯ <span>•</span> БЕЛАРУСЬ <span>•</span> МЕЖА <span>•</span> ОДЕЖДА ТВОЕГО КРАЯ <span>•</span> БЕЛАРУСЬ <span>•</span></div>
      </div>

      <section className="about container" id="about">
        <div className="section-label"><span>01</span><span>О бренде</span></div>
        <div className="about-grid">
          <h2>Одежда —<br /><span>это позиция.</span></h2>
          <div className="about-copy"><p>Мы создаём вещи с внутренним стержнем. МЕЖА говорит о границах, которые мы проводим сами — и о смелости их двигать.</p><p>Каждая коллекция собрана в Беларуси небольшими тиражами. Мы не гонимся за скоростью. Мы за то, чтобы вещь осталась с тобой надолго.</p><div className="signature">м / ж / б</div></div>
        </div>
      </section>

      <section className="catalog container" id="catalog">
        <div className="section-heading"><div className="section-label"><span>02</span><span>Каталог / 02</span></div><h2>Вещи<br /><em>с характером.</em></h2><p>Базовая форма. Нестандартная мысль.</p></div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className={`product-image ${product.tone} ${product.image ? 'is-zoomable' : ''}`} onClick={() => product.image && setExpandedProduct(product)} onKeyDown={(event) => { if (product.image && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setExpandedProduct(product); } }} role={product.image ? 'button' : undefined} tabIndex={product.image ? 0 : undefined} aria-label={product.image ? `Рассмотреть майку ${product.name}` : undefined}>
                {product.image ? <img className="product-photo" src={product.image} alt={`Майка ${product.name}`} /> : <div className="shirt"><div className="collar" /><span>МЕЖА</span></div>}
                <span className="product-number">{product.mark} / 02</span>
                <span className="product-stamp">МЕЖА<br />MADE IN BY</span>
                {product.image && <span className="zoom-hint">нажми, чтобы рассмотреть</span>}
              </div>
              <div className="product-info"><div><h3>{product.name}</h3><p>{product.type}</p></div><strong>{product.price}</strong></div>
              <button className="product-order" onClick={() => openOrder(product)}>Заказать <ArrowRight size={16} /></button>
            </article>
          ))}
        </div>
        <p className="catalog-note">* Без учёта доставки (оплата при получении в отделении почты).</p>
      </section>

      <section className="size-guide container" id="sizes">
        <div className="size-guide-heading"><div className="section-label"><span>03</span><span>Размеры</span></div><h2>Найди<br /><em>свой размер.</em></h2><p>Сними мерки по любимой майке и сравни с таблицей. Для оверсайз-посадки выбирай размер по ширине изделия под проймой.</p></div>
        <div className="size-guide-card"><img src="/images/a2d0c37d-7dae-405e-8d5c-9366ffee6d08.png" alt="Таблица размеров маек МЕЖА" /><div className="size-guide-note"><span>ПОДСКАЗКА</span><strong>Измеряй вещь<br />на ровной поверхности.</strong><p>Ширина — от одной проймы до другой. Длина — от верхней точки плеча до низа по спинке.</p></div></div>
      </section>

      <section className="manifesto container"><div className="manifesto-line" /><p>НЕ ИЩИ<br /><span>СВОЁ МЕСТО.</span><br />СОЗДАЙ ЕГО.</p><span className="manifesto-mark">М / 2026</span></section>

      <section className="order-section container" id="order">
        <div className="order-intro"><div className="section-label"><span>04</span><span>Заказ</span></div><h2>Вещь<br /><em>тебе.</em></h2><p>Заполни форму — мы свяжемся с тобой в Telegram, чтобы подтвердить детали и отправить заказ.</p><div className="delivery-note"><span>ДОСТАВКА</span><strong>Европочта · наложенный платёж</strong><strong>Белпочта · наложенный платёж</strong></div></div>
        <div className="order-form-wrap">
          {submitted ? (
            <div className="success-message"><div className="success-icon"><Check size={28} /></div><h3>Заявка принята.</h3><p>Спасибо. Мы уже получили твой выбор и напишем в Telegram для подтверждения.</p><button className="button button-dark" onClick={() => setSubmitted(false)}>Оформить ещё одну <ArrowRight size={17} /></button></div>
          ) : (
            <form className="order-form" onSubmit={submitOrder}>
              <div className="form-product"><div><span>ТВОЙ ВЫБОР</span><strong>{selectedProduct.name}</strong></div><button type="button" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>Изменить <ArrowRight size={14} /></button></div>
              <label>ФИО<input required value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Как к тебе обращаться?" /></label>
              <div className="form-row"><label>ТЕЛЕФОН<input required type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+375 (__) ___-__-__" /></label><label>TELEGRAM<input required value={form.telegram} onChange={(event) => updateField('telegram', event.target.value)} placeholder="@username" /></label></div>
              <fieldset><legend>РАЗМЕР</legend><div className="size-options">{['S', 'M', 'L'].map((size) => <label className={form.size === size ? 'active' : ''} key={size}><input type="radio" name="size" value={size} checked={form.size === size} onChange={(event) => updateField('size', event.target.value)} />{size}</label>)}</div></fieldset>
              <label>ОТДЕЛЕНИЕ ПОЧТЫ<input required value={form.pickupPoint} onChange={(event) => updateField('pickupPoint', event.target.value)} placeholder="Город, номер или адрес отделения" /></label>
              <fieldset><legend>СПОСОБ ДОСТАВКИ</legend><div className="shipping-options">{['Европочта', 'Белпочта'].map((shippingMethod) => <label className={form.shippingMethod === shippingMethod ? 'active' : ''} key={shippingMethod}><input type="radio" name="shippingMethod" value={shippingMethod} checked={form.shippingMethod === shippingMethod} onChange={(event) => updateField('shippingMethod', event.target.value)} />{shippingMethod}</label>)}</div></fieldset>
              {error && <p className="form-error">{error}</p>}
              <button className="submit-button" type="submit" disabled={isSending}>{isSending ? 'Отправляем…' : <>Оформить заказ <Send size={17} /></>}</button><p className="form-footnote">Нажимая кнопку, ты соглашаешься на обработку данных для оформления заказа.</p>
            </form>
          )}
        </div>
      </section>

      {expandedProduct && expandedProduct.image && (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label={`Просмотр майки ${expandedProduct.name}`} onClick={() => setExpandedProduct(null)}>
          <button className="image-modal-close" onClick={() => setExpandedProduct(null)} aria-label="Закрыть просмотр"><X size={24} /></button>
          <div className="image-modal-content" onClick={(event) => event.stopPropagation()}>
            <img src={expandedProduct.image} alt={`Майка ${expandedProduct.name} — увеличенный просмотр`} />
            <div><span>{expandedProduct.mark} / 02</span><strong>{expandedProduct.name}</strong></div>
          </div>
        </div>
      )}

      <footer className="footer container"><a className="wordmark" href="#top">МЕЖА</a><p>ОДЕЖДА ТВОЕГО КРАЯ.</p><div className="footer-links"><a href="https://t.me/moi_angel" aria-label="Telegram"><Send size={17} /></a><a href="https://www.tiktok.com/@shop.mezha" aria-label="TikTok"><Music2 size={17} /></a></div><span>© 2026 МЕЖА</span></footer>
    </main>
  );
}

export default App;
