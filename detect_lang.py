import json
import re

with open('jeopardy_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

english_words = {'the', 'is', 'what', 'who', 'how', 'are', 'was', 'were', 'in', 'of', 'to', 'a', 'an', 'and', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'over', 'after'}
italian_words = {'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'chi', 'come', 'dove', 'quando', 'perché', 'quale', 'quali'}

def is_likely_english(text):
    words = set(re.findall(r'\b\w+\b', text.lower()))
    eng_count = len(words.intersection(english_words))
    ita_count = len(words.intersection(italian_words))
    return eng_count > ita_count

for cat_idx, category in enumerate(data):
    english_questions = []
    for difficulty, questions in category.get('questions', {}).items():
        for q_idx, q in enumerate(questions):
            question_text = q['question']
            answer_text = q['answer']
            if is_likely_english(question_text) or is_likely_english(answer_text):
                english_questions.append((difficulty, q_idx, question_text, answer_text))
    if english_questions:
        print(f"Category: {category['name']} (Index: {cat_idx})")
        for diff, q_idx, q, a in english_questions:
            print(f"  [{diff}] {q} -> {a}")

