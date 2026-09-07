// construir-html.mjs — convierte carrusel.json en un index.html autocontenido (una <section class="slide">
// por lámina). Lo usan render.mjs y qa.mjs. Sin dependencias.
import fs from 'node:fs';
import path from 'node:path';

export const FORMATOS = { '4:5': [1080, 1350], '3:4': [1080, 1440], '1:1': [1080, 1080], '9:16': [1080, 1920] };
export const LOOKS = ['guia-rapida', 'noticia', 'oscuro-tech', 'recurso', 'bosque', 'editorial-mono'];
export const LAYOUTS = ['portada-titulo', 'portada-foto', 'punto-numero', 'dato-hero', 'lista', 'comparativa',
  'pasos', 'cita', 'texto-pleno', 'prompt', 'cta-cara', 'foto-texto'];

// Fondo efectivo de cada look (para calcular contraste en QA cuando hay foto + scrim)
export const FONDO_EFECTIVO = {
  'guia-rapida': '#EDE7DC', 'noticia': '#0A2560', 'oscuro-tech': '#141316', 'recurso': '#FBF7F0',
  'bosque': '#113D2F', 'editorial-mono': '#F4F3EF',
};

const FUENTES = [
  ['Inter Tight', 'InterTight.ttf'], ['Archivo Black', 'ArchivoBlack.ttf'], ['Archivo', 'Archivo.ttf'],
  ['Oswald', 'Oswald.ttf'], ['Manrope', 'Manrope.ttf'], ['Space Grotesk', 'SpaceGrotesk.ttf'],
  ['Bricolage Grotesque', 'BricolageGrotesque.ttf'], ['JetBrains Mono', 'JetBrainsMono.ttf'], ['Anton', 'Anton.ttf'],
];

export function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Marcado mínimo: *palabra* = acento · **negrita** · salto de línea con \n
export function marcado(s) {
  let t = esc(s);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<span class="acento">$1</span>');
  t = t.replace(/==(.+?)==/g, '<span class="marca">$1</span>');
  return t.replace(/\n/g, '<br>');
}
export function palabras(s) { return String(s ?? '').replace(/[*_]/g, '').trim().split(/\s+/).filter(Boolean).length; }

function claseTitulo(texto, layout) {
  const n = String(texto ?? '').replace(/[*_]/g, '').length;
  if (layout === 'texto-pleno') return n <= 22 ? 't-xl' : n <= 40 ? 't-l' : n <= 60 ? 't-m' : 't-s';
  if (n <= 16) return 't-xl'; if (n <= 30) return 't-l'; if (n <= 46) return 't-m'; if (n <= 68) return 't-s';
  return 't-xs';
}

