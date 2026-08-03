import json
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException

def main():
    with open('c:/Users/thatsrux/Desktop/Games/party-hub/src/data/quiz4.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    non_italian = []
    
    for i, item in enumerate(data):
        text = item['question'] + ' ' + ' '.join(item['options'])
        try:
            lang = detect(text)
            if lang != 'it':
                non_italian.append((i, lang, item['question']))
        except LangDetectException:
            non_italian.append((i, 'unknown', item['question']))
            
    print(f"Trovate {len(non_italian)} domande sospette (non in italiano).")
    for idx, lang, q in non_italian:
        print(f"Index: {idx}, Lang: {lang}, Q: {q}")
        
if __name__ == '__main__':
    main()
