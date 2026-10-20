// All saved entries are the app's state. Changing them triggers render().
const STORAGE_KEY = 'daily-productivity-entries-v1';
let entries = [];
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  entries = Array.isArray(stored) ? stored.filter(e => e && typeof e.date === 'string' && Number.isFinite(e.score)) : [];
} catch (_) { entries = []; }

const $ = id => document.getElementById(id);
const today = new Date();
$('date').value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

function calculateScore(study, sleep, exercise, screen) {
  const studyPoints = Math.min(study / 4, 1) * 40;
  const sleepPoints = Math.max(0, 1 - Math.abs(sleep - 8) / 8) * 25;
  const exercisePoints = Math.min(exercise / 30, 1) * 25;
  const screenPoints = screen <= 2 ? 10 : Math.max(0, 10 - (screen - 2) * 2.5);
  return Math.round(studyPoints + sleepPoints + exercisePoints + screenPoints);
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
function localDay(date) { return new Date(`${date}T12:00:00`); }
function lastSevenDays() {
  const days = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  }
  return days;
}
function render() {
  const recent = lastSevenDays();
  const weekEntries = entries.filter(e => recent.includes(e.date));
  const latest = [...entries].sort((a,b) => b.date.localeCompare(a.date))[0];
  $('latestScore').textContent = latest ? `${latest.score}/100` : '—';
  $('weeklyAverage').textContent = weekEntries.length ? `${Math.round(weekEntries.reduce((sum,e)=>sum+e.score,0)/weekEntries.length)}/100` : '—';
  $('daysLogged').textContent = entries.length;
  $('chart').replaceChildren();
  recent.forEach(date => {
    const item = entries.find(e => e.date === date);
    const slot = document.createElement('div'); slot.className = 'bar-slot';
    const value = document.createElement('small'); value.textContent = item ? String(item.score) : '—';
    const bar = document.createElement('div'); bar.className = 'bar'; bar.style.height = `${item ? Math.max(item.score, 2) : 2}%`;
    bar.style.background = item ? '' : '#e7ebf4';
    const label = document.createElement('small'); label.textContent = localDay(date).toLocaleDateString(undefined,{weekday:'short'});
    slot.append(value,bar,label); $('chart').append(slot);
  });
  const history = $('history'); history.replaceChildren();
  if (!entries.length) { const p = document.createElement('p'); p.className='empty'; p.textContent='No days logged yet. Fill out the form above to get started.'; history.append(p); return; }
  const sorted = [...entries].sort((a,b) => $('sort').value === 'highest' ? b.score-a.score || b.date.localeCompare(a.date) : $('sort').value === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  sorted.forEach(item => {
    const row = document.createElement('div'); row.className='history-item';
    const info = document.createElement('div');
    const heading = document.createElement('strong'); heading.textContent=`${item.date} · `;
    const score = document.createElement('span'); score.className='score'; score.textContent=`${item.score}/100`;
    const details = document.createElement('p'); details.textContent=`Study ${item.study}h · Sleep ${item.sleep}h · Exercise ${item.exercise}m · Screen ${item.screen}h`;
    info.append(heading,score,details);
    const del = document.createElement('button'); del.type='button'; del.className='delete'; del.textContent='Delete';
    del.setAttribute('aria-label',`Delete entry for ${item.date}`);
    del.addEventListener('click', () => { entries = entries.filter(e=>e.date!==item.date); persist(); render(); });
    row.append(info,del); history.append(row);
  });
}
$('entryForm').addEventListener('submit', event => {
  event.preventDefault();
  const date=$('date').value;
  const ids=['study','sleep','exercise','screen'];
  const values=ids.map(id=>$(''+id).value.trim() === '' ? NaN : Number($(id).value));
  const [study,sleep,exercise,screen]=values;
  const error=$('error'); error.textContent='';
  if (!date || !Number.isFinite(localDay(date).getTime()) || date > lastSevenDays()[6]) { error.textContent='Choose a valid date that is not in the future.'; return; }
  if (values.some(v=>!Number.isFinite(v)||v<0) || study>24 || sleep>24 || exercise>1440 || screen>24 || study+sleep+exercise/60+screen>24) {
    error.textContent='Enter valid nonnegative amounts. Hours cannot exceed a 24-hour day in total.'; return;
  }
  if (!Number.isInteger(exercise)) { error.textContent='Exercise minutes must be a whole number.'; return; }
  const score=calculateScore(study,sleep,exercise,screen);
  entries=entries.filter(e=>e.date!==date);
  entries.push({date,study,sleep,exercise,screen,score});
  persist(); render(); $('entryForm').reset(); $('date').value=date;
});
$('sort').addEventListener('change',render);
$('reset').addEventListener('click',()=>{
  if (!entries.length) return;
  if (!confirm('Delete all saved days? This cannot be undone.')) return;
  entries=[];persist();render();$('error').textContent='';
});
render();
