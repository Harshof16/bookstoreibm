const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Mock database
let books = [
    { isbn: '12345', title: 'Book One', author: 'Author A', reviews: [] },
    { isbn: '67890', title: 'Book Two', author: 'Author B', reviews: [] },
];
let users = [];

// JWT secret key
const SECRET_KEY = 'your_secret_key';

// Middleware to authenticate users
function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied');
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
}

// Task 1: Get the book list available in the shop
app.get('/books', (req, res) => {
    res.json(books);
});

// Task 2: Get the books by ISBN
app.get('/books/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        res.json(book);
    } else {
        res.status(404).send('Book not found');
    }
});

// Task 3: Get books by Author
app.get('/books/author/:name', (req, res) => {
    const filteredBooks = books.filter(b => b.author.toLowerCase() === req.params.name.toLowerCase());
    res.json(filteredBooks);
});

// Task 4: Get books based on Title
app.get('/books/title/:title', (req, res) => {
    const filteredBooks = books.filter(b => b.title.toLowerCase().includes(req.params.title.toLowerCase()));
    res.json(filteredBooks);
});

// Task 5: Get book reviews
app.get('/books/:isbn/reviews', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        res.json(book.reviews);
    } else {
        res.status(404).send('Book not found');
    }
});

// Task 6: Register new user
app.post('/users/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    if (users.find(u => u.username === username)) {
        return res.status(400).send('User already exists');
    }
    users.push({ username, password });
    res.send('User registered successfully');
});

// Task 7: Login as a registered user
app.post('/users/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Task 8: Add/Modify a book review
app.post('/books/:isbn/reviews', authenticate, (req, res) => {
    const { review } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) return res.status(404).send('Book not found');
    book.reviews.push({ username: req.user.username, review });
    res.send('Review added');
});

// Task 9: Delete book review
app.delete('/books/:isbn/reviews/:reviewId', authenticate, (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) {
        return res.status(404).send('Book not found');
    }
    const reviewIndex = book.reviews.findIndex(
        (r, index) => r.username === req.user.username && index == req.params.reviewId
    );
    if (reviewIndex === -1) {
        return res.status(404).send('Review not found');
    }
    book.reviews.splice(reviewIndex, 1);
    res.send('Review deleted');
});

// Task 10: Get all books (Async Callback)
function getAllBooks(callback) {
    setTimeout(() => {
        callback(books);
    }, 1000);
}

// Task 11: Search by ISBN (Promises)
function searchByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const book = books.find(b => b.isbn === isbn);
        if (book) {
            resolve(book);
        } else {
            reject('Book not found');
        }
    });
}

// Task 12: Search by Author (Promises)
function searchByAuthor(author) {
    return new Promise((resolve) => {
        const filteredBooks = books.filter(b => b.author.toLowerCase() === author.toLowerCase());
        resolve(filteredBooks);
    });
}

// Task 13: Search by Title (Promises)
function searchByTitle(title) {
    return new Promise((resolve) => {
        const filteredBooks = books.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
        resolve(filteredBooks);
    });
}

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
