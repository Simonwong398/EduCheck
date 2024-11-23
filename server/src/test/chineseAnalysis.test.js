const chineseAnalysis = require('../services/chineseAnalysis');

describe('Chinese Analysis Service', () => {
    test('should analyze text with punctuation errors', async () => {
        const text = '这是一段， 带有标点错误的文本。。';
        const result = await chineseAnalysis.analyzeText(text);
        
        expect(result.punctuationErrors.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.type === 'punctuation')).toBe(true);
    });

    test('should analyze text with grammar errors', async () => {
        const text = '他快速的跑着，开心的玩耍。';  // 应该是"地"而不是"的"
        const result = await chineseAnalysis.analyzeText(text);
        console.log('Grammar test result:', result);  // 调试输出
        
        expect(result.grammarErrors.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.type === 'grammar')).toBe(true);
    });

    test('should analyze text with repeated words', async () => {
        const text = '他很很开心地玩耍。';
        const result = await chineseAnalysis.analyzeText(text);
        console.log('Repetition test result:', result);  // 调试输出
        
        expect(result.grammarErrors.length).toBeGreaterThan(0);
    });

    test('should generate suggestions for all types of errors', async () => {
        const text = '他快速的跑着，开心开心的玩耍。。';
        const result = await chineseAnalysis.analyzeText(text);
        
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.type === 'general')).toBe(true);
    });
});
