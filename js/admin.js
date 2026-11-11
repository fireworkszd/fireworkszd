const $=s=>document.querySelector(s),A=SB.url,K=SB.key;
let tok=sessionStorage.getItem('tok'),editId=null,items=[];
const say=t=>$('#msg').textContent=t;
async function api(p,o={}){
 const r=await fetch(A+p,{...o,headers:{apikey:K,Authorization:'Bearer '+(tok||K),'Content-Type':'application/json',...(o.headers||{})}});
 if(r.status===401){salir('Tu sesión venció. Vuelve a entrar.');throw 0}
 if(!r.ok)throw new Error(await r.text());
 const t=await r.text();return t?JSON.parse(t):null}
function salir(m){tok=null;sessionStorage.removeItem('tok');$('#panel').hidden=true;$('#login').hidden=false;say(m||'')}
$('#salir').onclick=()=>salir('Sesión cerrada.');
$('#fl').onsubmit=async e=>{e.preventDefault();
 try{const r=await fetch(A+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:$('#em').value,password:$('#pw').value})});
 const d=await r.json();if(!r.ok)throw 0;tok=d.access_token;sessionStorage.setItem('tok',tok);$('#pw').value='';say('');inicio()}catch{say('Correo o contraseña incorrectos.')}};
const num=v=>v===''?null:+v;
async function subir(file){
 const b=await createImageBitmap(file),s=Math.min(1,1200/Math.max(b.width,b.height)),c=document.createElement('canvas');
 c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.82)),n=Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.jpg';
 await api('/storage/v1/object/productos/'+n,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});
 return A+'/storage/v1/object/public/productos/'+n}
function limpiar(){editId=null;$('#fp').reset();$('#vis').checked=true;$('#gp').textContent='Guardar producto'}
$('#nuevo').onclick=limpiar;
$('#fp').onsubmit=async e=>{e.preventDefault();say('Guardando…');
 try{const d={nombre:$('#nombre').value,precio_caja:num($('#pc').value),precio_docena:num($('#pd').value),precio_unidad:num($('#pu').value),orden:+$('#ord').value||0,visible:$('#vis').checked};
 if($('#f1').files[0])d.foto1=await subir($('#f1').files[0]);
 if($('#f2').files[0])d.foto2=await subir($('#f2').files[0]);
 if(editId)await api('/rest/v1/products?id=eq.'+editId,{method:'PATCH',body:JSON.stringify(d)});
 else await api('/rest/v1/products',{method:'POST',body:JSON.stringify(d)});
 limpiar();say('Producto guardado.');lista()}catch(x){say('Error al guardar. Revisa los datos y la conexión.')}};
async function lista(){
 items=await api('/rest/v1/products?select=*&order=orden.asc,created_at.asc');const box=$('#lista');box.replaceChildren();
 items.forEach(p=>{const d=document.createElement('div');d.className='item';
  const im=document.createElement('img');im.alt='';im.src=p.foto1||'assets/images/placeholder.svg';
  const sp=document.createElement('span');sp.textContent=p.nombre+(p.visible?'':' (oculto)');
  const be=document.createElement('button');be.className='btn ghost';be.textContent='Editar';
  be.onclick=()=>{editId=p.id;$('#nombre').value=p.nombre;$('#pc').value=p.precio_caja??'';$('#pd').value=p.precio_docena??'';$('#pu').value=p.precio_unidad??'';$('#ord').value=p.orden;$('#vis').checked=p.visible;$('#gp').textContent='Guardar cambios';say('Editando. Si no eliges fotos nuevas, se mantienen las actuales.');scrollTo(0,0)};
  const bd=document.createElement('button');bd.className='btn ghost';bd.textContent='Eliminar';
  bd.onclick=async()=>{if(confirm('¿Eliminar "'+p.nombre+'"?')){await api('/rest/v1/products?id=eq.'+p.id,{method:'DELETE'});lista()}};
  d.append(im,sp,be,bd);box.append(d)})}
const TXT=[['hero_titulo','Portada: título',1],['hero_texto','Portada: texto',3],['productos_intro','Productos: introducción',2],['nosotros_intro','Nosotros: presentación',3],['historia','Historia',4],['mision','Misión',3],['vision','Visión',3],['valores','Valores (separados por comas)',2],['seguridad_intro','Seguridad: introducción',2],['prevencion','Seguridad: prevención',3],['profesionales','Seguridad: profesionales autorizados',3],['normativa','Seguridad: normativa',3],['correo','Correo de contacto',1],['telefono','Teléfono',1],['ubicacion','Ubicación',1],['privacidad','Aviso de privacidad',4]];
async function textos(){
 const cur=Object.fromEntries((await api('/rest/v1/site_texts?select=*')).map(r=>[r.key,r.value])),f=$('#ft');f.replaceChildren();
 TXT.forEach(([k,l,n])=>{const lb=document.createElement('label');lb.textContent=l;lb.htmlFor='t_'+k;const t=document.createElement('textarea');t.id='t_'+k;t.rows=n;t.value=cur[k]||'';f.append(lb,t)});
 const b=document.createElement('button');b.className='btn';b.style.marginTop='16px';b.textContent='Guardar textos';f.append(b)}
$('#ft').onsubmit=async e=>{e.preventDefault();
 const rows=TXT.map(([k])=>({key:k,value:$('#t_'+k).value.trim()})).filter(r=>r.value);
 try{await api('/rest/v1/site_texts',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify(rows)});say('Textos guardados. Actualiza la página principal para verlos.')}catch{say('Error al guardar los textos.')}};
async function inicio(){$('#login').hidden=true;$('#panel').hidden=false;try{await lista();await textos()}catch{}}
if(!A||!K)say('Falta configurar js/config.js (Etapa 2).');else if(tok)inicio();

