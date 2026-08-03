import json
import re

with open('jeopardy_data_fixed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

english_words = {'the', 'is', 'what', 'who', 'how', 'are', 'was', 'were', 'in', 'of', 'to', 'a', 'an', 'and', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'over', 'after'}
italian_words = {'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'chi', 'come', 'dove', 'quando', 'perché', 'quale', 'quali'}

def is_likely_english(text):
    words = set(re.findall(r'\b\w+\b', text.lower()))
    eng_count = len(words.intersection(english_words))
    ita_count = len(words.intersection(italian_words))
    return eng_count > ita_count

summary = []

for cat_idx, category in enumerate(data):
    count = 0
    total = 0
    for difficulty, questions in category.get('questions', {}).items():
        for q in questions:
            total += 1
            if is_likely_english(q['question']) or is_likely_english(q['answer']):
                count += 1
    if count > 0:
        summary.append(f"Category: '{category['name']}' has {count}/{total} English questions.")

if summary:
    for line in summary:
        print(line)
else:
    print("No English questions found!")
