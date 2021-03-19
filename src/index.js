const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const {username} = req.headers;

  const user = users.find((user) => user.username === username);

  if(!user){
    return res.status(404).json({error: 'Customer not found'});
  }

  req.user = user;

  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const userExists = users.some((user) => user.username === username);

  if(userExists){
    return res.status(400).json({error: 'User already exists!'});
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  const user = users.find((user) => user.username === username);

  return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req;

  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const {title, deadline} = req.body;

  const {user} = req;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
	  created_at: new Date()
  };

  user.todos.push(newTodo);

  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {user} = req;
  const {title, deadline} = req.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return res.status(404).json({error: 'TODO not found'});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {user} = req;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return res.status(404).json({error: 'TODO not found'});
  }

  todo.done = true;

  return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {user} = req;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return res.status(404).json({error: 'TODO not found'});
  }

  user.todos.splice(todo, 1);

  return res.status(204).json();
});

module.exports = app;