function rutaImg(src, dirCarrusel, dirSalida) {
  if (!src) return null;
  if (/^https?:\/\//.test(src) || src.startsWith('data:')) return src;
  const abs = path.isAbsolute(src) ? src : path.resolve(dirCarrusel, src);
  return path.relative(dirSalida, abs).split(path.sep).join('/');
}

function fontFaces(dirFuentes, embeber) {
  return FUENTES.map(([familia, archivo]) => {
    const p = path.join(dirFuentes, archivo);
    if (!fs.existsSync(p)) return '';
    const src = embeber
      ? `url(data:font/ttf;base64,${fs.readFileSync(p).toString('base64')})`
      : `url('file://${p.replace(/'/g, "%27")}')`;
    const peso = /Black|Anton/.test(archivo) ? '400' : '100 900';
    return `@font-face{font-family:'${familia}';src:${src} format('truetype');font-weight:${peso};font-display:block;}`;
  }).join('\n');
}

function bloqueImagen(slide, dirCarrusel, dirSalida) {
  const img = slide.imagen;
  if (!img || !img.src) return { html: '', clase: '' };
  const url = rutaImg(img.src, dirCarrusel, dirSalida);
  const pos = img.pos || (slide.layout === 'portada-foto' ? 'fondo' : slide.layout === 'foto-texto' ? 'arriba' : 'abajo');
  if (pos === 'fondo') return { html: `<div class="bg" style="background-image:url('${url}')"></div><div class="scrim"></div>`, clase: 'con-img-fondo' };
  if (pos === 'derecha') return { html: `<div class="img-derecha" style="background-image:url('${url}')"></div>`, clase: 'con-img-derecha' };
  if (pos === 'centro') return { html: `<div class="img-centro" style="background-image:url('${url}')"></div>`, clase: 'con-img-centro' };
  if (pos === 'recorte') return { html: `${img.panel ? '<div class="panel"></div>' : ''}<div class="recorte" style="background-image:url('${url}')"></div>`, clase: `con-recorte${img.panel ? ' con-panel' : ''}${img.tamano === 'grande' ? ' recorte-grande' : ''}` };
  if (pos === 'recorte-izquierda') return { html: `${img.panel ? '<div class="panel" style="right:auto;left:0"></div>' : ''}<div class="recorte izquierda" style="background-image:url('${url}')"></div>`, clase: `con-recorte recorte-izq${img.panel ? ' con-panel' : ''}` };
  if (pos === 'arriba') return { html: `<div class="foto" style="background-image:url('${url}')"></div>`, clase: 'con-foto-arriba' };
  return { html: `<div class="img-abajo ${img.sangra ? 'sangra' : ''}" style="background-image:url('${url}')"></div>`, clase: 'con-img-abajo' };
}

function cuerpoSlide(s, marca, dirCarrusel, dirSalida) {
  const L = s.layout;
  const k = s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : '';
  const t = s.titulo ? `<h1 class="titulo ${claseTitulo(s.titulo, L)}">${marcado(s.titulo)}</h1>` : '';
  const sub = s.subtitulo ? `<p class="sub">${marcado(s.subtitulo)}</p>` : '';
  const cu = s.cuerpo ? `<p class="cuerpo">${marcado(s.cuerpo)}</p>` : '';
  const loop = s.loop ? `<p class="loop">${marcado(s.loop)}</p>` : '';
  const chips = s.chips?.length ? `<div class="chips">${s.chips.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div>` : '';
  switch (L) {
    case 'portada-titulo': case 'portada-foto': case 'texto-pleno': case 'foto-texto':
      return k + t + sub + chips + cu + loop;
    case 'punto-numero':
      return `${s.numero ? `<div class="numero">${esc(s.numero)}</div>` : ''}${t}${sub}${cu}${loop}`;
    case 'dato-hero':
      return `${k}<div class="dato">${marcado(s.dato ?? s.numero ?? '')}</div>${t}${sub}${cu}${loop}`;
    case 'lista': {
      const items = (s.items || []).map((it, i) => {
        const o = typeof it === 'string' ? { texto: it } : it;
        return `<div class="item"><div class="idx">${esc(o.idx ?? String(i + 1).padStart(2, '0'))}</div><div class="txt">${marcado(o.texto)}${o.nota ? `<small>${marcado(o.nota)}</small>` : ''}</div></div>`;
      }).join('');
      return `${k}${t}${sub}<div class="items">${items}</div>${loop}`;
    }
    case 'comparativa': {
      const col = (c, cls) => `<div class="col ${cls}"><h3>${esc(c?.titulo ?? '')}</h3><ul>${(c?.items || []).map(x => `<li>${marcado(x)}</li>`).join('')}</ul></div>`;
      return `${k}${t}${sub}<div class="cols">${col(s.a, 'a')}${col(s.b, 'b')}</div>${loop}`;
    }
    case 'pasos': {
      const pasos = (s.pasos || []).map((p, i) => `<div class="paso"><div class="n">${esc(p.n ?? i + 1)}</div><div><div class="t">${marcado(p.titulo)}</div>${p.detalle ? `<div class="d">${marcado(p.detalle)}</div>` : ''}</div></div>`).join('');
      return `${k}${t}${sub}<div class="pasos">${pasos}</div>${loop}`;
    }
    case 'cita':
      return `${k}<p class="cita">${marcado(s.cita ?? s.titulo ?? '')}</p>${s.autor ? `<p class="autor">${esc(s.autor)}</p>` : ''}${cu}${loop}`;
    case 'prompt':
      return `${k}${t}${sub}<div class="prompt">${s.etiqueta ? `<span class="p-tag">${esc(s.etiqueta)}</span>` : ''}${esc(s.prompt ?? '')}</div>${loop}`;
    case 'cta-cara': {
      const av = marca.avatar && !s.imagen ? `<div class="avatar" style="background-image:url('${rutaImg(marca.avatar, dirCarrusel, dirSalida)}')"></div>` : '';
      const boton = s.boton ? `<div class="cta-boton">${esc(s.boton)}</div>` : '';
      const sello = `<p class="sello"><span class="handle">${esc(marca.handle ?? '')}</span>${marca.sello ? ` · ${esc(marca.sello)}` : ''}</p>`;
      return `${av}${t}${sub}${cu}${boton}${sello}`;
    }
    default:
      return k + t + sub + cu + loop;
  }
}

export function construirHTML({ data, dirCarrusel, dirSalida, dirSkill, embeberFuentes = false }) {
  const look = LOOKS.includes(data.look) ? data.look : 'guia-rapida';
  const [w, h] = FORMATOS[data.formato] || FORMATOS['3:4'];
  const marca = data.marca || {};
  const baseCss = fs.readFileSync(path.join(dirSkill, 'templates', 'base.css'), 'utf8');
  const lookCss = fs.readFileSync(path.join(dirSkill, 'templates', 'looks', `${look}.css`), 'utf8');
  const fuentes = fontFaces(path.join(dirSkill, 'assets', 'fonts'), embeberFuentes);
  const total = data.slides.length;
  const fondo = FONDO_EFECTIVO[look];

  const slides = data.slides.map((s, i) => {
    const n = i + 1;
    const img = bloqueImagen(s, dirCarrusel, dirSalida);
    const clases = ['slide', `l-${s.layout}`, `r-${s.rol || 'cuerpo'}`, img.clase, s.numero_fantasma ? 'con-numero' : '', s.clase || '', s.centrado ? 'centrado' : '', s.imagen?.duotono ? 'duotono' : '', s.grano ? 'grano' : ''].filter(Boolean).join(' ');
    const fantasma = s.numero_fantasma ? `<div class="numero-fantasma">${esc(s.numero_fantasma)}</div>` : '';
    const ladoSticker = s.sticker_lado || (s.imagen && s.imagen.pos === 'recorte' ? 'izquierda' : 'derecha');
    const sticker = s.sticker ? `<div class="sticker ${ladoSticker === 'izquierda' ? 'izquierda' : ''}">${esc(s.sticker)}</div>` : '';
    const esPortada = s.rol === 'portada' || n === 1;
    const top = s.sin_top ? '' : `<div class="top"><span class="etiqueta">${esc(s.etiqueta_top ?? data.serie ?? '')}</span><span class="pager">${String(n).padStart(2, '0')}/${String(total).padStart(2, '0')}</span></div>`;
    const derecha = esPortada ? `<span class="desliza">${esc(s.pie ?? 'Desliza')}</span>` : (s.pie ? `<span>${esc(s.pie)}</span>` : `<span class="pager">${n} de ${total}</span>`);
    const sinBottom = s.sin_bottom === true || (s.layout === 'cta-cara' && s.sin_bottom !== false); // el CTA ya lleva el @ en el sello
    const bottom = sinBottom ? '' : `<div class="bottom"><span class="handle">${esc(marca.handle ?? '')}</span>${derecha}</div>`;
    // Las láminas densas van centradas como las demás; si desbordan, el ajuste automático reduce la letra y QA avisa.
    const alinea = s.alinea === 'arriba' ? 'arriba' : s.alinea === 'abajo' ? 'abajo' : '';
    return `<section class="${clases}" data-n="${n}" data-bg="${fondo}" data-layout="${s.layout}" data-rol="${s.rol || 'cuerpo'}">
${img.html}${fantasma}${sticker}${top}
<div class="contenido ${alinea}">
${cuerpoSlide(s, marca, dirCarrusel, dirSalida)}
</div>
${bottom}
</section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>${esc(data.slug || 'carrusel')}</title>
<style>
${fuentes}
${baseCss}
:root { --w: ${w}px; --h: ${h}px; }
${lookCss}
/* descarga en navegador (sin Playwright) */
#descargar { position: fixed; right: 20px; bottom: 20px; z-index: 99; font: 700 16px system-ui; padding: 12px 18px; border-radius: 999px; background: #fff; color: #000; border: 0; cursor: pointer; }
@media print { #descargar { display: none; } }
</style></head>
<body data-look="${look}" data-w="${w}" data-h="${h}">
${slides}
<button id="descargar" onclick="descargarPNG()">Descargar PNG</button>
<script>
// Ajuste fino: si una palabra no cabe a lo ancho o el contenido no cabe a lo alto, reduce la letra
// hasta un 15%. Deja data-ajuste con el % aplicado para que QA lo reporte (más de 8% = reescribir).
(function(){
  function fit(){
    document.querySelectorAll('.slide').forEach(function(slide){
      var cont = slide.querySelector('.contenido'); if(!cont) return;
      var pctAncho = 0;
      slide.querySelectorAll('.titulo,.sub,.dato,.cita,.loop').forEach(function(el){
        var fs = parseFloat(getComputedStyle(el).fontSize), base = fs;
        while (el.scrollWidth > el.clientWidth + 1 && fs > base * 0.7) { fs -= 4; el.style.fontSize = fs + 'px'; }
        pctAncho = Math.max(pctAncho, Math.round(100 * (base - fs) / base));
      });
      var pct = 0;
      while (cont.scrollHeight > cont.clientHeight + 6 && pct < 15) {
        pct += 1;
        cont.querySelectorAll('.titulo,.sub,.cuerpo,.loop,.item .txt,.item small,.col li,.col h3,.paso .t,.paso .d,.prompt,.cita,.dato').forEach(function(el){
          if (!el.dataset.fs0) el.dataset.fs0 = parseFloat(getComputedStyle(el).fontSize);
          el.style.fontSize = (el.dataset.fs0 * (1 - pct/100)) + 'px';
        });
      }
      slide.dataset.ajuste = String(Math.max(pct, pctAncho));
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
  window.__fit = fit;
})();
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>
async function descargarPNG(){ const s=document.querySelectorAll('.slide'); for(let i=0;i<s.length;i++){ const c=await html2canvas(s[i],{scale:2,useCORS:true,backgroundColor:null}); const a=document.createElement('a'); a.download=String(i+1).padStart(2,'0')+'.png'; a.href=c.toDataURL('image/png'); a.click(); await new Promise(r=>setTimeout(r,400)); } }
</script>
</body></html>`;
}
