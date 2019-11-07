$(document).ready(() => {

  let todoList = JSON.parse(localStorage.getItem('todo')) || [];
  let filter = 'all';
  let currentPage = 1;

  const $todoList = $('#todo-list');
  const $newTodo = $('#new-todo');
  const $addTodo = $('#add-todo');
  const $checkAll = $('#check-all');
  const $btnAll = $('#btn-all');
  const $btnActive = $('#btn-active');
  const $btnComplete = $('#btn-complete');
  const $btnDelete = $('#btn-delete');
  const $pagination = $('#pagination');
  const $container = $('.container');
  const ENTER = 13;
  const TODO_PER_PAGE = 5;

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

  const filtration = () => {
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
  
  const condition = () => Math.ceil(filtration().length / TODO_PER_PAGE);

  const currentCondition = () => {
    if (currentPage >= condition()) {
      currentPage = condition();
    }
  };

  const slicingPages = () => {
    const maxTasks = currentPage * TODO_PER_PAGE;
    const firstTaskOnPage = maxTasks - TODO_PER_PAGE;
    const lastTaskOnPage = firstTaskOnPage + TODO_PER_PAGE;
    const filterTodo = filtration();

    return filterTodo.slice(firstTaskOnPage, lastTaskOnPage);
  };

  const addNewPage = () => {
    $pagination.empty();
    let str = ``;

    for (let i = 1; i <= condition(); i++) {
      $pagination.html(str += `<input type="button" class="pagination
        ${i === (currentPage && 'active-page')}" id="page" value="${i}">`);
    }

    $pagination.html(str);
    $(`input[value=${currentPage}]`).addClass('active-page');
  };

  const counter = () => {
    const { length: completeTodo } = todoList.filter(el => el.status === true);
    const activeTodo = todoList.length - completeTodo;

    if (todoList.length) {
      $container.html(`<a>Complete todo:<b>${completeTodo}</b></a>
      <a>Active todo:<b>${activeTodo}</a></p>`);
    } else {
      $container.empty();
    }
    addNewPage();
  };

  const getLocalStorage = () => {
    const item = JSON.stringify(todoList); 

    let setItem = localStorage.setItem('todo', item);
    let getItem = localStorage.getItem('todo');
  };

  const render = () => {
    $todoList.empty();
    let str = ``;

    slicingPages()
      .forEach(item => {
        const inputText = scriptReplace(item.text);

        str += `<li id="${item.id}">
        <input type="checkbox" class="checkbox" ${item.status ? 'checked' : ''}>
        <span id="toDo">${inputText}</span>
        <input type="button" id="X" class="button-x" value="X">
        </li>`;
      });

    $todoList.html(str);

    if (todoList.length) {
      const statusCheckAll = todoList.every(el => el.status === true);

      $checkAll.prop('checked', statusCheckAll);
    } else {
      $checkAll.prop('checked', false);
    }
    counter();
    getLocalStorage();
  };

  render();

  const createTodo = event => {
    filter = 'all';
    $btnAll.addClass('active');
    $btnActive.removeClass('active');
    $btnComplete.removeClass('active');
    event.preventDefault();
    const todo = $newTodo.val()
      .trim();

    if (todo) {
      todoList.push({
        id: Math.random(),
        status: false,
        text: todo,
      });
      $newTodo.val('');
      currentPage = condition();
      getLocalStorage();
      render();
    }

    $newTodo.val('');
  };

  const changeFilter = () => {
    $(event.currentTarget).addClass('active');
    currentPage = condition();
    render();
  };

  const allOnClick = () => {
    filter = 'all';
    $btnActive.removeClass('active');
    $btnComplete.removeClass('active');
    changeFilter();
  };

  const activeOnClick = () => {
    filter = 'active';
    $btnAll.removeClass('active');
    $btnComplete.removeClass('active');
    changeFilter();
  };

  const completeOnClick = () => {
    filter = 'complete';
    $btnAll.removeClass('active');
    $btnActive.removeClass('active');
    changeFilter();
  };

  const changeCurrentPage = event => {
    currentPage = $(event.currentTarget).attr('value');
    render();
  };

  const deleteSingleTask = event => {
    const currentId = Number($(event.currentTarget.parentElement).attr('id'));

    todoList = todoList.filter(el => el.id !== currentId);
    currentCondition();
    render();
  };

  const changeCheckStatus = event => {
    const currentId = Number($(event.currentTarget.parentElement).attr('id'));


    todoList.forEach(item => {
      if (item.id === currentId) {
        item.status = !item.status;
      }
    });

    currentCondition();
    render();
  };

  const deleteAllChecked = () => {
    todoList = todoList.filter(el => el.status === false);

    currentCondition();
    render();
  };

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

    if (editText) {
      todoList.forEach(item => {
        if (item.id === currentId) {
          item.text = editText;
        }
      });
      render();
    } else {
      render();
    }
  };

  const saveEditByEnter = event => {
    if (event.which === ENTER) {
      editSave();
    }
  };

  const checkAllTasks = event => {
    const [{ checked: checkStatus }] = $(event.currentTarget);

    todoList.forEach(item => {
      item.status = checkStatus;
    });

    if (filter !== 'all') {
      currentPage = condition();
    }
    render();
  };

  $addTodo.on('submit', createTodo);
  $todoList.on('blur', '#edit', editSave);
  $todoList.on('keypress', '#edit', saveEditByEnter);
  $todoList.on('click', 'input[type=button]', deleteSingleTask);
  $checkAll.on('click', checkAllTasks);
  $btnDelete.on('click', deleteAllChecked);
  $pagination.on('click', 'input[type=button]', changeCurrentPage);
  $todoList.on('change', 'input[type=checkbox]', changeCheckStatus);
  $todoList.on('dblclick', 'span', editByDblclick);
  $btnAll.on('click', allOnClick);
  $btnActive.on('click', activeOnClick);
  $btnComplete.on('click', completeOnClick);
});



