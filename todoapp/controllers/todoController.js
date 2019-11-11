const Todo = require('../models/todoModel');

const http = require('http-status-codes');

module.exports = {
  async getTodoList(req, res) {
    try {
      const todoList = await Todo.find({});

      res.send(todoList);
    } catch (error) {
      res.sendStatus(http.INTERNAL_SERVER_ERROR).send('create error');
    }
  },

  async addTodo(req, res) {
    const { body: { text, status } } = req;

    try {
      const newTodo = await new Todo({
        status,
        text,
      });

      newTodo.save();

      res.send(newTodo);
    } catch (error) {
      res.sendStatus(http.INTERNAL_SERVER_ERROR).send('add error');
    }
  },

  async deleteSingle(req, res) {
    try {
      await Todo.deleteOne({ _id: req.params.id });
      res.send(http.OK);
    } catch (error) {
      res.sendStatus(http.INTERNAL_SERVER_ERROR).send(error.message);
    }
  },

  async deleteChecked(req, res) {
    try {
      await Todo.deleteMany({ status: true });
      res.send(http.OK);
    } catch (error) {
      res.sendStatus(http.INTERNAL_SERVER_ERROR).send(error.message);
    }
  },

  async changeCurrent(req, res) {
    const { body } = req;

    try {
      await Todo.updateOne({ _id: req.params.id }, body);
      res.sendStatus(http.OK);
    } catch (error) {
      res.sendStatus(http.INTERNAL_SERVER_ERROR).send(error.message);
    }
  },

  async checkAll(req, res) {
    const { body } = req;

    try {
      await Todo.updateMany({}, body);
      res.sendStatus(http.OK);
    } catch (error) {
      res.sendStatus(http.INTERNAL_SERVER_ERROR).send(error.message);
    }
  },
};