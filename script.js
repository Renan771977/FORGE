let currentSection='hero';
let quizAnswers={};
let quizResult={};
let isLoggedIn=false;
let userName='Renan';

function showSection(id){
  if(id==='cliente'&&!isLoggedIn){showSection('cadastro');return;}
  document.querySelectorAll('section').forEach(s=>{s.classList.remove('active')});
  const target=document.getElementById(id);
  if(target){target.classList.add('active');window.scrollTo(0,0)}
  currentSection=id;
  document.querySelectorAll('.nav-links a').forEach(a=>{a.classList.remove('active')});
  const navMap={vendas:'nav-vendas',configurador:'nav-configurador',benchmark:'nav-benchmark',consultoria:'nav-consultoria'};
  if(navMap[id]){const el=document.getElementById(navMap[id]);if(el)el.classList.add('active')}
  document.getElementById('main-footer').style.display=(id==='cadastro')?'none':'block';
}

function switchTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active'));
  document.querySelectorAll('.auth-tab').forEach(t=>{if(t.textContent.toLowerCase().includes(tab==='login'?'entrar':'criar'))t.classList.add('active')});
  document.getElementById('form-'+tab).classList.add('active');
}

function doLogin(){
  const email=document.getElementById('login-email').value||'seu@email.com';
  userName=email.split('@')[0].charAt(0).toUpperCase()+email.split('@')[0].slice(1);
  isLoggedIn=true;
  document.getElementById('nav-user-area').classList.add('visible');
  document.getElementById('nav-cta-btn').style.display='none';
  document.getElementById('client-name-display').textContent=userName.charAt(0).toUpperCase()+userName.slice(1);
  document.getElementById('user-avatar-btn').textContent=userName.slice(0,2).toUpperCase();
  showSection('cliente');
}

function doRegister(){
  isLoggedIn=true;
  document.getElementById('nav-user-area').classList.add('visible');
  document.getElementById('nav-cta-btn').style.display='none';
  showSection('cliente');
}

function doLogout(){
  isLoggedIn=false;
  document.getElementById('nav-user-area').classList.remove('visible');
  document.getElementById('nav-cta-btn').style.display='';
  showSection('hero');
}

let qSelections=[null,null,null,null];
function selectOption(step,idx,val){
  qSelections[step]=val;
  const opts=document.querySelectorAll('#qstep'+step+' .quiz-option');
  opts.forEach((o,i)=>o.classList.toggle('selected',i===idx));
  const btn=document.getElementById('qnext'+step);
  if(btn){btn.style.opacity='1';btn.style.pointerEvents='auto'}
}

function nextStep(to){
  document.querySelectorAll('.quiz-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('qstep'+to).classList.add('active');
  for(let i=0;i<=to;i++){const d=document.getElementById('qd'+i);if(d)d.classList.add('done')}
}

function prevStep(to){
  document.querySelectorAll('.quiz-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('qstep'+to).classList.add('active');
}

function showQuizResult(){
  const use=qSelections[0],budget=qSelections[1],prio=qSelections[2];
  let r={};
  if(use==='ia'||budget==='ultra'||(budget==='high'&&prio==='gpu')){
    r={name:'Workstation IA',price:'R$ 18.900',cpu:'Ryzen 9 7950X',gpu:'RTX 4090 24GB',ram:'128GB DDR5 6000',storage:'2TB NVMe Gen5',cinebench:'24.850 pts',render:'28s Blender',ai:'~320 TOPS',fps:'280fps CS2'};
  }else if(use==='3d'||use==='dev'||(budget==='high'&&prio!=='gpu')){
    r={name:'Workstation Pro 3D',price:'R$ 12.500',cpu:'Intel i9-14900K',gpu:'RTX 4080 16GB',ram:'64GB DDR5 5600',storage:'1TB NVMe Gen4',cinebench:'19.200 pts',render:'41s Blender',ai:'~180 TOPS',fps:'200fps CS2'};
  }else if(use==='game'||(budget==='low'||budget==='mid')){
    r={name:'PC Gamer Ultra',price:'R$ 8.900',cpu:'Ryzen 7 7800X3D',gpu:'RTX 4070 Ti 12GB',ram:'32GB DDR5 6000',storage:'1TB NVMe Gen4',cinebench:'14.100 pts',render:'58s Blender',ai:'~120 TOPS',fps:'240fps CS2'};
  }else{
    r={name:'Workstation Pro 3D',price:'R$ 12.500',cpu:'Intel i9-14900K',gpu:'RTX 4080 16GB',ram:'64GB DDR5',storage:'1TB NVMe Gen4',cinebench:'19.200 pts',render:'41s Blender',ai:'~180 TOPS',fps:'200fps CS2'};
  }
  quizResult=r;
  document.getElementById('result-name').textContent=r.name;
  document.getElementById('result-sub').textContent='Build otimizada para o seu perfil — '+r.price;
  const specs=document.getElementById('result-specs');
  specs.innerHTML=[['CPU',r.cpu],['GPU',r.gpu],['RAM',r.ram],['Storage',r.storage]].map(([k,v])=>`<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val hi">${v}</span></div>`).join('');
  const scores=document.getElementById('result-scores');
  scores.innerHTML=[['Cinebench',r.cinebench],['Render',r.render],['FPS',r.fps]].map(([l,v])=>`<div class="score-item"><span class="score-val">${v}</span><span class="score-lbl">${l}</span></div>`).join('');
  document.querySelectorAll('.quiz-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('qresult').classList.add('active');
}

function resetQuiz(){
  qSelections=[null,null,null,null];
  document.querySelectorAll('.quiz-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('qstep0').classList.add('active');
  document.querySelectorAll('.quiz-option').forEach(o=>o.classList.remove('selected'));
  document.querySelectorAll('[id^="qnext"]').forEach(b=>{b.style.opacity='.3';b.style.pointerEvents='none'});
  for(let i=0;i<4;i++){const d=document.getElementById('qd'+i);if(d)d.classList.remove('done')}
  document.getElementById('qd0').classList.add('done');
}

function openBuildModal(name,price,cpu,gpu,ram,storage){
  document.getElementById('modal-build-name').textContent=name;
  document.getElementById('modal-build-price').textContent=price;
  document.getElementById('modal-build-specs').textContent=`${gpu} · ${cpu} · ${ram}`;
  document.getElementById('build-modal').classList.add('open');
}

function closeModal(){document.getElementById('build-modal').classList.remove('open')}

function submitBuildRequest(){
  closeModal();
  setTimeout(()=>alert('Solicitação enviada com sucesso!\nEntraremos em contato em até 24h pelo WhatsApp ou e-mail informado.'),200);
}

function selectSlot(el){
  document.querySelectorAll('.time-slot').forEach(s=>s.classList.remove('selected'));
  el.classList.add('selected');
}

document.getElementById('build-modal').addEventListener('click',function(e){if(e.target===this)closeModal()});

const svgHexBg=document.getElementById('hex-bg');
if(svgHexBg){
  const r=28;
  for(let row=0;row<7;row++){
    for(let col=0;col<5;col++){
      const ox=(row%2)*r*Math.sqrt(3)/2;
      const cx=col*r*Math.sqrt(3)+ox+r;
      const cy=row*r*1.5+r;
      let pts='';
      for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;pts+=`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)} `}
      const poly=document.createElementNS('http://www.w3.org/2000/svg','polygon');
      poly.setAttribute('points',pts.trim());
      poly.setAttribute('fill','none');
      poly.setAttribute('stroke','#F4EDE4');
      poly.setAttribute('stroke-width','0.5');
      svgHexBg.appendChild(poly);
    }
  }
}