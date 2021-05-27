from PIL import Image
import scrape
import classify


checked_urls = set()

def check_new_dogs():
    new_dogs = dict()
    print('Scraping dogs...')
    dogs = scrape.scrape()
    print(f'Found {len(dogs)} new dogs')
    print('Classifying dogs...')
    for url, img_path in dogs.items():
        if url not in checked_urls:
            img = classify.load_image(img_path)
            new_dogs[url] = classify.classify(img)
    for url, desired in new_dogs.items():
        if desired:
            print('Found a dog you might like!', url)
    checked_urls.update(list(new_dogs.keys()))


if __name__ == '__main__':
    check_new_dogs()
