import json
with open('c:/Users/thatsrux/Desktop/Games/party-hub/src/data/quiz4.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for i, q in enumerate(data[:30]):
    ans = q['options'][q['correctIndex']]
    print(f"{i} [{q.get('category')}]: {q['question']} | Ans: {ans}")
