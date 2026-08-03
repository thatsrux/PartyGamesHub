import re
import json

with open(r'C:\Users\thatsrux\Desktop\Games\party-hub\src\games\Jeopardy\data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all answers
answers = re.findall(r'\"answer\":\s*\"([^\"]+)\"', content)
print(f'Total answers found: {len(answers)}')

# Simple check for common English stop words that shouldn\'t appear in Italian
eng_words = {' the ', ' and ', ' is ', ' of ', ' with ', ' to ', ' in '}
suspicious = []

for ans in answers:
    ans_lower = ' ' + ans.lower() + ' '
    if any(word in ans_lower for word in eng_words):
        suspicious.append(ans)

print(f'Suspicious answers found: {len(suspicious)}')
for i, s in enumerate(suspicious[:30]):
    print(f'{i+1}. {s}')
