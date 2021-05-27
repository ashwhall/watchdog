from facebook_scraper import get_posts
import requests
from PIL import Image
from bs4 import BeautifulSoup
import os
from urllib.parse import urlparse

def scrape_fb_page(page_name):
    # print(list(get_posts('StartingOverDogRescue', pages=2)))
    # print(list(get_posts(post_urls=['https://www.facebook.com/PuppyTalesRescue/photos/a.447408861940318/4494037987277365/'])))
    for post in get_posts(page_name, pages=5):
        print("________")
        print(post.keys())
        print(post['text'][:50])
        import pprint
        pprint.pprint(post)
        # Image.open(requests.get(url, stream=True).raw)

def load_image(url):
    return Image.open(requests.get(url, stream=True).raw)

def scrape_generic(url):
    resp = requests.get(url)
    dogs = dict()
    if resp.ok:
        soup = BeautifulSoup(resp.text, 'html.parser')
        for img in soup.findAll('img'):
            if 'src' in img.attrs:
                for key in ['src', 'data-src']:
                    if key not in img.attrs:
                        continue
                    src = img.attrs[key]
                    if not src.startswith('http'):
                        parsed_url = urlparse(url)
                        src = f'{parsed_url.scheme}://{parsed_url.netloc}{src}'
                    filename = os.path.basename(src)
                    if '?' in filename:
                        filename = filename[:filename.index('?')]
                    if filename.lower().endswith('jpg') or filename.lower().endswith('jpeg'):
                        parent = img.parent
                        while parent and parent.name != 'a':
                            parent = parent.parent
                        if parent:
                            href = parent.attrs['href']
                            filepath = os.path.join('.', 'images', 'fetched', filename)
                            if not os.path.exists(filepath):
                                img_data = load_image(src)
                                if img_data.size[0] >= 100 and img_data.size[1] >= 100:
                                    img_data.save(filepath)
                                    dogs[href] = filepath
                                    break
    return dogs

def scrape_dogshome():
    print('Scraping dogshome.com... ', end='')
    dogs = dict()
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1'))
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=2'))
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=3'))
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=4'))
    print('done.')
    return dogs

def scrape_petrescue():
    print('Scraping www.petrescue.com.au... ', end='')
    dogs = scrape_generic('https://www.petrescue.com.au/listings/search/dogs?interstate=false&page=1&per_page=500&size%5B%5D=10&state_id%5B%5D=2')
    print('done.')
    return dogs

def scrape_adoptapet():
    print('Scraping www.adoptapet.com.au... ', end='')
    # Dogs are loaded using Ajax - require Selenium to await loading
    print('Not yet implemented.')
    return
    return scrape_generic('https://www.adoptapet.com.au/search?state=3&animalType=3%2C+500')

def scrape_saveadog():
    print('Scraping saveadog.org.au... ', end='')
    # Dogs are loaded using Ajax - require Selenium to await loading
    print('Not yet implemented.')
    return
    dogs = dict()
    # dogs.update(scrape_generic('https://saveadog.org.au/animals-adoptions/dog/puppies/'))
    # dogs.update(scrape_generic('https://saveadog.org.au/animals-adoptions/dog/small-dogs/'))
    # Large is used for testing - remove after complete
    dogs.update(scrape_generic('https://saveadog.org.au/animals-adoptions/dog/medium-large-dogs/'))
    return dogs

def scrape_rspca():
    print('Scraping rspcavic.org... ', end='')
    dogs = dict()
    for page in range(1):
        page = page + 1
        dogs.update(scrape_generic(f'https://rspcavic.org/adoption/Search/?animal=Dog&location=&keywords=&seed=9&page={page}'))
    print('done.')
    return dogs

def scrape_fb(url):
    return scrape_generic(url)



def scrape():
    dogs = dict()
    dogs.update(scrape_dogshome())
    dogs.update(scrape_petrescue())
    dogs.update(scrape_adoptapet())
    dogs.update(scrape_saveadog())
    dogs.update(scrape_rspca())
    # dogs.update(scrape_fb('http://www.facebook.com/StartingOverDogRescue'))
    return dogs

if __name__ == '__main__':
    dogs = scrape()

    print('Dogs found:')
    for k, v in dogs.items():
        print(k, v)
