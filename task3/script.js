'use strict';

let todos = [];
let currentFilter = 'all';
let nextId = 1;

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const warning = document.getElementById('warning');
const counter = document.getElementById('counter');
const filtersBox = document.getElementById('filters');
const list = document.getElementById('todo-list');

function getVisibleTodos() {
  if (currentFilter === 'active') {
    return todos.filter(t => !t.completed);
  }
  if (currentFilter === 'completed') {
    return todos.filter(t => t.completed);
  }
  return todos;
}

function render() {
  list.innerHTML = '';

  const visible = getVisibleTodos();

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Задач пока нет';
    list.appendChild(empty);
  } else {
    visible
      .map(createTodoElement)
      .forEach(el => list.appendChild(el));
  }

  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = todos.length - completedCount;
  counter.textContent = `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-item__checkbox';
  checkbox.checked = todo.completed;

  const span = document.createElement('span');
  span.className = 'todo-item__text';
  span.textContent = todo.text;

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'todo-item__delete';
  delBtn.textContent = 'Удалить';

  li.append(checkbox, span, delBtn);
  return li;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (trimmed === '') {
    warning.hidden = false;
    return;
  }
  warning.hidden = true;

  todos.push({
    id: nextId++,
    text: trimmed,
    completed: false,
  });

  input.value = '';
  input.focus();
  render();
}

function toggleTodo(id) {
  todos = todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  render();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  addTodo(input.value);
});

input.addEventListener('input', () => {
  if (!warning.hidden && input.value.trim() !== '') {
    warning.hidden = true;
  }
});

list.addEventListener('click', e => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains('todo-item__delete')) {
    deleteTodo(id);
  }
});

list.addEventListener('change', e => {
  if (e.target.classList.contains('todo-item__checkbox')) {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    toggleTodo(Number(li.dataset.id));
  }
});

filtersBox.addEventListener('click', e => {
  const btn = e.target.closest('.filters__btn');
  if (!btn) return;

  currentFilter = btn.dataset.filter;

  filtersBox
    .querySelectorAll('.filters__btn')
    .forEach(b => b.classList.toggle('is-active', b === btn));

  render();
});

render();