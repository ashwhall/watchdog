import time
import datetime
import scrape
import classify
import web
import wandb
import tqdm
from threading import Thread

import database as db


CHECK_INTERVAL_MINUTES = 30

def check_new_dogs():
    print('SCRAPING DOGS')
    scrape.scrape()
    unclassified = db.get_unclassified()
    print(f'{len(unclassified)} dogs to classify')
    if unclassified == 0:
        return

    print('\nCLASSIFYING DOGS')
    for url, info in tqdm.tqdm(unclassified.items()):
        db.set_desired(url, *classify.classify_with_path(info['img']))

    unnotified_keys = list(db.get_unnotified().keys())
    if unnotified_keys:
        print('WE GOT SOME OPTIONS!')
        for i, url in enumerate(unnotified_keys):
            print(f'\t{url}')
            wandb.alert(title=f'DOG ALERT {i+1}/{len(unnotified_keys)}',
                        text=url,
                        level=wandb.AlertLevel.WARN,
                        wait_duration=datetime.timedelta(seconds=0))


if __name__ == '__main__':
    wandb.login()
    wandb.init('WatchDog')
    web_app_thread = Thread(target=web.app.run_server)
    web_app_thread.start()

    while True:
        check_new_dogs()
        print(f'\nCHECK COMPLETE!\nSleeping for {CHECK_INTERVAL_MINUTES} minutes...\n')
        time.sleep(CHECK_INTERVAL_MINUTES * 60)
