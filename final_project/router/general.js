const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Check if user already exists
    if (users.some((user) => user.name === username)) {
        return res.status(400).json({message: "Username not available"})
    }

    if (!username || !password) {
        return res.status(400).json({message: "Username or password not provided"})
    }

    if (username && password) {
        const user = {
            name: username,
            password: password,
        }
        users.push(user);
        return res.status(201).json({message: `User ${username} successfully created`})
    } 
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    await new Promise((resolve, _) => {
        resolve(res.send(JSON.stringify(books)))
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn = req.params.isbn;
    await new Promise((resolve, _) => {
        if (books[isbn]) {
            resolve(res.send(JSON.stringify(books[isbn])));
        } else {
            resolve(res.status(404).json({message: "Book not found"}))
        }
    })
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author;
    const matchedBooks = {};

    await new Promise((resolve, _) => {
        for (isbn of Object.keys(books)){
            if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                matchedBooks[isbn] = books[isbn];
            }
        }
        resolve(res.send(JSON.stringify(matchedBooks))) 
    })
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title = req.params.title;
    const matchedBooks = {};

    await new Promise((resolve, _) => {
        for (isbn of Object.keys(books)){
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                matchedBooks[isbn] = books[isbn];
            }
        }
        return res.send(JSON.stringify(matchedBooks))
    })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.send(JSON.stringify(books[isbn].reviews));
    } else {
        return res.status(404).json({message: "Book not found"})
    }
});

module.exports.general = public_users;
