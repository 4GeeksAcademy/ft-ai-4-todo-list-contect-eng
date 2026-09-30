const STORAGE_KEY = 'todo-app-items';
const filters = document.querySelectorAll('.filter-btn');
const form = document.getElementById('todo-form');
const input = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const reminderInput = document.getElementById('reminder-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('task-count');

let currentFilter = 'all';

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error('Unable to read saved tasks:', error);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function sortTasks(tasks) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    const aReminder = a.reminder ? new Date(a.reminder).getTime() : Number.MAX_SAFE_INTEGER;
    const bReminder = b.reminder ? new Date(b.reminder).getTime() : Number.MAX_SAFE_INTEGER;

    if (aReminder !== bReminder) {
      return aReminder - bReminder;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getVisibleTasks(tasks) {
  const orderedTasks = sortTasks(tasks);

  if (currentFilter === 'active') {
    return orderedTasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return orderedTasks.filter((task) => task.completed);
  }

  return orderedTasks;
}

function formatReminder(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getPriorityLabel(priority) {
  if (priority === 'high') {
    return 'High';
  }

  if (priority === 'low') {
    return 'Low';
  }

  return 'Medium';
}

function updateTaskCount(tasks) {
  const total = tasks.length;
  const remaining = tasks.filter((task) => !task.completed).length;

  if (total === 0) {
    count.textContent = '0 tasks';
    return;
  }

  count.textContent = `${remaining} remaining / ${total}`;
}

function createEditor(task) {
  const editor = document.createElement('div');
  editor.className = 'task-editor';

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = task.text;
  textInput.setAttribute('aria-label', 'Edit task text');

  const priorityInput = document.createElement('select');
  priorityInput.setAttribute('aria-label', 'Edit task priority');
  ['low', 'medium', 'high'].forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = `${getPriorityLabel(value)} priority`;
    option.selected = value === task.priority;
    priorityInput.appendChild(option);
  });

  const reminderInput = document.createElement('input');
  reminderInput.type = 'datetime-local';
  reminderInput.value = task.reminder || '';
  reminderInput.setAttribute('aria-label', 'Edit task reminder');

  const actions = document.createElement('div');
  actions.className = 'task-editor-actions';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'save-edit-btn';
  saveButton.textContent = 'Save';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'cancel-edit-btn';
  cancelButton.textContent = 'Cancel';

  actions.appendChild(saveButton);
  actions.appendChild(cancelButton);
  editor.appendChild(textInput);
  editor.appendChild(priorityInput);
  editor.appendChild(reminderInput);
  editor.appendChild(actions);

  saveButton.addEventListener('click', () => {
    const updatedText = textInput.value.trim();

    if (!updatedText) {
      textInput.focus();
      return;
    }

    const tasks = loadTasks();
    const target = tasks.find((entry) => entry.id === task.id);

    if (!target) {
      renderTasks();
      return;
    }

    target.text = updatedText;
    target.priority = priorityInput.value;
    target.reminder = reminderInput.value || null;
    saveTasks(tasks);
    renderTasks();
  });

  cancelButton.addEventListener('click', () => {
    renderTasks();
  });

  return editor;
}

function renderTasks() {
  const tasks = sortTasks(loadTasks());
  const visibleTasks = getVisibleTasks(tasks);

  list.innerHTML = '';

  if (!visibleTasks.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks here yet. Add one to get started.';
    list.appendChild(empty);
    updateTaskCount(tasks);
    return;
  }

  visibleTasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'todo-item';
    item.classList.toggle('completed', task.completed);

    const taskMain = document.createElement('div');
    taskMain.className = 'task-main';

    const checkLabel = document.createElement('label');
    checkLabel.className = 'todo-check';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = task.completed;

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = task.text;

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `priority-badge ${task.priority || 'medium'}`;
    priorityBadge.textContent = `${getPriorityLabel(task.priority || 'medium')} priority`;

    const reminder = document.createElement('span');
    reminder.className = 'reminder-badge';
    const formattedReminder = formatReminder(task.reminder);

    if (formattedReminder) {
      const reminderTime = new Date(task.reminder).getTime();
      const isOverdue = reminderTime < Date.now() && !task.completed;
      reminder.textContent = isOverdue ? `Overdue: ${formattedReminder}` : `Reminder: ${formattedReminder}`;
    } else {
      reminder.textContent = 'No reminder';
    }

    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(text);
    taskMain.appendChild(checkLabel);

    meta.appendChild(priorityBadge);
    meta.appendChild(reminder);
    taskMain.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'edit-btn';
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';

    checkbox.addEventListener('change', () => {
      const tasks = loadTasks();
      const target = tasks.find((entry) => entry.id === task.id);

      if (target) {
        target.completed = checkbox.checked;
        saveTasks(tasks);
        renderTasks();
      }
    });

    deleteButton.addEventListener('click', () => {
      const tasks = loadTasks().filter((entry) => entry.id !== task.id);
      saveTasks(tasks);
      renderTasks();
    });

    editButton.addEventListener('click', () => {
      const editor = createEditor(task);
      item.classList.add('task-editor-item');
      item.innerHTML = '';
      item.appendChild(editor);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    item.appendChild(taskMain);
    item.appendChild(actions);
    list.appendChild(item);
  });

  updateTaskCount(tasks);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const value = input.value.trim();

  if (!value) {
    input.focus();
    return;
  }

  const tasks = loadTasks();
  tasks.unshift({
    id: crypto.randomUUID(),
    text: value,
    completed: false,
    priority: prioritySelect.value || 'medium',
    reminder: reminderInput.value || null,
    createdAt: Date.now(),
  });

  saveTasks(tasks);
  form.reset();
  prioritySelect.value = 'medium';
  input.focus();
  renderTasks();
});

filters.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filters.forEach((btn) => btn.classList.toggle('active', btn === button));
    renderTasks();
  });
});

renderTasks();
