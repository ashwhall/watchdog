import datetime
import os
import json
from urllib.parse import urlparse
from PIL import Image
import requests


DB_PATH = os.path.join('images', 'database.json')

dog_db = {}


def load_db():
    global dog_db
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r') as f:
            dog_db = json.load(f)


def save_db():
    with open(DB_PATH, 'w') as f:
        json.dump(dog_db, f, indent=2, default=str)


load_db()


def already_scraped(url, img_url, img_path):
    url_exists = url in dog_db
    img_url_exists = len([v for v in dog_db.values() if v['img_url'] == img_url]) > 0
    img_already_downloaded = len([v for v in dog_db.values() if v['img'] == img_path]) > 0
    return url_exists or img_url_exists or img_already_downloaded


def _fetch_image(url):
    return Image.open(requests.get(url, stream=True).raw)


def _save_image(url, filepath):
    img_data = _fetch_image(url)
    if img_data.size[0] >= 100 and img_data.size[1] >= 100:
        img_data.save(filepath)
        return True
    return False


def get_image_filepath(url):
    if not url.startswith('http'):
        parsed_url = urlparse(url)
        url = f'{parsed_url.scheme}://{parsed_url.netloc}{url}'
    filename = os.path.basename(url)
    if '?' in filename:
        filename = filename[:filename.index('?')]
    # if filename.lower().endswith('jpg') or filename.lower().endswith('jpeg'):
    if os.path.splitext(filename)[1].lower().endswith('php'):
        filename = os.path.splitext(filename)[0] + '.jpg'
    if not os.path.splitext(filename)[1]:
        filename = filename + '.jpg'
    return os.path.join('.', 'images', 'fetched', filename)


def add(url, img_url):
    img_path = get_image_filepath(img_url)
    if not already_scraped(url, img_url, img_path):
        _save_image(img_url, img_path)

        dog_db[url] = dict(img=img_path,
                           desired=None,
                           notified=False,
                           scrape_datetime=datetime.datetime.now(),
                           predicted_classes=None,
                           img_url=img_url)
        save_db()


def set_desired(url, desired, pred_classes):
    # Set their desired property
    dog_db[url]['desired'] = desired
    dog_db[url]['predicted_classes'] = pred_classes
    # If they're not desired, pretend we already notified
    dog_db[url]['notified'] = not desired
    save_db()


def set_notified(url):
    dog_db[url]['notified'] = True
    save_db()


def reload_database():
    load_db()


def get_records():
    return dog_db


def get_unclassified():
    return {k: v for k, v in dog_db.items() if v['desired'] is None}


def get_unnotified():
    return {k: v for k, v in dog_db.items() if not v['notified']}


def count():
    return len(dog_db)
