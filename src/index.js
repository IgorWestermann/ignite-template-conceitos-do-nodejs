const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { user, username } = request.body;

  const userAlreadyExists = users.some((usuario) => usuario.user === user);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists",
    });
  }

  const account = {
    id: uuidv4(),
    user,
    username,
    todos: [],
  };

  users.push(account);

  return response.status(201).json(account);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  // const newTodo = users.find((todos) => todos.username === user.username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  // newTodo.todos.push(todo);
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.findIndex((todo) => todo.id === id);

  if (todo < 0) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const todoToChange = user.todos[todo];

  title ? (todoToChange.title = title) : false;
  deadline ? (todoToChange.deadline = new Date(deadline)) : false;

  return response.status(204).json(todoToChange);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.findIndex((todo) => todo.id === id);

  if (todo < 0) {
    return response.status(400).json({ error: "Todo not found" });
  }

  user.todos[todo].done = true;

  return response.status(201).json(user.todos[todo].done);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(400).json({ error: "Todo not found" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
