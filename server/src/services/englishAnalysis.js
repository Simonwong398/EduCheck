const natural = require('natural');
const logger = require('../utils/logger');

class EnglishAnalysisService {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.tagger = new natural.BrillPOSTagger();
        this.spellcheck = new natural.Spellcheck();
        
        // 初始化语法规则
        this.grammarPatterns = [
            {
                // 主谓一致
                pattern: /(I|He|She|It)\s+(are|were|have been)/gi,
                message: 'Subject-verb agreement error',
                type: 'agreement'
            },
            {
                // 冠词使用
                pattern: /\b(a)\s+[aeiou]/gi,
                message: 'Article usage error: use "an" before vowel sounds',
                type: 'article'
            },
            {
                // 时态一致性
                pattern: /\b(yesterday|last week|last year)\s+([a-z]+s|is|are)\b/gi,
                message: 'Tense consistency error: use past tense for past events',
                type: 'tense'
            },
            {
                // 介词使用
                pattern: /\b(arrive|reach)\s+to\b/gi,
                message: 'Preposition error',
                type: 'preposition'
            },
            {
                // 情态动词后接原形
                pattern: /\b(must|should|would|could|might|may|can|will)\s+([a-z]+ed|[a-z]+s)\b/gi,
                message: 'Modal verb error: use base form after modal verbs',
                type: 'modal'
            }
        ];
    }

    async analyzeText(text) {
        try {
            // 分词和句子分割
            const sentences = text.split(/[.!?]+/).filter(s => s.trim());
            const words = this.tokenizer.tokenize(text);

            // 进行各项分析
            const spellingErrors = await this.checkSpelling(words);
            const grammarErrors = await this.checkGrammar(sentences);
            const structureErrors = await this.checkStructure(sentences);
            const vocabularyAnalysis = await this.analyzeVocabulary(words);

            // 合并所有错误
            const errors = [
                ...spellingErrors,
                ...grammarErrors,
                ...structureErrors
            ];

            // 生成报告
            return this.generateReport(errors, vocabularyAnalysis);
        } catch (error) {
            logger.error('English analysis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeMultipleChoice(text) {
        return this.analyzeText(text);
    }

    async analyzeExplanation(text) {
        return this.analyzeText(text);
    }

    async checkSpelling(words) {
        const errors = [];
        const dictionary = new Set([
            // 基础词典
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            // 添加更多常用词...
        ]);

        for (const word of words) {
            const lowercaseWord = word.toLowerCase();
            if (!dictionary.has(lowercaseWord)) {
                const suggestions = await this.findSimilarWords(lowercaseWord, Array.from(dictionary));
                if (suggestions.length > 0) {
                    errors.push({
                        type: 'spelling',
                        text: word,
                        suggestions,
                        message: `Possible spelling error in "${word}". Did you mean: ${suggestions.join(', ')}?`
                    });
                }
            }
        }

        return errors;
    }

    async checkGrammar(sentences) {
        const errors = [];

        for (const sentence of sentences) {
            // 检查语法规则
            this.grammarPatterns.forEach(({ pattern, message, type }) => {
                let match;
                while ((match = pattern.exec(sentence)) !== null) {
                    errors.push({
                        type: 'grammar',
                        subType: type,
                        text: match[0],
                        message
                    });
                }
            });

            // 词性分析
            const words = this.tokenizer.tokenize(sentence);
            const tags = this.tagger.tag(words);
            
            // 检查词性搭配
            for (let i = 0; i < tags.length - 1; i++) {
                const [word, tag] = tags[i];
                const [nextWord, nextTag] = tags[i + 1];

                // 检查形容词和名词的搭配
                if (tag === 'JJ' && !['NN', 'NNS', 'NNP', 'NNPS'].includes(nextTag)) {
                    errors.push({
                        type: 'grammar',
                        subType: 'collocation',
                        text: `${word} ${nextWord}`,
                        message: 'Incorrect adjective placement'
                    });
                }
            }
        }

        return errors;
    }

    async checkStructure(sentences) {
        const errors = [];

        for (const sentence of sentences) {
            const words = this.tokenizer.tokenize(sentence);
            const tags = this.tagger.tag(words);

            // 检查基本句子成分
            const hasSubject = tags.some(([_, tag]) => tag.startsWith('NN') || tag === 'PRP');
            const hasVerb = tags.some(([_, tag]) => tag.startsWith('VB'));
            const hasObject = tags.some(([_, tag]) => 
                tag.startsWith('NN') || tag === 'PRP' || tag.startsWith('DT'));

            if (!hasSubject || !hasVerb) {
                errors.push({
                    type: 'structure',
                    text: sentence,
                    message: 'Incomplete sentence structure: missing subject or verb'
                });
            }

            // 检查句子长度
            if (words.length > 30) {
                errors.push({
                    type: 'structure',
                    text: sentence,
                    message: 'Very long sentence: consider breaking it into smaller ones'
                });
            }
        }

        return errors;
    }

    async analyzeVocabulary(words) {
        const vocabulary = {
            total: words.length,
            unique: new Set(words.map(w => w.toLowerCase())).size,
            complexity: 0,
            distribution: {}
        };

        // 分析词汇分布
        const tags = this.tagger.tag(words);
        tags.forEach(([word, tag]) => {
            vocabulary.distribution[tag] = (vocabulary.distribution[tag] || 0) + 1;
        });

        // 计算词汇复杂度
        vocabulary.complexity = this.calculateVocabularyComplexity(words);

        return vocabulary;
    }

    calculateVocabularyComplexity(words) {
        // 基于词长和词频计算复杂度
        const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        const uniqueRatio = new Set(words.map(w => w.toLowerCase())).size / words.length;
        
        return (avgLength * 0.5 + uniqueRatio * 0.5).toFixed(2);
    }

    async findSimilarWords(word, dictionary) {
        return dictionary
            .filter(dictWord => {
                const distance = natural.LevenshteinDistance(word, dictWord);
                return distance <= 2;
            })
            .sort((a, b) => {
                const distA = natural.LevenshteinDistance(word, a);
                const distB = natural.LevenshteinDistance(word, b);
                return distA - distB;
            })
            .slice(0, 3);
    }

    generateReport(errors, vocabulary) {
        // 统计错误类型
        const errorStats = {
            total: errors.length,
            byType: {}
        };

        errors.forEach(error => {
            errorStats.byType[error.type] = (errorStats.byType[error.type] || 0) + 1;
        });

        // 生成建议
        const suggestions = this.generateSuggestions(errorStats, vocabulary);

        return {
            success: true,
            errors,
            statistics: {
                errors: errorStats,
                vocabulary
            },
            suggestions,
            summary: this.generateSummary(errorStats, vocabulary)
        };
    }

    generateSuggestions(errorStats, vocabulary) {
        const suggestions = [];

        // 基于错误类型的建议
        Object.entries(errorStats.byType).forEach(([type, count]) => {
            if (count > 0) {
                suggestions.push(this.getSuggestionForErrorType(type, count));
            }
        });

        // 基于词汇分析的建议
        if (vocabulary.complexity < 0.3) {
            suggestions.push({
                type: 'vocabulary',
                message: 'Try to use more varied and advanced vocabulary'
            });
        }

        // 添加通用建议
        suggestions.push({
            type: 'general',
            message: 'Regular reading and writing practice will help improve overall English skills'
        });

        return suggestions;
    }

    getSuggestionForErrorType(type, count) {
        const suggestionMap = {
            spelling: {
                message: 'Focus on improving spelling accuracy',
                practice: 'Use a dictionary and practice writing commonly misspelled words'
            },
            grammar: {
                message: 'Review basic grammar rules',
                practice: 'Study grammar patterns and do grammar exercises'
            },
            structure: {
                message: 'Work on sentence structure',
                practice: 'Practice writing clear, complete sentences'
            }
        };

        return {
            type,
            count,
            ...suggestionMap[type]
        };
    }

    generateSummary(errorStats, vocabulary) {
        const errorRate = (errorStats.total / vocabulary.total * 100).toFixed(1);
        
        return `Analysis completed with ${errorStats.total} errors found (${errorRate}% error rate). ` +
               `Vocabulary complexity score: ${vocabulary.complexity}. ` +
               `Used ${vocabulary.unique} unique words out of ${vocabulary.total} total words.`;
    }
}

module.exports = new EnglishAnalysisService();
