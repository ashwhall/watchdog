# WatchDog

Scrapes dog adoption listings from a collection of websites and Facebook pages/groups in order. This was built for a pretty specific purpose and tested on a single Ubuntu machine, so I can make no guarantees about its stability.

### Usage
Install the requirements (probably in a virtual env of some sort):
```
pip3 install -r requirements.txt
```

Run it!
```
python3 run.py
```

Then enter your Facebook credentials to log in when prompted.
```
Enter Facebook credentials:
Email: xxxx@yyy.zzz
Password: ******
```

Can optionally provide the below flags:
```
  -h, --help           show this help message and exit
  --headless           Run Chrome in headless mode so no browser window is opened.
  --skip-first-scrape  Don't scrape on launch, wait the predetermined time first.
```

It's recommended to run with `--headless` so Chrome doesn't keep opening and closing and taking focus.
