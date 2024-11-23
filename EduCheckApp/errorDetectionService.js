const { detect_grammar_errors } = require('./grammarService');
const { detect_math_errors } = require('./mathService');
const { detect_chemistry_errors } = require('./chemistryService');
const { detect_physics_errors } = require('./physicsService');

function detect_errors(subject, grade, content) {
    switch (subject) {
        case 'grammar':
            return detect_grammar_errors(content, grade);
        case 'math':
            return detect_math_errors(content, grade);
        case 'chemistry':
            return detect_chemistry_errors(content, grade);
        case 'physics':
            return detect_physics_errors(content, grade);
        default:
            return ['Unknown subject'];
    }
}

module.exports = { detect_errors };
