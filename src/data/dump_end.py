import json
with open('c:/Users/thatsrux/Desktop/Games/party-hub/src/data/quiz4.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('c:/Users/thatsrux/Desktop/Games/party-hub/src/data/end_dump.txt', 'w', encoding='utf-8') as f:
    for i, q in enumerate(data[1800:]):
        idx = 1800 + i
        ans = q['options'][q['correctIndex']]
        f.write(f"{idx} [{q.get('category')}]: {q['question']} | {', '.join(q['options'])} | Ans: {ans}\n")
