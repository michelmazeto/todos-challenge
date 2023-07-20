const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const users = [];

// #Middleware
function verifyIfUserExists(request, response, next) {
    const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if (!user) return response.status(404).json({ error: 'User not found' });

    request.user = user;

    next();
}

// #Routes
app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const usernameAlreadyExists = users.some((user) => user.username === username);

    if (usernameAlreadyExists) return response.status(400).json({ error: 'Username already exists' });

    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    });

    return response.status(201).send();
});

app.get('/todos', verifyIfUserExists, (request, response) => {
    const { user } = request;

    return response.status(200).send(user.todos);
});

app.post('/todos', verifyIfUserExists, (request, response) => {
    const { user } = request;

    const { title, deadline } = request.body;

    const insertTodos = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }

    user.todos.push(insertTodos);

    return response.status(201).send();
});

app.put('/todos/:id', verifyIfUserExists, (request, response) => {
    const { user } = request;

    const { title, deadline } = request.body;

    const paramId = request.params.id;

    const todo = user.todos.some((todo) => todo.id === paramId);

    if (!todo) return response.status(400).json({ error: 'Not found to do id' });

    user.todos.map((todo) => {
        if (todo.id === paramId) {
            todo.title = title;
            todo.deadline = new Date(deadline);
        }
    });

    return response.status(201).send();
});

app.patch('/todos/:id/done', verifyIfUserExists, (request, response) => {
    const { user } = request;
    const paramId = request.params.id;

    const todo = user.todos.some((todo) => todo.id === paramId);

    if (!todo) return response.status(400).json({ error: 'Not found to do id' });

    user.todos.map((todo) => {
        if (todo.id === paramId) todo.done = true;
    });

    return response.status(201).send();
});

app.delete('/todos/:id', verifyIfUserExists, (request, response) => {
    const { user } = request;
    const paramId = request.params.id;

    const todo = user.todos.some((todo) => todo.id === paramId);

    if (!todo) return response.status(400).json({ error: 'Not found to do id' });

    user.todos.map((todo) => {
        if (todo.id === paramId) user.todos.splice(todo, 1);
    });

    return response.status(204).send();
});

module.exports = app;
