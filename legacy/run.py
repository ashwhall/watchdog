import time
import scrape
from classify_v2 import classify
import web
import wandb
import tqdm
import datetime
from threading import Thread
import argparse

import database as db


CHECK_INTERVAL_MINUTES = 15


def parse_args():
    """Parses CLA"""
    parser = argparse.ArgumentParser()
    parser.add_argument('--headless',
                        help='Run Chrome in headless mode so no browser window is opened.',
                        action='store_true',
                        required=False)
    parser.add_argument('--skip-first-scrape',
                        help='Don\'t scrape on launch, wait the predetermined time first.',
                        action='store_true',
                        required=False)

    return parser.parse_args()


def check_new_dogs(skip_scraping=False, headless=False):
    if not skip_scraping:
        print('SCRAPING DOGS')
        scrape.scrape(headless=headless)

    unclassified = db.get_unclassified()
    print(f'{len(unclassified)} dogs to classify')
    if unclassified:
        print('\nCLASSIFYING DOGS')
        for url, info in tqdm.tqdm(unclassified.items()):
            db.set_desired(url, *classify(info['img']))

    unnotified_keys = list(db.get_unnotified().keys())
    if unnotified_keys:
        print('NEW NOTIFICATIONS!')
        for i, url in enumerate(unnotified_keys):
            print(f'({i+1})\t{url}')
            wandb.alert(title=f'DOG ALERT {i+1}/{len(unnotified_keys)}',
                        text=url,
                        level=wandb.AlertLevel.WARN,
                        wait_duration=datetime.timedelta(seconds=0))
            db.set_notified(url)


if __name__ == '__main__':
    args = parse_args()
    scrape.set_login_credentials()
    
    wandb.login()
    wandb.init('WatchDog')
    web_app_thread = Thread(target=web.run)
    web_app_thread.start()

    skip_scraping = args.skip_first_scrape
    while True:
        start_time = time.time()
        check_new_dogs(skip_scraping=skip_scraping, headless=args.headless)
        duration = time.time() - start_time
        print(f'\nCheck complete at {datetime.datetime.now()}')
        print(f'Duration: {round(duration)} seconds.')
        print(f'Sleeping for {CHECK_INTERVAL_MINUTES} minutes...\n')

        time.sleep(CHECK_INTERVAL_MINUTES * 60)
        skip_scraping = False
