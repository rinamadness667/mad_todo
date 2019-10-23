// Create const and let for todo
let todoList = [];
let filter = 'all';
let currentPage = 1;

const $todoList = $('#todoList');
const $addTodo = $('#add-todo');
const $newTodo = $('#new-todo');
const $checkAll = $('#check-all');
const $all = $('#btn-all');
const $active = $('#btn-active');
const $complete = $('#btn-complete');
const $btnDelete = $('#btn-delete');
const $pagination = $('#pagination');
const $container = $('.container');
const ENTER = 13;
const TODO_PER_PAGE = 5;

// Replace scripts and symbols
const scriptReplace = function(name) {
  const eMap = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&#39;',
    '/': '&#x2F;',
    '<': '&lt;',
    '=': '&#x3D;',
    '>': '&gt;',
    '`': '&#x60;',
  };

  return name.replace(/[&<>"'`=/]/gu, el => eMap[el]);
};

// Filter for active and complete
const filtration = function() {
  let filterTodo = [];

  switch (filter) {
    case 'active':
      filterTodo = todoList.filter(item => item.status === false);

      break;
    case 'complete':
      filterTodo = todoList.filter(item => item.status === true);

      break;
    default:
      filterTodo = todoList;
  }

  return filterTodo;
};

const slicingPages = function() {
  const maxTasks = currentPage * TODO_PER_PAGE;
  const firstTaskOnPage = maxTasks - TODO_PER_PAGE;
  const lastTaskOnPage = firstTaskOnPage + TODO_PER_PAGE;

  return filtration().slice(firstTaskOnPage, lastTaskOnPage);
};

// Add new pages for pagination
const addNewPage = function() {
  $pagination.empty();
  const condition = Math.ceil(filtration().length / TODO_PER_PAGE);

  for (let i = 1; i <= condition; i++) {
    $pagination.append(`<input type="button" class="pagination
      ${i === currentPage ? 'active-page' : ''}" id="page" value="${i}">`);
  }
  $(`input[value=${currentPage}]`).addClass('active-page');
};

// // Create render
const render = function() {
  $todoList.empty();

  slicingPages()
    .forEach(item => {
      const inputText = scriptReplace(item.text);

      $todoList.append(`<li id="${item.id}">
    <input type="checkbox" class="checkbox" ${item.status ? 'checked' : ''}>
    <span id="toDo">${inputText}</span>
    <input type="button" id="X" class="button-x" value="X">
    </li>`);
    });

  if (todoList.length) {
    const statusCheckAll = todoList.every(element => element.status === true);

    $checkAll.prop('checked', statusCheckAll);
  } else {
    $checkAll.prop('checked', false);
  }

  // Counter for tasks
  const { length: completeTodo } = todoList.filter(el => el.status === true);
  const activeTodo = todoList.length - completeTodo;

  if (todoList.length) {
    $container.html(`<a>Сomplete todo:<b>${completeTodo}</b></a>
      <a>Active todo:<b>${activeTodo}</a></p>`);
  } else {
    $container.empty();
  }
  addNewPage();
};

// Adding new tasks by click on the button and enter
const createTodo = event => {
  filter = 'all';
  $all.addClass('active');
  $active.removeClass('active');
  $complete.removeClass('active');
  event.preventDefault();
  const todo = $newTodo.val()
    .trim();


  // eslint-disable-next-line no-negated-condition
  if (todo !== '') {
    todoList.push({
      id: Math.random(),
      status: false,
      text: todo,
    });
    $newTodo.val('');
    currentPage = Math.ceil(filtration().length / TODO_PER_PAGE);
    render();
  } else {
    $newTodo.val('');
  }
};

// Change filter for active, complete or all tasks
const allOnClick = event => {
  filter = 'all';
  $(event.currentTarget).addClass('active');
  $active.removeClass('active');
  $complete.removeClass('active');
  currentPage = Math.ceil(filtration().length / TODO_PER_PAGE);
  render();
};

const activeOnClick = event => {
  filter = 'active';
  $(event.currentTarget).addClass('active');
  $all.removeClass('active');
  $complete.removeClass('active');
  currentPage = Math.ceil(filtration().length / TODO_PER_PAGE);
  render();
};

const completeOnClick = event => {
  filter = 'complete';
  $(event.currentTarget).addClass('active');
  $all.removeClass('active');
  $active.removeClass('active');
  currentPage = Math.ceil(filtration().length / TODO_PER_PAGE);
  render();
};

// Change current page
const changeCurrentPage = event => {
  currentPage = $(event.currentTarget).attr('value');
  render();
};

// Delete tasks by 'x'
const deleteSingleTask = event => {
  const currentId = Number($(event.currentTarget.parentElement).attr('id'));

  todoList = todoList.filter(el => el.id !== currentId);
  if (currentPage >= Math.ceil(filtration().length / TODO_PER_PAGE)) {
    currentPage = Math.ceil(filtration().length / TODO_PER_PAGE);
  }
  render();
};

//  Checked status for single task
const changeCheckStatus = event => {
  const currentId = Number($(event.currentTarget.parentElement).attr('id'));


  todoList.forEach(item => {
    if (item.id === currentId) {
      item.status = !item.status;
    }
  });

  if (currentPage >= Math.ceil(filtration().length / TODO_PER_PAGE)) {
    currentPage = Math.ceil(filtration().length / TODO_PER_PAGE);
  }
  render();
};

// Delete tasks by button 'delete'
const deleteAllChecked = () => {
  todoList = todoList.filter(el => el.status === false);

  if (currentPage >= Math.ceil(filtration().length / TODO_PER_PAGE)) {
    currentPage = Math.ceil(filtration().length / TODO_PER_PAGE);
  }
  render();
};

// Edit by dblclick
const editByDblclick = event => {
  const prevValue = $(event.currentTarget).text();


  $(event.currentTarget).parent()
    .html(`<input type="text" id="edit" value="">`);
  const $edit = $('#edit');


  $edit.focus();
  $edit.val(prevValue);
};

const editSave = () => {
  const editText = $('#edit').val()
    .trim();
  const currentId = Number($(event.target).parent()
    .attr('id'));


  if (!editText) {
    render();

    return false;
  }

  todoList.forEach(item => {
    if (item.id === currentId) {
      item.text = editText;
    }
  });
  render();

  return true;
};

// Accept edit by enter
const saveEditByEnter = event => {
  if (event.which === ENTER) {
    editSave();
  }
};

// Check all tasks
const checkAllTasks = event => {
  const [{ checked: checkStatus }] = $(event.currentTarget);

  todoList.forEach(item => {
    item.status = checkStatus;
  });
  render();
};

// Event handlers
$addTodo.on('submit', createTodo);
$todoList.on('blur', '#edit', editSave);
$todoList.on('keypress', '#edit', saveEditByEnter);
$todoList.on('click', 'input[type=button]', deleteSingleTask);
$checkAll.on('click', checkAllTasks);
$btnDelete.on('click', deleteAllChecked);
$pagination.on('click', 'input[type=button]', changeCurrentPage);
$todoList.on('click', 'input[type=checkbox]', changeCheckStatus);
$todoList.on('dblclick', 'span', editByDblclick);
$all.on('click', allOnClick);
$active.on('click', activeOnClick);
$complete.on('click', completeOnClick);
