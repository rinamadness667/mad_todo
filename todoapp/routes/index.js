const express = require('express');
const router = new express.Router();

const controller = require('../controllers/todoController');

router.get('/getTodo', controller.getTodoList);
router.post('/add', controller.addTodo);
router.delete('/delete/:id', controller.deleteSingle);
router.delete('/delete', controller.deleteChecked);
router.put('/changeCurrent/:id', controller.changeCurrent);
router.put('/checkAll', controller.checkAll);

module.exports = router;
