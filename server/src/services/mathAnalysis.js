const { evaluate, simplify, derivative, parse } = require('mathjs');
const logger = require('../utils/logger');

class MathAnalysisService {
    constructor() {
        this.errorPatterns = [
            {
                pattern: /(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/g,
                check: (match) => {
                    const [full, a, b, result] = match;
                    return parseInt(a) + parseInt(b) === parseInt(result);
                },
                message: '加法计算错误',
                type: 'addition'
            },
            {
                pattern: /(\d+)\s*\-\s*(\d+)\s*=\s*(\d+)/g,
                check: (match) => {
                    const [full, a, b, result] = match;
                    return parseInt(a) - parseInt(b) === parseInt(result);
                },
                message: '减法计算错误',
                type: 'subtraction'
            },
            {
                pattern: /(\d+)\s*×\s*(\d+)\s*=\s*(\d+)/g,
                check: (match) => {
                    const [full, a, b, result] = match;
                    return parseInt(a) * parseInt(b) === parseInt(result);
                },
                message: '乘法计算错误',
                type: 'multiplication'
            },
            {
                pattern: /(\d+)\s*÷\s*(\d+)\s*=\s*(\d+)/g,
                check: (match) => {
                    const [full, a, b, result] = match;
                    return Math.abs(parseInt(a) / parseInt(b) - parseInt(result)) < 0.0001;
                },
                message: '除法计算错误',
                type: 'division'
            }
        ];
    }

    async analyzeText(text) {
        try {
            // 提取数学表达式
            const expressions = this.extractMathExpressions(text);
            
            // 分析每个表达式
            const results = await Promise.all(expressions.map(async expr => {
                const validation = await this.validateMathSolution(expr);
                const conceptErrors = this.detectConceptErrors(expr.question);
                
                return {
                    ...validation,
                    conceptErrors,
                    expression: expr.question
                };
            }));

            // 生成分析报告
            return this.generateAnalysisReport(results);
        } catch (error) {
            logger.error('Math analysis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeMultipleChoice(text) {
        return this.analyzeText(text);
    }

    async analyzeCalculation(text) {
        return this.analyzeText(text);
    }

    extractMathExpressions(text) {
        const expressions = [];
        
        // 匹配基本数学表达式
        const basicExprRegex = /([0-9x+\-*/()= ]+)/g;
        const matches = text.match(basicExprRegex);

        if (matches) {
            matches.forEach(match => {
                const parts = match.split('=').map(part => part.trim());
                if (parts.length === 2) {
                    expressions.push({
                        question: match.trim(),
                        leftSide: parts[0],
                        rightSide: parts[1]
                    });
                }
            });
        }

        // 匹配代数表达式
        const algebraicExprRegex = /([a-z0-9+\-*/()= ]+)/gi;
        const algebraicMatches = text.match(algebraicExprRegex);

        if (algebraicMatches) {
            algebraicMatches.forEach(match => {
                if (!expressions.some(e => e.question === match.trim())) {
                    const parts = match.split('=').map(part => part.trim());
                    if (parts.length === 2) {
                        expressions.push({
                            question: match.trim(),
                            leftSide: parts[0],
                            rightSide: parts[1],
                            isAlgebraic: true
                        });
                    }
                }
            });
        }

        return expressions;
    }

    async validateMathSolution(expr) {
        try {
            if (expr.isAlgebraic) {
                return this.validateAlgebraicSolution(expr);
            }

            // 计算表达式两边的值
            const leftResult = evaluate(expr.leftSide);
            const rightResult = evaluate(expr.rightSide);
            
            // 比较结果（考虑浮点数精度）
            const isCorrect = Math.abs(leftResult - rightResult) < 0.0001;
            
            return {
                success: true,
                isCorrect,
                correctAnswer: isCorrect ? expr.rightSide : leftResult.toString(),
                explanation: isCorrect ? 
                    '计算正确' : 
                    `计算错误：${expr.leftSide} = ${leftResult}，而不是 ${expr.rightSide}`
            };
        } catch (error) {
            logger.error('Math solution validation failed:', error);
            return {
                success: false,
                isCorrect: false,
                correctAnswer: '无法验证',
                explanation: '表达式格式错误或无法计算'
            };
        }
    }

    validateAlgebraicSolution(expr) {
        try {
            // 尝试化简两边的表达式
            const leftSimplified = simplify(expr.leftSide).toString();
            const rightSimplified = simplify(expr.rightSide).toString();
            
            // 检查是否相等
            const isCorrect = leftSimplified === rightSimplified;
            
            return {
                success: true,
                isCorrect,
                correctAnswer: isCorrect ? expr.rightSide : leftSimplified,
                explanation: isCorrect ? 
                    '代数式正确' : 
                    `代数式错误：${expr.leftSide} 化简后为 ${leftSimplified}，而不是 ${expr.rightSide}`
            };
        } catch (error) {
            logger.error('Algebraic solution validation failed:', error);
            return {
                success: false,
                isCorrect: false,
                correctAnswer: '无法验证',
                explanation: '代数式格式错误或无法计算'
            };
        }
    }

    detectConceptErrors(text) {
        const conceptErrors = [];
        
        // 检查每种错误模式
        this.errorPatterns.forEach(({ pattern, check, message, type }) => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (!check(match)) {
                    conceptErrors.push({
                        type,
                        expression: match[0],
                        message
                    });
                }
            }
        });

        return conceptErrors;
    }

    generateAnalysisReport(results) {
        // 统计错误类型
        const errorStats = {
            total: results.length,
            correct: results.filter(r => r.isCorrect).length,
            errorTypes: {}
        };

        // 收集错误类型统计
        results.forEach(result => {
            if (!result.isCorrect) {
                result.conceptErrors.forEach(error => {
                    errorStats.errorTypes[error.type] = (errorStats.errorTypes[error.type] || 0) + 1;
                });
            }
        });

        // 生成建议
        const suggestions = this.generateSuggestions(errorStats);

        return {
            success: true,
            results,
            statistics: errorStats,
            suggestions
        };
    }

    generateSuggestions(stats) {
        const suggestions = [];

        // 基于错误类型生成具体建议
        Object.entries(stats.errorTypes).forEach(([type, count]) => {
            if (count > 0) {
                suggestions.push(this.getSuggestionForErrorType(type, count, stats.total));
            }
        });

        // 添加通用建议
        if (stats.correct < stats.total) {
            suggestions.push({
                type: 'general',
                message: '建议多做练习，巩固基础计算能力'
            });
        }

        return suggestions;
    }

    getSuggestionForErrorType(type, count, total) {
        const percentage = ((count / total) * 100).toFixed(1);
        const suggestionMap = {
            addition: {
                message: '需要加强加法运算练习，注意进位',
                exercises: '建议做一些基础的加法练习题'
            },
            subtraction: {
                message: '需要加强减法运算练习，注意借位',
                exercises: '建议做一些基础的减法练习题'
            },
            multiplication: {
                message: '需要加强乘法运算练习，可以复习乘法口诀表',
                exercises: '建议做一些乘法基础练习'
            },
            division: {
                message: '需要加强除法运算练习，注意除法的基本步骤',
                exercises: '建议做一些基础的除法练习题'
            }
        };

        return {
            type,
            percentage: `${percentage}%`,
            ...suggestionMap[type]
        };
    }
}

module.exports = new MathAnalysisService();
