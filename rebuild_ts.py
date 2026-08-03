import json

with open('jeopardy_data_fixed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ts_content = """export interface JeopardyQuestion {
  question: string;
  answer: string;
}

export interface JeopardyCategory {
  name: string;
  questions: {
    100: JeopardyQuestion[];
    200: JeopardyQuestion[];
    300: JeopardyQuestion[];
    400: JeopardyQuestion[];
    500: JeopardyQuestion[];
  };
}

export const jeopardyCategories: JeopardyCategory[] = """

json_str = json.dumps(data, indent=2, ensure_ascii=False)
ts_content += json_str + ";\n"

with open('src/games/Jeopardy/data.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)
