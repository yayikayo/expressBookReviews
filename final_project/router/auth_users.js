const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
    if(users.some((user) => user.name === username && user.password === password)){
        return true;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const book = books[req.params.isbn];
    const review = req.body.review;

    if (!username) {
        return res.status(404).json({message : "Username not found"})
    }
    
    if (!review) {
        return res.status(400).json({message : "No review provided"})
    }

    if (!book) {
        return res.status(404).json({message : "Book not found"})
    }

    book.reviews[username] = review;
    return res.status(201).json({message : "Review successfully added"})    
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const book = books[req.params.isbn];

    if (!username) {
        return res.status(404).json({message : "Username not found"})
    }
    
    if (!book) {
        return res.status(404).json({message : "Book not found"})
    }

    if (!book.reviews[username]) {
        return res.status(404).json({message : `${username} has no reviews for book ${book.title}`})
    }

    delete book.reviews[username];
    return res.status(200).json({message : "Review successfully deleted"})  
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
