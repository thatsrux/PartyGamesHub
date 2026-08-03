import json
with open('c:/Users/thatsrux/Desktop/Games/party-hub/src/data/quiz4.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('c:/Users/thatsrux/Desktop/Games/party-hub/src/data/scienza_dump.txt', 'w', encoding='utf-8') as f:
    for q in data:
        if q.get('category') == 'Scienza e Natura':
            f.write(f"{q['question']} | Ans: {q['options'][q['correctIndex']]}\n")
