// Simple Tasbih Counter with persistence
const STORAGE_KEY = "tasbih_counter_v1";

const countEl = document.getElementById('count');
const tapBtn = document.getElementById('tapBtn');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const setBtn = document.getElementById('setBtn');
const goalInput = document.getElementById('goalInput');
const progressBar = document.getElementById('progressBar');

let state = {
  count: 0,
  goal: parseInt(goalInput.value || "33", 10)
};

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      state = Object.assign(state, parsed);
    }
  }catch(e){ console.warn("load failed", e) }
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }catch(e){}
}
function render(){
  countEl.textContent = state.count;
  goalInput.value = state.goal;
  const pct = Math.min(100, Math.round((state.count/state.goal)*100));
  progressBar.style.width = pct + '%';
  // small visual feedback if reached
  if(state.count >= state.goal){
    progressBar.style.background = 'linear-gradient(90deg,#7bed9f,#2ed573)';
  }else{
    progressBar.style.background = 'linear-gradient(90deg,#ffd166,#ff8a00)';
  }
}

function tap(increment = 1){
  state.count = Math.max(0, state.count + increment);
  saveState();
  render();
  // optional vibration & sound
  if(navigator.vibrate) navigator.vibrate(30);
  // quick pulse
  tapBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 150 });
}

tapBtn.addEventListener('click', () => tap(1));
undoBtn.addEventListener('click', ()=> tap(-1));

let resetTimer = null;
resetBtn.addEventListener('mousedown', startResetHold);
resetBtn.addEventListener('touchstart', startResetHold, {passive:true});
resetBtn.addEventListener('mouseup', cancelResetHold);
resetBtn.addEventListener('mouseleave', cancelResetHold);
resetBtn.addEventListener('touchend', cancelResetHold);

function startResetHold(){
  // Press and hold 1s to confirm reset
  resetTimer = setTimeout(()=>{
    if(confirm("کیا آپ واقعی ری سیٹ کرنا چاہتے ہیں؟")){
      state.count = 0; saveState(); render();
    }
  }, 1000);
}
function cancelResetHold(){
  if(resetTimer){ clearTimeout(resetTimer); resetTimer = null; }
}

setBtn.addEventListener('click', ()=>{
  const val = parseInt(prompt("نیا کاؤنٹ درج کریں:", state.count),10);
  if(!isNaN(val) && val>=0){
    state.count = val; saveState(); render();
  }
});

goalInput.addEventListener('change', ()=>{
  const v = parseInt(goalInput.value || "33", 10);
  state.goal = Math.max(1, v); saveState(); render();
});

// keyboard support
window.addEventListener('keydown', (e)=>{
  if(e.key === ' ' || e.code === 'Space'){ e.preventDefault(); tap(1) }
  if(e.key === 'Backspace') tap(-1);
});

// init
loadState();
render();
