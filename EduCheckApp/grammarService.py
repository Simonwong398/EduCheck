from flask import Flask, request, jsonify
import spacy
from spellchecker import SpellChecker

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")
spell = SpellChecker()

@app.route('/detect_grammar_errors', methods=['POST'])
def detect_grammar_errors():
    text = request.json.get('text', '')
    doc = nlp(text)
    errors = []
    for token in doc:
        if token.tag_ == "UH":  # Example error detection
            errors.append(f"Unexpected interjection: {token.text}")
    return jsonify(errors=errors)

@app.route('/detect_english_errors', methods=['POST'])
def detect_english_errors():
    text = request.json.get('text', '')
    doc = nlp(text)
    grammar_errors = []
    spelling_errors = []

    # 语法错误检测
    for token in doc:
        if token.tag_ == "UH":  # Example error detection
            grammar_errors.append(f"Unexpected interjection: {token.text}")

    # 拼写错误检测
    words = text.split()
    misspelled = spell.unknown(words)
    for word in misspelled:
        spelling_errors.append(f"Misspelled word: {word}")

    return jsonify(grammar_errors=grammar_errors, spelling_errors=spelling_errors)

if __name__ == '__main__':
    app.run(port=5000)
