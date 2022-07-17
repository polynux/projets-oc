const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({test: "test"});
});

router.get('/:id', (req, res) => {
    res.status(200).json({test: req.params.id});
});

router.post('/', (req, res) => {
    res.status(200).json({test: "test"});
});

module.exports = router;
