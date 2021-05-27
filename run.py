import time
import datetime
import scrape
import classify
import wandb

checked_urls = set()

CHECK_INTERVAL_MINUTES = 5

def check_new_dogs():
    new_dogs = dict()
    print('SCRAPING DOGS')
    dogs = scrape.scrape()
    print(f'Found {len(dogs)} new dogs')
    if len(dogs) == 0:
        return

    print('\nCLASSIFYING DOGS')
    for url, img_path in dogs.items():
        if url not in checked_urls:
            img = classify.load_image(img_path)
            new_dogs[url] = classify.classify(img)

    desired_urls = [url for url, desired in new_dogs.items()]

    if desired_urls:
        print('Found some dogs you might like!')
        for url in desired_urls:
            print(f'\t{url}')

        wandb.alert(title='New dogs found!',
                    text='\n'.join(desired_urls),
                    level=wandb.AlertLevel.WARN,
                    wait_duration=datetime.timedelta(seconds=5))
    checked_urls.update(list(new_dogs.keys()))


if __name__ == '__main__':
    wandb.login()
    wandb.init('WatchDog')

    while True:
        check_new_dogs()
        print(f'Check complete! Sleeping for {CHECK_INTERVAL_MINUTES} minutes...\n')
        time.sleep(CHECK_INTERVAL_MINUTES * 60)
