"""Check published provider resources; do not download or redistribute recordings."""
import concurrent.futures
import urllib.request
def check(pair):
    s,a=pair
    url=f'https://everyayah.com/data/Husary_Muallim_128kbps/{s:03}{a:03}.mp3'
    request=urllib.request.Request(url,method='HEAD')
    try:
        with urllib.request.urlopen(request,timeout=25) as response:
            ok=response.status==200 and 'audio' in response.headers.get('Content-Type','')
            return url,ok,response.status
    except Exception as error:return url,False,str(error)
targets=[(74,a) for a in range(1,57)]+[(67,a) for a in range(1,31)]+[(96,a) for a in range(1,20)]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(check,targets))
failures=[(url,status) for url,ok,status in results if not ok]
print(f'Audio HEAD verification: {len(results)-len(failures)}/{len(results)} HTTP 200 audio resources.')
for failure in failures:print(failure)
raise SystemExit(bool(failures))
