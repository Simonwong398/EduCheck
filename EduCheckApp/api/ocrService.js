import Tesseract from 'tesseract.js';

export const performOCR = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: info => console.log(info) // Log progress information
      }
    );
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to perform OCR');
  }
};
