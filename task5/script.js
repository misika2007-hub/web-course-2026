'use strict';

const board = document.getElementById('board');
const sectors = Array.from(document.querySelectorAll('.sector'));
const startBtn = document.getElementById('start-btn');
const roundEl = document.getElementById('round');
const statusEl = document.getElementById('status');

const SHOW_DELAY = 500;
const GAP_DELAY = 200;

const state = {
  sequence: [],
  inputIndex: 0,
  round: 0,
  isShowing: false,
  isWaitingInput: false,
  isGameOver: true,
  timers: [],
};

let audioCtx = null;
const SECTOR_FREQS = [329.63, 261.63, 220.0, 164.81];

function playTone(index) {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = SECTOR_FREQS[index] || 440;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // звук не должен ломать игру
  }
}

function clearTimers() {
  state.timers.forEach(id => clearTimeout(id));
  state.timers = [];
}

function schedule(fn, delay) {
  const id = setTimeout(() => {
    state.timers = state.timers.filter(t => t !== id);
    fn();
  }, delay);
  state.timers.push(id);
  return id;
}

function flashSector(index, duration) {
  const sector = sectors[index];
  sector.classList.add('active');
  playTone(index);
  return new Promise(resolve => {
    schedule(() => {
      sector.classList.remove('active');
      resolve();
    }, duration);
  });
}

function wait(ms) {
  return new Promise(resolve => schedule(resolve, ms));
}

function setStatus(text, modifier) {
  statusEl.textContent = text;
  statusEl.classList.remove('status--win', 'status--lose');
  if (modifier) {
    statusEl.classList.add(modifier);
  }
}

function setSectorsDisabled(disabled) {
  sectors.forEach(s => {
    s.disabled = disabled;
  });
}

function updateRound() {
  roundEl.textContent = state.round;
}

function resetState() {
  clearTimers();
  state.sequence = [];
  state.inputIndex = 0;
  state.round = 0;
  state.isShowing = false;
  state.isWaitingInput = false;
  state.isGameOver = false;
  sectors.forEach(s => s.classList.remove('active'));
  updateRound();
}

async function showSequence() {
  state.isShowing = true;
  state.isWaitingInput = false;
  setSectorsDisabled(true);

  for (let i = 0; i < state.sequence.length; i++) {
    if (state.isGameOver) return;
    await flashSector(state.sequence[i], SHOW_DELAY);
    await wait(GAP_DELAY);
  }

  if (state.isGameOver) return;

  state.isShowing = false;
  state.isWaitingInput = true;
  state.inputIndex = 0;
  setSectorsDisabled(false);
  setStatus('Ваш ход');
}

function addRandomStep() {
  const next = Math.floor(Math.random() * 4);
  state.sequence.push(next);
}

async function nextRound() {
  state.round++;
  updateRound();
  state.inputIndex = 0;
  addRandomStep();
  setStatus('Смотрите последовательность...');
  await wait(600);
  if (state.isGameOver) return;
  showSequence();
}

function endGame(success) {
  state.isGameOver = true;
  state.isShowing = false;
  state.isWaitingInput = false;
  setSectorsDisabled(true);
  startBtn.disabled = false;

  if (success) {
    setStatus(`Победа! Вы дошли до уровня ${state.round}`, 'status--win');
  } else {
    setStatus(`Вы дошли до уровня ${state.round}`, 'status--lose');
  }
}

function handleSectorClick(index) {
  if (state.isGameOver) return;
  if (!state.isWaitingInput) return;
  if (state.isShowing) return;

  flashSector(index, 250);

  const expected = state.sequence[state.inputIndex];

  if (index !== expected) {
    endGame(false);
    return;
  }

  state.inputIndex++;

  if (state.inputIndex === state.sequence.length) {
    state.isWaitingInput = false;
    setStatus('Верно!');
    schedule(() => {
      if (!state.isGameOver) {
        nextRound();
      }
    }, 700);
  }
}

function startGame() {
  resetState();
  startBtn.disabled = true;
  state.isGameOver = false;
  setStatus('Смотрите последовательность...');
  nextRound();
}

board.addEventListener('click', e => {
  const sector = e.target.closest('.sector');
  if (!sector) return;
  const index = Number(sector.dataset.index);
  handleSectorClick(index);
});

startBtn.addEventListener('click', startGame);

setSectorsDisabled(true);
updateRound();