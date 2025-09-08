// ===== HeroFit Tracker (PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

const $ = sel => document.querySelector(sel);
const todayLabel = $('#today-date');
const todayMeals = $('#today-meals');
const todayWorkouts = $('#today-workouts');
const statCal = $('#stat-cal');
const statPro = $('#stat-pro');
const statWo = $('#stat-wo');
const quickFoods = $('#quick-foods');
const quickWOs = $('#quick-workouts');

// Basic food database (kcal & protein per serving)
const FOODS = [
  {name:'Fried Quail Eggs (6 pcs street style)', kcal:168, protein:6.6},
  {name:'Chicken Breast 200g (cooked)', kcal:330, protein:62},
  {name:'Pork (grilled/lean) 200g', kcal:400, protein:50},
  {name:'Tuna Can (drained)', kcal:150, protein:32},
  {name:'Sisig 150g', kcal:400, protein:20},
  {name:'Sisig 200g', kcal:550, protein:28},
  {name:'Bicol Express 150g', kcal:450, protein:18},
  {name:'Bicol Express 200g', kcal:600, protein:24},
  {name:'Egg (1 pc)', kcal:70, protein:6},
  {name:'Rice 1 cup (cooked)', kcal:200, protein:4},
  {name:'Rice 1/2 cup (cooked)', kcal:100, protein:2},
  {name:'Potato (1/2 medium)', kcal:65, protein:1.5},
  {name:'Chicken Breast 150g', kcal:250, protein:46},
  {name:'Pork (grilled/lean) 150g', kcal:300, protein:37}
];

// Workout templates
const WORKOUTS = [
  {name:'Push Day', details:'DB Bench 4x8-12, Shoulder Press 4x8-12, Side Raises 3x12-15, Push-ups 2xf'},
  {name:'Pull Day', details:'1-Arm Row 4x8-12/arm, DB Curl 3x10-12, Hammer Curl 3x10-12, Plank 3x45s'},
  {name:'Legs & Core', details:'Goblet Squat 4x12-15, RDL 4x8-12, Lunges 3x10/leg, Leg Raises 3x15'}
];

// State persisted in localStorage
const S = {
  get d(){ return localStorage.getItem('herofit-date') || new Date().toISOString().slice(0,10); },
  set d(v){ localStorage.setItem('herofit-date', v); },
  get data(){
    return JSON.parse(localStorage.getItem('herofit-data')||'{}');
  },
  set data(v){
    localStorage.setItem('herofit-data', JSON.stringify(v));
  },
  get settings(){
    return JSON.parse(localStorage.getItem('herofit-settings')||'{"targetCal":1900,"targetPro":160}');
  },
  set settings(v){ localStorage.setItem('herofit-settings', JSON.stringify(v)); }
};

