# Rəng Sistemi - Color System Documentation

## Ümumi Məlumat

Bu sənəd React.js frontend və templates arasındakı rəng sisteminin tam uyğunlaşdırılmasını təsvir edir.

**Mənbə:** `static/css/base.css` (templates)

## Əsas Rəng Dəyişənləri

### Default (Dark Mode)
```css
:root {
  --bg-primary: #667eea;   /* Parlaq Bənövşəyi-Mavi */
  --bg-secondary: #764ba2; /* Dərin Bənövşəyi */
  
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: rgba(31, 38, 135, 0.37);
  
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  
  --nav-border: rgba(255, 255, 255, 0.2);
  --skeleton-bg: rgba(255, 255, 255, 0.15);
  
  --accent-primary: #ec4899;   /* Neon Pink */
  --accent-secondary: #d81b60; /* Dark Pink */
}
```

### Dark Mode
Dark mode-da eyni parlaq rənglər qalır (yalnız bg-primary və bg-secondary override olunur):
```css
[data-theme="dark"] {
  --bg-primary: #667eea;
  --bg-secondary: #764ba2;
}
```

### Light Mode
```css
[data-theme="light"] {
  --bg-primary: #5e35b1;
  --bg-secondary: #7e57c2;
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.4);
  --glass-shadow: rgba(94, 53, 177, 0.35);
  --text-secondary: rgba(255, 255, 255, 0.85);
  --nav-border: rgba(255, 255, 255, 0.3);
  --accent-primary: #ec407a;
}
```

## Glassmorphism Stilləri

### `.glass`
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px 0 var(--glass-shadow);
}
```

### `.glass-card`
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px 0 var(--glass-shadow);
}
```

### `.bottom-nav`
```css
.bottom-nav {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid var(--nav-border);
  box-shadow: 0 -4px 20px 0 rgba(0, 0, 0, 0.25);
}
```

## Background Gradient

Templates ilə uyğun sadə gradient:
```css
body {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}
```

## Transition-lər

Rəng keçidləri üçün:
```css
body:not(.no-transition),
body:not(.no-transition) .glass,
body:not(.no-transition) .glass-card,
body:not(.no-transition) .bottom-nav {
  transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
  transition: background 0.8s ease-in-out;
}
```

## Qaydalar

1. **CSS Variables istifadə edin** - Hardcoded rəng dəyərləri yazmayın
2. **Fallback dəyərləri silin** - CSS variables həmişə mövcuddur
3. **Templates ilə uyğunluq** - Bütün rənglər `static/css/base.css` ilə eyni olmalıdır
4. **Glass stilləri** - Həmişə CSS variables istifadə edin (`var(--glass-bg)`, `var(--glass-border)`, `var(--glass-shadow)`)
5. **Background gradient** - Sadə iki rəngli gradient istifadə edin

## Fayl Strukturu

- `frontend/src/styles/common/variables.css` - Əsas rəng dəyişənləri
- `frontend/src/styles/common/base.css` - Base stillər və background
- `frontend/src/styles/components/glass.css` - Glassmorphism stilləri
- `frontend/src/styles/common/themes.css` - Premium theme-lər

## Yoxlama

Rəng uyğunsuzluqlarını yoxlamaq üçün:
1. Templates-dəki `static/css/base.css` faylını oxuyun
2. React.js-dəki `frontend/src/styles/common/variables.css` faylını müqayisə edin
3. Bütün hardcoded rəng dəyərlərini CSS variables ilə əvəz edin

## Premium Themes

Premium theme-lər (`themes.css`-də) yalnız lazımi dəyişənləri override edir, qalanları `:root`-dan miras alır.

