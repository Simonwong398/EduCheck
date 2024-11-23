const express = require('express');
const router = express.Router();
const { detect_errors } = require('./errorDetectionService');
const Student = require('../models/Student');

router.post('/submit', async (req, res) => {
    const { name, grade, subject } = req.body;
    const parentId = req.user.id;

    const newStudent = new Student({ name, grade, subject, parentId });
    await newStudent.save();

    res.status(201).send('Student record created');
});

router.post('/check-errors', (req, res) => {
    const { subject, grade, content } = req.body;
    const errors = detect_errors(subject, grade, content);

    res.status(200).send({ errors });
});

module.exports = router;