function fmtDate(d){ return new Date(d+'T00:00:00').toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'}); }
function ensureDay(d){
  const data = S.data;
  data[d] = data[d] || { meals:[], workouts:[], progress:null };
  S.data = data;
}
function renderQuickFoods(){
  quickFoods.innerHTML = '';
  FOODS.forEach((f,i)=>{
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-secondary btn-sm';
    btn.textContent = `${f.name} • ${f.kcal} kcal / ${f.protein}g`;
    btn.addEventListener('click', ()=> addMeal(f.name, f.kcal, f.protein));
    quickFoods.appendChild(btn);
  });
}
function renderQuickWorkouts(){
  quickWOs.innerHTML = '';
  WORKOUTS.forEach(w=>{
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-secondary btn-sm';
    btn.textContent = `${w.name} — ${w.details}`;
    btn.addEventListener('click', ()=> addWorkout(w.name, w.details));
    quickWOs.appendChild(btn);
  });
}

function addMeal(name, kcal, protein){
  const d = S.d; ensureDay(d);
  const data = S.data;
  const type = document.getElementById('meal-type').value;
  data[d].meals.push({type, name, kcal, protein, t: Date.now()});
  S.data = data;
  renderToday();
}
function addCustomFood(){
  const type = document.getElementById('meal-type').value;
  const name = prompt('Food name:');
  if(!name) return;
  const kcal = parseFloat(prompt('Calories (kcal):')||'0')||0;
  const protein = parseFloat(prompt('Protein (g):')||'0')||0;
  addMeal(name, kcal, protein);
}
function addWorkout(name, details){
  const d = S.d; ensureDay(d);
  const data = S.data;
  if(!details){
    details = prompt('Workout details (sets x reps, weight):')||'';
  }
  data[d].workouts.push({name, details, t: Date.now()});
  S.data = data;
  renderToday();
}
function delItem(kind, idx){
  const d = S.d; ensureDay(d);
  const data = S.data;
  data[d][kind].splice(idx,1);
  S.data = data;
  renderToday();
}

function renderToday(){
  const d = S.d; ensureDay(d);
  todayLabel.textContent = fmtDate(d);
  const day = S.data[d];
  // Meals list
  todayMeals.innerHTML = '';
  let kc=0, pr=0;
  day.meals.forEach((m,i)=>{
    kc += m.kcal; pr += m.protein;
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    li.innerHTML = `<div><strong>${m.type}:</strong> ${m.name}<br><small>${m.kcal} kcal • ${m.protein}g</small></div>
      <button class="btn btn-sm btn-outline-danger">✕</button>`;
    li.querySelector('button').addEventListener('click', ()=>delItem('meals', i));
    todayMeals.appendChild(li);
  });
  // Workouts list
  todayWorkouts.innerHTML = '';
  day.workouts.forEach((w,i)=>{
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    li.innerHTML = `<div><strong>${w.name}</strong><br><small>${w.details}</small></div>
      <button class="btn btn-sm btn-outline-danger">✕</button>`;
    li.querySelector('button').addEventListener('click', ()=>delItem('workouts', i));
    todayWorkouts.appendChild(li);
  });
  statCal.textContent = Math.round(kc);
  statPro.textContent = Math.round(pr);
  statWo.textContent = day.workouts.length;

  // Targets coloring
  const {targetCal, targetPro} = S.settings;
  statCal.parentElement.classList.toggle('border', true);
  statPro.parentElement.classList.toggle('border', true);
  if(targetCal){ statCal.parentElement.title = `Target ${targetCal}`; }
  if(targetPro){ statPro.parentElement.title = `Target ${targetPro}g`; }

  renderHistories();
  renderProgressList();
}

function renderHistories(){
  const histMeals = $('#meals-history');
  const histWOs = $('#workouts-history');
  const data = S.data;
  const dates = Object.keys(data).sort().reverse().slice(0,30);
  let htmlMeals = '<div class="list-group">';
  dates.forEach(d=>{
    const day = data[d];
    const kcal = day.meals.reduce((a,b)=>a+b.kcal,0);
    const pro  = day.meals.reduce((a,b)=>a+b.protein,0);
    htmlMeals += `<div class="list-group-item"><strong>${fmtDate(d)}</strong> — ${kcal} kcal • ${Math.round(pro)}g protein<br>`;
    day.meals.forEach(m=>{
      htmlMeals += `<small>${m.type}: ${m.name} (${m.kcal} kcal, ${m.protein}g)</small><br>`;
    });
    htmlMeals += `</div>`;
  });
  htmlMeals += '</div>';
  histMeals.innerHTML = htmlMeals;

  let htmlWO = '<div class="list-group">';
  dates.forEach(d=>{
    const day = data[d];
    if(day.workouts.length===0) return;
    htmlWO += `<div class="list-group-item"><strong>${fmtDate(d)}</strong><br>`;
    day.workouts.forEach(w=>{
      htmlWO += `<small>${w.name}: ${w.details}</small><br>`;
    });
    htmlWO += `</div>`;
  });
  htmlWO += '</div>';
  histWOs.innerHTML = htmlWO;
}

// Progress
function saveProgress(){
  const w = parseFloat($('#weight-input').value||'0');
  const waist = parseFloat($('#waist-input').value||'0');
  if(!w && !waist){ alert('Enter weight or waist.'); return; }
  const d = S.d; ensureDay(d);
  const data = S.data;
  data[d].progress = { weight:w||null, waist:waist||null, t: Date.now() };
  S.data = data;
  renderProgressList();
  alert('Progress saved.');
}

function renderProgressList(){
  const ul = $('#progress-list');
  ul.innerHTML = '';
  const entries = [];
  Object.entries(S.data).forEach(([d,day])=>{
    if(day.progress) entries.push({d, ...day.progress});
  });
  entries.sort((a,b)=> a.d < b.d ? 1 : -1);
  entries.forEach(e=>{
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    const parts = [];
    if(e.weight) parts.push(`Weight: ${e.weight} kg`);
    if(e.waist) parts.push(`Waist: ${e.waist} cm`);
    li.innerHTML = `<div><strong>${fmtDate(e.d)}</strong><br><small>${parts.join(' • ')}</small></div>`;
    ul.appendChild(li);
  });
}

// Settings / Import / Export
function saveSettings(){
  const c = parseInt($('#target-cal').value||'0')||null;
  const p = parseInt($('#target-pro').value||'0')||null;
  S.settings = {targetCal:c, targetPro:p};
  alert('Targets saved.');
}
function exportData(){
  const payload = {
    date: S.d,
    data: S.data,
    settings: S.settings,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'herofit-data.json';
  a.click();
}
function importData(){
  $('#import-file').click();
}
$('#import-file').addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const obj = JSON.parse(reader.result);
      if(obj.date) S.d = obj.date;
      if(obj.data) S.data = obj.data;
      if(obj.settings) S.settings = obj.settings;
      renderToday();
      alert('Import successful.');
    }catch(err){
      alert('Invalid file.');
    }
  };
  reader.readAsText(f);
});
function resetApp(){
  if(confirm('Reset all data?')){
    localStorage.removeItem('herofit-data');
    localStorage.removeItem('herofit-settings');
    renderToday();
  }
}

// Date navigation
$('#btn-prev-day').addEventListener('click', ()=> shiftDay(-1));
$('#btn-next-day').addEventListener('click', ()=> shiftDay(1));
function shiftDay(delta){
  const d = new Date(S.d+'T00:00:00');
  d.setDate(d.getDate()+delta);
  S.d = d.toISOString().slice(0,10);
  renderToday();
}

// Buttons
document.getElementById('btn-add-custom').addEventListener('click', addCustomFood);
document.getElementById('btn-log-workout').addEventListener('click', ()=> addWorkout('Custom', ''));
document.getElementById('btn-save-progress').addEventListener('click', saveProgress);
document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
document.getElementById('btn-export').addEventListener('click', exportData);
document.getElementById('btn-import').addEventListener('click', importData);
document.getElementById('btn-reset').addEventListener('click', resetApp);

// Render
document.addEventListener('DOMContentLoaded', () => {
  ensureDay(S.d);
  todayLabel.textContent = fmtDate(S.d);
  renderQuickFoods();
  renderQuickWorkouts();
  renderToday();
});
