$(document).ready(() => {
  let todoList = [];
  let filter = 'all';
  let currentPage = 1;

  const $todoList = $('#todo-list');
  const $newTodo = $('#new-todo');
  const $addTodo = $('#add-todo');
  const $checkAll = $('#check-all');
  const $btnDelete = $('#btn-delete');
  const $pagination = $('#pagination');
  const $container = $('.container');
  const $buttons = $('.buttons');
  const ENTER = 13;
  const TODO_PER_PAGE = 5;

  const scriptReplace = name => {
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

  const sortStatus = () => {
    const status = todoList.length
      && todoList.every(item => item.status === true);
    const statusOfSort = Boolean(status);

    $checkAll.prop('checked', statusOfSort);
  };

  const addNewPage = () => {
    $pagination.empty();
    let str = ``;

    for (let i = 1; i <= condition(); i++) {
      str += `<button class="pagination" 
        id="page" value="${i}">${i}</button>`;
    }

    $pagination.html(str);
    $(`button[value=${currentPage}]`).addClass('active-page');
    sortStatus();
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

  const render = () => {
    $todoList.empty();
    let str = ``;

    slicingPages()
      .forEach(item => {
        str += `<li id="${item._id}">
        <input type="checkbox" class="checkbox" ${item.status ? 'checked' : ''}>
        <span id="toDo">${item.text}</span>
        <input type="button" id="X" class="button-x" value="X">
        </li>`;
      });

    $todoList.html(str);

    counter();
  };

  const getTodoList = () => {
    fetch('/getTodo', { method: 'GET' })
      .then(res => res.json())
      .then(res => {
        todoList = res;
        render();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const changeFilter = tabId => {
    const chosenFilter = $(event.currentTarget).attr('id');
    const index = 4;

    $buttons.removeClass('active');
    $(`#${tabId}`).addClass('active');
    filter = chosenFilter.substr(index);

    currentPage = condition();
    render();
  };

  const changeCurrentPage = event => {
    currentPage = $(event.currentTarget).attr('value');
    render();
  };

  const createTodo = event => {
    changeFilter('btn-all');
    event.preventDefault();
    const content = $newTodo.val()
      .trim();

    if (content) {
      const todo = {
        status: false,
        text: scriptReplace(content),
      };

      fetch('/add', {
        body: JSON.stringify(todo),
        headers: { 'Content-type': 'application/json' },
        method: 'POST',
      })
        .then(res => res.json())
        .then(res => {
          todoList.push(res);
          $newTodo.val('');
          currentPage = condition();
          render();
        });
    }

    $newTodo.val('');
    sortStatus();
  };

  const deleteSingleTask = event => {
    const currentId = $(event.currentTarget).parent()
      .attr('id');
    const index = Number(todoList.findIndex(item => item._id === currentId));

    fetch(`/delete/${currentId}`, { method: 'DELETE' })
      .then(() => {
        todoList.splice(index, 1);
        currentCondition();
        sortStatus();
        render();
      });
  };

  const changeTodo = (changes, currentId) => {
    fetch(`/changeCurrent/${currentId}`, {
      body: JSON.stringify(changes),
      headers: { 'Content-type': 'application/json' },
      method: 'PUT',
    })
      .then(() => {
        todoList.forEach(item => {
          if (changes.text && item._id === currentId) {
            const { text } = changes;

            item.text = text;
          } else if (item._id === currentId) {
            const { status } = changes;

            item.status = status;
          }
        });
        currentCondition();
        sortStatus();
        render();
      });
  };

  const changeCheckStatus = event => {
    const currentId = $(event.currentTarget).parent()
      .attr('id');
    const statusTodo = $(event.currentTarget).is(':checked');
    const changes = { status: statusTodo };


    changeTodo(changes, currentId);
  };

  const deleteAllChecked = () => {
    fetch('/delete', { method: 'DELETE' })
      .then(() => {
        todoList = todoList.filter(el => el.status === false);
        currentCondition();
        sortStatus();
        render();
      });
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
    const currentId = $(event.target).parent()
      .attr('id');

    if (editText) {
      todoList.forEach(item => {
        if (item._id === currentId) {
          item.text = scriptReplace(editText);
        }
      });

      const changes = { text: editText };

      changeTodo(changes, currentId);
    }
  };

  const saveEditByEnter = event => {
    if (event.which === ENTER) {
      editSave();
    }
  };

  const checkAllTasks = event => {
    const [{ checked: checkStatus }] = $(event.currentTarget);
    const body = { status: checkStatus };

    fetch('/checkAll', {
      body: JSON.stringify(body),
      headers: { 'Content-type': 'application/json' },
      method: 'PUT',
    })
      .then(() => {
        todoList.forEach(item => {
          item.status = checkStatus;
        });

        if (filter !== 'all') {
          currentPage = condition();
        }
        render();
      });
  };

  $(document).on('ready', getTodoList());
  $addTodo.on('submit', createTodo);
  $todoList.on('blur', '#edit', editSave);
  $todoList.on('keypress', '#edit', saveEditByEnter);
  $todoList.on('click', 'input[type=button]', deleteSingleTask);
  $checkAll.on('change', checkAllTasks);
  $btnDelete.on('click', deleteAllChecked);
  $pagination.on('click', 'button', changeCurrentPage);
  $todoList.on('change', 'input[type=checkbox]', changeCheckStatus);
  $todoList.on('dblclick', 'span', editByDblclick);
  $buttons.on('click', function() {
    const currentIdTab = $(this).attr(`id`);

    changeFilter(currentIdTab);
  });
});