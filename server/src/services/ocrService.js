const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const config = require('../config');

class OCRService {
    constructor() {
        this.worker = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.worker = await createWorker({
                logger: m => logger.debug(m),
                langPath: path.join(process.cwd(), 'tessdata'),
            });
            
            // 加载中英文训练数据
            await this.worker.loadLanguage('eng+chi_sim');
            await this.worker.initialize('eng+chi_sim');
            
            // 设置OCR参数
            await this.worker.setParameters({
                tessedit_pageseg_mode: '1',  // 自动页面分割
                preserve_interword_spaces: '1',
                tessjs_create_pdf: '1'
            });

            this.initialized = true;
            logger.info('OCR service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize OCR service:', error);
            throw new Error('OCR service initialization failed');
        }
    }

    async recognizeText(imagePath) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // 验证文件存在
            await fs.access(imagePath);

            // 执行OCR
            const { data: { text, confidence } } = await this.worker.recognize(imagePath);

            // 记录识别结果
            logger.info(`OCR completed with confidence: ${confidence}%`);

            return {
                text,
                confidence,
                success: true
            };
        } catch (error) {
            logger.error('OCR recognition failed:', error);
            return {
                text: '',
                confidence: 0,
                success: false,
                error: error.message
            };
        }
    }

    async recognizeHomework(imagePath) {
        try {
            const result = await this.recognizeText(imagePath);
            if (!result.success) {
                throw new Error('OCR recognition failed');
            }

            // 对作业内容进行预处理
            const processedText = this.preprocessHomeworkText(result.text);

            // 提取题目和答案
            const questions = this.extractQuestions(processedText);

            return {
                success: true,
                questions,
                confidence: result.confidence,
                rawText: result.text
            };
        } catch (error) {
            logger.error('Homework recognition failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    preprocessHomeworkText(text) {
        // 移除多余的空白字符
        text = text.replace(/\s+/g, ' ').trim();
        
        // 标准化标点符号
        text = text.replace(/[，,]/g, '，')
                  .replace(/[。.]/g, '。')
                  .replace(/[？?]/g, '？')
                  .replace(/[！!]/g, '！');

        // 移除可能的噪声字符
        text = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9，。？！：；（）\s]/g, '');

        return text;
    }

    extractQuestions(text) {
        const questions = [];
        
        // 使用正则表达式匹配题目
        const questionPattern = /(\d+[\s\.、]*)([^。？！\d]+[。？！])/g;
        let match;

        while ((match = questionPattern.exec(text)) !== null) {
            questions.push({
                number: match[1].trim(),
                content: match[2].trim(),
                type: this.determineQuestionType(match[2])
            });
        }

        return questions;
    }

    determineQuestionType(questionText) {
        // 基于问题内容判断题目类型
        if (questionText.includes('选择')) return 'multiple_choice';
        if (questionText.includes('判断')) return 'true_false';
        if (questionText.includes('计算')) return 'calculation';
        if (questionText.includes('解释') || questionText.includes('说明')) return 'explanation';
        return 'general';
    }

    async cleanup() {
        if (this.worker) {
            await this.worker.terminate();
            this.initialized = false;
            logger.info('OCR service cleaned up');
        }
    }
}

module.exports = new OCRService();
