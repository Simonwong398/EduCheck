const logger = require('../utils/logger');
const chineseAnalysis = require('./chineseAnalysis');
const mathAnalysis = require('./mathAnalysis');
const englishAnalysis = require('./englishAnalysis');

class HomeworkAnalysisService {
    constructor() {
        this.analyzers = {
            chinese: chineseAnalysis,
            math: mathAnalysis,
            english: englishAnalysis
        };
    }

    async analyzeHomework(homeworkData) {
        const { subject, questions, rawText } = homeworkData;
        
        try {
            logger.info(`Starting homework analysis for subject: ${subject}`);

            // 选择合适的分析器
            const analyzer = this.getAnalyzer(subject);
            if (!analyzer) {
                throw new Error(`No analyzer available for subject: ${subject}`);
            }

            // 分析每个题目
            const analysisResults = await Promise.all(
                questions.map(async (question) => {
                    try {
                        const result = await this.analyzeQuestion(analyzer, question, subject);
                        return {
                            ...result,
                            questionNumber: question.number
                        };
                    } catch (error) {
                        logger.error(`Error analyzing question ${question.number}:`, error);
                        return {
                            questionNumber: question.number,
                            error: error.message,
                            success: false
                        };
                    }
                })
            );

            // 生成整体分析报告
            const report = this.generateReport(analysisResults, subject);

            return {
                success: true,
                results: analysisResults,
                report,
                metadata: {
                    subject,
                    totalQuestions: questions.length,
                    analyzedQuestions: analysisResults.length,
                    timestamp: new Date()
                }
            };

        } catch (error) {
            logger.error('Homework analysis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeQuestion(analyzer, question, subject) {
        const { content, type } = question;

        // 根据题目类型选择分析方法
        switch (type) {
            case 'multiple_choice':
                return await analyzer.analyzeMultipleChoice(content);
            case 'true_false':
                return await analyzer.analyzeTrueFalse(content);
            case 'calculation':
                return await analyzer.analyzeCalculation(content);
            case 'explanation':
                return await analyzer.analyzeExplanation(content);
            default:
                return await analyzer.analyzeText(content);
        }
    }

    getAnalyzer(subject) {
        const normalizedSubject = subject.toLowerCase();
        return this.analyzers[normalizedSubject] || null;
    }

    generateReport(results, subject) {
        // 统计分析结果
        const stats = {
            totalQuestions: results.length,
            successfulAnalyses: results.filter(r => r.success).length,
            errorTypes: {},
            commonMistakes: []
        };

        // 收集错误类型和常见错误
        results.forEach(result => {
            if (result.errors) {
                result.errors.forEach(error => {
                    stats.errorTypes[error.type] = (stats.errorTypes[error.type] || 0) + 1;
                });
            }
        });

        // 生成改进建议
        const suggestions = this.generateSuggestions(stats, subject);

        return {
            statistics: stats,
            suggestions,
            summary: this.generateSummary(stats, subject)
        };
    }

    generateSuggestions(stats, subject) {
        const suggestions = [];

        // 基于错误类型生成建议
        Object.entries(stats.errorTypes).forEach(([type, count]) => {
            if (count > stats.totalQuestions * 0.3) { // 如果某类错误出现频率超过30%
                suggestions.push(this.getSuggestionForErrorType(type, subject));
            }
        });

        // 添加通用建议
        suggestions.push(this.getGeneralSuggestion(subject));

        return suggestions;
    }

    getSuggestionForErrorType(errorType, subject) {
        // 根据错误类型和学科返回具体建议
        const suggestionMap = {
            chinese: {
                grammar: '建议多做语法练习，特别注意"的地得"的用法',
                punctuation: '注意标点符号的正确使用，可以通过多读多写来提高',
                spelling: '建议多查字典，巩固生字的写法'
            },
            math: {
                calculation: '建议多做计算练习，注意运算法则',
                concept: '需要加强数学概念的理解，可以通过例题学习'
            },
            english: {
                grammar: '建议系统复习英语语法规则',
                vocabulary: '需要扩大词汇量，建议每天背诵新单词',
                spelling: '多做单词拼写练习，注意常见拼写规则'
            }
        };

        return suggestionMap[subject]?.[errorType] || '建议针对性练习，提高相关能力';
    }

    getGeneralSuggestion(subject) {
        const generalSuggestions = {
            chinese: '建议多读优秀文章，培养语感，提高写作能力',
            math: '建议多做习题，培养逻辑思维能力',
            english: '建议多听多说，创造英语环境，提高综合能力'
        };

        return generalSuggestions[subject] || '建议持续练习，巩固所学知识';
    }

    generateSummary(stats, subject) {
        const successRate = (stats.successfulAnalyses / stats.totalQuestions * 100).toFixed(1);
        
        return `本次${subject}作业分析完成，共计${stats.totalQuestions}道题目，` +
               `成功分析${stats.successfulAnalyses}题，分析成功率${successRate}%。` +
               `请参考具体分析结果和建议进行针对性练习。`;
    }
}

module.exports = new HomeworkAnalysisService();
