import urllib.request
import urllib.parse
import json

def translate_to_it(text):
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=it&dt=t&q=" + urllib.parse.quote(text)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            return "".join([part[0] for part in res[0]])
    except Exception as e:
        return f"Error: {e}"

print(translate_to_it("Who is the only player to have scored a hat-trick in a Men's FIFA World Cup final and still ended up on the losing team?"))
