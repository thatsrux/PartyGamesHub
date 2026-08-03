import json

with open('jeopardy_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

sport_data = next(cat for cat in data if cat['name'] == 'Sport')

with open('sport.json', 'w', encoding='utf-8') as f:
    json.dump(sport_data, f, indent=2, ensure_ascii=False)
