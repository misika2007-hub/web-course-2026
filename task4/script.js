'use strict';

const form = document.getElementById('guess-form');
const input = document.getElementById('guess-input');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const errorEl = document.getElementById('error');
const attemptsEl = document.getElementById('attempts');
const historyEl = document.getElementById('history');
const winEl = document.getElementById('win');

let secret = '';
let attempts = 0;
let history = [];
let gameOver = false;

function generateSecret() {
  const digits = [];
  while (digits.length < 4) {
    const d = Math.floor(Math.random() * 10);
    if (!digits.includes(d)) {
      digits.push(d);
    }
  }
  return digits.join('');
}

function validateGuess(value) {
  if (!/^\d{4}$/.test(value)) {
    return 'Введите ровно 4 цифры';
  }
  const digits = value.split('');
  if (new Set(digits).size !== 4) {
    return 'Цифры не должны повторяться';
  }
  return '';
}

function countBullsAndCows(guess, target) {
  let bulls = 0;
  let cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === target[i]) {
      bulls++;
    } else if (target.includes(guess[i])) {
      cows++;
    }
  }
  return { bulls, cows };
}

function renderHistory() {
  historyEl.innerHTML = '';

  if (history.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'history__empty';
    empty.textContent = 'Попыток пока нет';
    historyEl.appendChild(empty);
    return;
  }

  history
    .map(item => {
      const li = document.createElement('li');
      li.className = 'history__item';

      const guessSpan = document.createElement('span');
      guessSpan.className = 'history__guess';
      guessSpan.textContent = item.guess;

      const resultSpan = document.createElement('span');
      resultSpan.className = 'history__result';
      resultSpan.textContent =
        `${item.bulls} бык(а), ${item.cows} коров(ы)`;

      li.append(guessSpan, resultSpan);
      return li;
    })
    .forEach(el => historyEl.appendChild(el));
}

function renderAttempts() {
  attemptsEl.textContent = attempts;
}

function render() {
  renderAttempts();
  renderHistory();
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.textContent = '';
  errorEl.hidden = true;
}

function finishGame() {
  gameOver = true;
  input.disabled = true;
  checkBtn.disabled = true;
  winEl.textContent = `Победа! Угадано за ${attempts} попыток`;
  winEl.hidden = false;
}

function handleGuess(value) {
  if (gameOver) return;

  const error = validateGuess(value);
  if (error) {
    showError(error);
    return;
  }

  clearError();

  const { bulls, cows } = countBullsAndCows(value, secret);
  attempts++;
  history.push({ guess: value, bulls, cows });

  input.value = '';
  input.focus();

  render();

  if (bulls === 4) {
    finishGame();
  }
}

function resetGame() {
  secret = generateSecret();
  attempts = 0;
  history = [];
  gameOver = false;

  input.value = '';
  input.disabled = false;
  checkBtn.disabled = false;
  winEl.hidden = true;
  winEl.textContent = '';
  clearError();

  render();
  input.focus();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  handleGuess(input.value.trim());
});

input.addEventListener('input', () => {
  input.value = input.value.replace(/\D/g, '').slice(0, 4);
  if (!errorEl.hidden) {
    clearError();
  }
});

resetBtn.addEventListener('click', resetGame);

resetGame();