const Segment = require('segment');
const segment = new Segment();
segment.useDefault(); // 使用默认的字典和规则

class ChineseAnalysisService {
    constructor() {
        this.segment = segment;
    }

    /**
     * 分析中文作业
     * @param {string} text - 需要分析的文本
     * @returns {Object} - 分析结果
     */
    async analyzeText(text) {
        try {
            const result = {
                spellingErrors: [],
                grammarErrors: [],
                punctuationErrors: [],
                suggestions: []
            };

            // 分词分析
            const words = this.segment.doSegment(text);
            console.log('Segmented words:', words);  // 调试输出

            // 检查标点符号使用
            this.checkPunctuation(text, result);

            // 检查语法结构
            this.checkGrammar(words, text, result);

            // 生成改进建议
            this.generateSuggestions(result);

            return result;
        } catch (error) {
            console.error('Chinese analysis error:', error);
            throw new Error('Chinese analysis failed');
        }
    }

    /**
     * 检查标点符号使用
     * @param {string} text - 原始文本
     * @param {Object} result - 结果对象
     */
    checkPunctuation(text, result) {
        // 检查常见标点符号错误
        const punctuationRules = [
            {
                pattern: /[，。！？；：、]/g,
                check: (match, index) => {
                    // 检查前后是否有空格
                    if (text[index - 1] === ' ' || text[index + 1] === ' ') {
                        result.punctuationErrors.push({
                            type: 'spacing',
                            position: index,
                            message: '中文标点符号前后不需要空格'
                        });
                    }
                }
            },
            {
                pattern: /([。！？])[。！？]/g,
                message: '不应重复使用句末标点符号'
            }
        ];

        punctuationRules.forEach(rule => {
            let match;
            while ((match = rule.pattern.exec(text)) !== null) {
                if (rule.check) {
                    rule.check(match[0], match.index);
                } else {
                    result.punctuationErrors.push({
                        type: 'redundant',
                        position: match.index,
                        message: rule.message
                    });
                }
            }
        });
    }

    /**
     * 检查语法结构
     * @param {Array} words - 分词结果
     * @param {string} text - 原始文本
     * @param {Object} result - 结果对象
     */
    checkGrammar(words, text, result) {
        // 检查重复词
        for (let i = 0; i < words.length - 1; i++) {
            const currentWord = words[i];
            const nextWord = words[i + 1];
            
            // 检查相邻词是否完全相同
            if (currentWord.w === nextWord.w && 
                !['的', '地', '得', '着', '了', '过'].includes(currentWord.w)) {
                result.grammarErrors.push({
                    type: 'repetition',
                    word: currentWord.w,
                    position: this.getPositionInText(text, currentWord.w, i),
                    message: `词语"${currentWord.w}"重复使用`
                });
            }
        }

        // 检查"的地得"的用法
        for (let i = 0; i < words.length - 1; i++) {
            const currentWord = words[i];
            const nextWord = words[i + 1];

            if (['的', '地', '得'].includes(currentWord.w)) {
                const position = this.getPositionInText(text, currentWord.w, i);
                
                if (currentWord.w === '的') {
                    // "的"主要用于名词性修饰
                    if (['v', 'vd', 'vn', 'a', 'ad'].includes(nextWord.p)) {
                        result.grammarErrors.push({
                            type: 'usage',
                            word: currentWord.w,
                            position: position,
                            message: '在此处可能应该用"地"或"得"'
                        });
                    }
                } else if (currentWord.w === '地') {
                    // "地"主要用于状语
                    if (!['v', 'vd', 'vn', 'a', 'ad'].includes(nextWord.p)) {
                        result.grammarErrors.push({
                            type: 'usage',
                            word: currentWord.w,
                            position: position,
                            message: '在此处可能应该用"的"或"得"'
                        });
                    }
                } else if (currentWord.w === '得') {
                    // "得"主要用于补语
                    if (i > 0) {
                        const prevWord = words[i - 1];
                        if (!['v', 'vd', 'vn', 'a', 'ad'].includes(prevWord.p)) {
                            result.grammarErrors.push({
                                type: 'usage',
                                word: currentWord.w,
                                position: position,
                                message: '在此处可能应该用"的"或"地"'
                            });
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取词语在原文中的位置
     * @param {string} text - 原始文本
     * @param {string} word - 要查找的词
     * @param {number} occurrence - 第几次出现
     * @returns {number} - 位置
     */
    getPositionInText(text, word, occurrence) {
        let position = -1;
        let count = 0;
        let pos = text.indexOf(word);
        
        while (pos !== -1 && count < occurrence) {
            pos = text.indexOf(word, pos + 1);
            count++;
        }
        
        return pos === -1 ? text.lastIndexOf(word) : pos;
    }

    /**
     * 生成改进建议
     * @param {Object} result - 分析结果
     */
    generateSuggestions(result) {
        // 根据错误类型生成具体建议
        if (result.punctuationErrors.length > 0) {
            result.suggestions.push({
                type: 'punctuation',
                message: '注意标点符号的正确使用，避免不必要的空格和重复标点'
            });
        }

        if (result.grammarErrors.length > 0) {
            const deErrors = result.grammarErrors.some(e => e.type === 'usage');
            const repetitionErrors = result.grammarErrors.some(e => e.type === 'repetition');

            if (deErrors) {
                result.suggestions.push({
                    type: 'grammar',
                    message: '注意"的、地、得"的用法：\n- "的"用于名词性修饰\n- "地"用于状语修饰\n- "得"用于补语修饰'
                });
            }

            if (repetitionErrors) {
                result.suggestions.push({
                    type: 'grammar',
                    message: '注意避免不必要的词语重复'
                });
            }
        }

        // 添加一般性的写作建议
        result.suggestions.push({
            type: 'general',
            message: '建议多读多写，积累词汇量，提高语言表达能力'
        });
    }
}

module.exports = new ChineseAnalysisService();
