
// Ráfaga dorada del inicio
const svg=document.querySelector('.burst');
for(let i=0;i<36;i++){const a=i*Math.PI/18,r1=40+(i%2)*20,r2=170+(i%3)*18;
 const l=document.createElementNS('http://www.w3.org/2000/svg','line');
 l.setAttribute('x1',Math.cos(a)*r1);l.setAttribute('y1',Math.sin(a)*r1);
 l.setAttribute('x2',Math.cos(a)*r2);l.setAttribute('y2',Math.sin(a)*r2);
 l.setAttribute('pathLength','1');l.style.animationDelay=(i%6)*0.08+'s';svg.appendChild(l);}
// Menú móvil
const btn=document.querySelector('.menu-btn'),menu=document.getElementById('menu');
btn.addEventListener('click',()=>{const o=menu.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
menu.addEventListener('click',e=>{if(e.target.tagName==='A'){menu.classList.remove('open');btn.setAttribute('aria-expanded',false)}});
// Visor de imágenes
const lb=document.getElementById('lb'),lbImg=lb.querySelector('img'),lbCap=lb.querySelector('p');
document.querySelectorAll('.thumb').forEach(t=>t.addEventListener('click',()=>{lbImg.src=t.dataset.full;lbImg.alt=t.dataset.cap;lbCap.textContent=t.dataset.cap;lb.hidden=false;lb.querySelector('.close').focus()}));
const cerrar=()=>{lb.hidden=true};
lb.addEventListener('click',e=>{if(e.target!==lbImg)cerrar()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')cerrar()});
// Formulario: abre el correo del usuario (no guarda datos ni usa servidores)
document.getElementById('form').addEventListener('submit',e=>{
 e.preventDefault();const f=e.target,est=document.getElementById('estado');
 if(!f.checkValidity()){est.textContent='Completa todos los campos con datos válidos.';return}
 const asunto=encodeURIComponent('Consulta institucional - '+f.nombre.value);
 const cuerpo=encodeURIComponent(f.msg.value+'\n\n'+f.nombre.value+' ('+f.email.value+')');
 est.textContent='Se abrirá tu programa de correo para enviar la consulta.';
 location.href='mailto:'+document.querySelector('[data-key="correo"]').textContent.trim()+'?subject='+asunto+'&body='+cuerpo;
});
// Aviso de privacidad y año
document.getElementById('priv-link').addEventListener('click',e=>{e.preventDefault();const p=document.getElementById('privacidad');p.hidden=!p.hidden});
document.getElementById('year').textContent=new Date().getFullYear();

// ===== Textos y productos desde Supabase =====
const hasDB=SB.url&&SB.key,HD={apikey:SB.key,Authorization:'Bearer '+SB.key};
const dbGet=async q=>{const r=await fetch(SB.url+'/rest/v1/'+q,{headers:HD});if(!r.ok)throw 0;return r.json()};
if(hasDB)dbGet('site_texts?select=*').then(rows=>rows.forEach(({key,value})=>{
 if(!value)return;
 document.querySelectorAll('[data-key="'+key+'"]').forEach(el=>{
  if(key==='valores'){el.replaceChildren();value.split(',').forEach(v=>{if(v.trim()){const li=document.createElement('li');li.textContent=v.trim();el.append(li)}})}
  else{el.textContent=value;if(key==='correo')el.href='mailto:'+value}
 })})).catch(()=>{});
const money=n=>n==null?'—':'S/ '+Number(n).toFixed(2);
function productCard(p){
 const a=document.createElement('article');a.className='pcard';
 const main=document.createElement('button');main.className='pmain';main.setAttribute('aria-label','Ampliar imagen');
 const mi=document.createElement('img');mi.alt=p.nombre;mi.src=p.foto1||p.foto2||'assets/images/placeholder.svg';main.append(mi);
 main.onclick=()=>{lbImg.src=mi.src;lbImg.alt=p.nombre;lbCap.textContent=p.nombre;lb.hidden=false};
 a.append(main);
 const fotos=[p.foto1,p.foto2].filter(Boolean);
 if(fotos.length>1){const th=document.createElement('div');th.className='pthumbs';
  fotos.forEach((f,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Ver foto '+(i+1));const im=document.createElement('img');im.alt='';im.src=f;im.loading='lazy';b.append(im);b.onclick=()=>{mi.src=f};th.append(b)});a.append(th)}
 const h=document.createElement('h3');h.textContent=p.nombre;a.append(h);
 const dl=document.createElement('dl');
 [['Caja',p.precio_caja],['Docena',p.precio_docena],['Unidad',p.precio_unidad]].forEach(([k,v])=>{const d=document.createElement('div');const dt=document.createElement('dt');dt.textContent='Precio x '+k.toLowerCase();const dd=document.createElement('dd');dd.textContent=money(v);d.append(dt,dd);dl.append(d)});
 a.append(dl);return a;
}
(async()=>{
 const box=document.getElementById('products');
 try{
  let list=hasDB?await dbGet('products?select=*&order=orden.asc,created_at.asc'):[{nombre:'Producto de ejemplo',precio_caja:0,precio_docena:0,precio_unidad:0,foto1:'assets/images/placeholder.svg',foto2:'assets/images/placeholder.svg'}];
  box.replaceChildren(...(list.length?list.map(productCard):[Object.assign(document.createElement('p'),{textContent:'Pronto publicaremos nuestros productos.',className:'note'})]));
 }catch(e){box.textContent='No se pudieron cargar los productos. Intenta más tarde.'}
})();
