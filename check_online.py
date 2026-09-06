import urllib.request

url = "https://garv1629.github.io/aibuild/"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print("Length:", len(html))
        print("HTML Content:")
        print(html)
except Exception as e:
    print("Error:", e)
