const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    res.status(200).json({test: "test"});
});

router.post('/signup', (req, res) => {
    res.status(200).json({test: "test"});
});

module.exports = router;
