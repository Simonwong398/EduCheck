const vision = require('@google-cloud/vision');
const { extractMathExpressions, validateMathSolution } = require('./mathAnalysis');
const { analyzeChineseText, checkGrammarAndPunctuation } = require('./chineseAnalysis');
const { analyzeEnglishText, checkEnglishGrammar } = require('./englishAnalysis');

// 创建Google Cloud Vision客户端
const client = new vision.ImageAnnotatorClient();

/**
 * 分析作业图片
 * @param {string} imageUrl - 作业图片URL
 * @param {string} subject - 科目
 * @returns {Promise<Object>} - 返回分析结果
 */
const analyzeHomework = async (imageUrl, subject) => {
  try {
    // 调用Google Cloud Vision API进行文本识别
    const [result] = await client.textDetection(imageUrl);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error('无法识别图片中的文字');
    }

    // 提取文本内容
    const text = detections[0].description;
    console.log('识别到的文本:', text);

    // 根据科目进行不同的分析逻辑
    let analysis;
    switch (subject.toLowerCase()) {
      case '数学':
        analysis = await analyzeMathHomework(text);
        break;
      case '语文':
        analysis = await analyzeChineseHomework(text);
        break;
      case '英语':
        analysis = await analyzeEnglishHomework(text);
        break;
      default:
        analysis = await analyzeGeneralHomework(text);
    }

    return analysis;
  } catch (error) {
    console.error('作业分析失败:', error);
    throw new Error('作业分析失败: ' + error.message);
  }
};

/**
 * 分析数学作业
 * @param {string} text - 识别出的文本
 * @returns {Object} - 分析结果
 */
const analyzeMathHomework = async (text) => {
  try {
    // 提取数学表达式和答案
    const expressions = extractMathExpressions(text);
    let totalQuestions = expressions.length;
    let correctCount = 0;
    const mistakes = [];

    // 分析每个表达式
    for (const expr of expressions) {
      const { isCorrect, correctAnswer, explanation } = await validateMathSolution(expr);
      if (!isCorrect) {
        mistakes.push({
          question: expr.question,
          correct: correctAnswer,
          explanation: explanation
        });
      } else {
        correctCount++;
      }
    }

    // 计算正确率
    const correctRate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // 生成建议
    const suggestions = generateMathSuggestions(mistakes);

    return {
      correctRate,
      mistakes,
      suggestions
    };
  } catch (error) {
    console.error('数学作业分析失败:', error);
    throw error;
  }
};

/**
 * 分析语文作业
 * @param {string} text - 识别出的文本
 * @returns {Object} - 分析结果
 */
const analyzeChineseHomework = async (text) => {
  try {
    // 分析文本内容
    const { errors, suggestions } = await analyzeChineseText(text);
    
    // 检查语法和标点
    const { grammarErrors, punctuationErrors } = await checkGrammarAndPunctuation(text);
    
    // 合并所有错误
    const mistakes = [
      ...errors.map(e => ({
        question: e.text,
        correct: e.correction,
        explanation: e.explanation
      })),
      ...grammarErrors.map(e => ({
        question: e.text,
        correct: e.correction,
        explanation: '语法错误：' + e.explanation
      })),
      ...punctuationErrors.map(e => ({
        question: e.text,
        correct: e.correction,
        explanation: '标点错误：' + e.explanation
      }))
    ];

    // 计算正确率
    const totalIssues = mistakes.length;
    const textLength = text.length;
    const correctRate = Math.round(((textLength - totalIssues) / textLength) * 100);

    return {
      correctRate,
      mistakes,
      suggestions
    };
  } catch (error) {
    console.error('语文作业分析失败:', error);
    throw error;
  }
};

/**
 * 分析英语作业
 * @param {string} text - 识别出的文本
 * @returns {Object} - 分析结果
 */
const analyzeEnglishHomework = async (text) => {
  try {
    // 分析英语文本
    const { errors, suggestions } = await analyzeEnglishText(text);
    
    // 检查语法
    const grammarErrors = await checkEnglishGrammar(text);
    
    // 合并所有错误
    const mistakes = [
      ...errors.map(e => ({
        question: e.text,
        correct: e.correction,
        explanation: e.explanation
      })),
      ...grammarErrors.map(e => ({
        question: e.text,
        correct: e.correction,
        explanation: '语法错误：' + e.explanation
      }))
    ];

    // 计算正确率
    const totalIssues = mistakes.length;
    const totalSentences = text.split(/[.!?]+/).length;
    const correctRate = Math.round(((totalSentences - totalIssues) / totalSentences) * 100);

    return {
      correctRate,
      mistakes,
      suggestions
    };
  } catch (error) {
    console.error('英语作业分析失败:', error);
    throw error;
  }
};

/**
 * 分析通用作业
 * @param {string} text - 识别出的文本
 * @returns {Object} - 分析结果
 */
const analyzeGeneralHomework = async (text) => {
  try {
    // 基本文本分析
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim());
    const totalSentences = sentences.length;
    
    // 查找明显的错误（如重复词、不完整句子等）
    const mistakes = [];
    let errorCount = 0;

    for (const sentence of sentences) {
      // 检查重复词
      const words = sentence.split(/\s+/);
      const duplicates = findDuplicateWords(words);
      if (duplicates.length > 0) {
        mistakes.push({
          question: sentence,
          correct: removeDuplicateWords(sentence),
          explanation: `存在重复词：${duplicates.join(', ')}`
        });
        errorCount++;
      }

      // 检查句子完整性
      if (!checkSentenceCompleteness(sentence)) {
        mistakes.push({
          question: sentence,
          correct: '需要完善句子结构',
          explanation: '句子结构不完整'
        });
        errorCount++;
      }
    }

    // 计算正确率
    const correctRate = Math.round(((totalSentences - errorCount) / totalSentences) * 100);

    // 生成建议
    const suggestions = [
      '注意检查文字的准确性和完整性',
      '保持清晰的书写习惯',
      '合理使用标点符号'
    ];

    return {
      correctRate,
      mistakes,
      suggestions
    };
  } catch (error) {
    console.error('通用作业分析失败:', error);
    throw error;
  }
};

// 辅助函数
const findDuplicateWords = (words) => {
  const duplicates = new Set();
  const seen = new Set();
  
  for (const word of words) {
    if (seen.has(word)) {
      duplicates.add(word);
    }
    seen.add(word);
  }
  
  return Array.from(duplicates);
};

const removeDuplicateWords = (sentence) => {
  const words = sentence.split(/\s+/);
  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.join(' ');
};

const checkSentenceCompleteness = (sentence) => {
  // 简单的句子完整性检查
  const trimmed = sentence.trim();
  return trimmed.length > 0 && /[.!?。！？]$/.test(trimmed);
};

const generateMathSuggestions = (mistakes) => {
  const suggestions = new Set();
  
  // 基于错误类型生成建议
  mistakes.forEach(mistake => {
    if (mistake.explanation.includes('计算错误')) {
      suggestions.add('仔细检查计算步骤，注意运算符号');
    }
    if (mistake.explanation.includes('概念错误')) {
      suggestions.add('复习相关数学概念和公式');
    }
    if (mistake.explanation.includes('步骤缺失')) {
      suggestions.add('完整展示解题步骤，方便检查错误');
    }
  });

  // 添加一些通用建议
  suggestions.add('做题时注意检查计算过程');
  suggestions.add('可以使用估算来验证答案的合理性');
  
  return Array.from(suggestions);
};

module.exports = {
  analyzeHomework
};
