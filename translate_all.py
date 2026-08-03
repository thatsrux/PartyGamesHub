import json
import re
import urllib.request
import urllib.parse
import time
import sys

def translate_to_it(text):
    if not text.strip(): return text
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=it&dt=t&q=" + urllib.parse.quote(text)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for _ in range(3): # retry logic
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                return "".join([part[0] for part in res[0]])
        except Exception as e:
            time.sleep(1)
    return text

with open('jeopardy_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

english_words = {'the', 'is', 'what', 'who', 'how', 'are', 'was', 'were', 'in', 'of', 'to', 'a', 'an', 'and', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'over', 'after'}
italian_words = {'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'chi', 'come', 'dove', 'quando', 'perché', 'quale', 'quali'}

def is_likely_english(text):
    words = set(re.findall(r'\b\w+\b', text.lower()))
    eng_count = len(words.intersection(english_words))
    ita_count = len(words.intersection(italian_words))
    return eng_count > ita_count

count = 0
for cat_idx, category in enumerate(data):
    for difficulty, questions in category.get('questions', {}).items():
        for q in questions:
            q_text = q['question']
            a_text = q['answer']
            if is_likely_english(q_text):
                q['question'] = translate_to_it(q_text)
                count += 1
                time.sleep(0.1)
            if is_likely_english(a_text):
                q['answer'] = translate_to_it(a_text)
                count += 1
                time.sleep(0.1)
            sys.stdout.write(f"\rTranslated {count} strings so far...")
            sys.stdout.flush()

print(f"\nTotal translations: {count}")

with open('jeopardy_data_fixed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
