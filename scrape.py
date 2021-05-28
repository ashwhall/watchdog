import selenium.common.exceptions
import requests
from PIL import Image
from bs4 import BeautifulSoup
import os
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from getpass import getpass

print('Enter Facebook credentials:')
EMAIL = input('Email: ')
PWD = getpass()


def load_image(url):
    return Image.open(requests.get(url, stream=True).raw)


def save_image(url, filepath):
    img_data = load_image(url)
    if img_data.size[0] >= 100 and img_data.size[1] >= 100:
        img_data.save(filepath)
        return True
    return False

def get_image_filepath(src):
    if not src.startswith('http'):
        parsed_url = urlparse(src)
        src = f'{parsed_url.scheme}://{parsed_url.netloc}{src}'
    filename = os.path.basename(src)
    if '?' in filename:
        filename = filename[:filename.index('?')]
    # if filename.lower().endswith('jpg') or filename.lower().endswith('jpeg'):
    if os.path.splitext(filename)[1].lower().endswith('php'):
        filename = os.path.splitext(filename)[0] + '.jpg'
    if not os.path.splitext(filename)[1]:
        filename = filename + '.jpg'
    return os.path.join('.', 'images', 'fetched', filename)

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
                                if save_image(src, filepath):
                                    dogs[href] = filepath
                                    break
    return dogs

def scrape_dogshome():
    print('Scraping dogshome.com... ', end='', flush=True)
    dogs = dict()
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1'))
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=2'))
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=3'))
    dogs.update(scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=4'))
    print('done.', flush=True)
    return dogs

def scrape_petrescue():
    print('Scraping www.petrescue.com.au... ', end='', flush=True)
    dogs = scrape_generic('https://www.petrescue.com.au/listings/search/dogs?interstate=false&page=1&per_page=500&size%5B%5D=10&state_id%5B%5D=2')
    print('done.', flush=True)
    return dogs

def scrape_adoptapet():
    print('Scraping www.adoptapet.com.au... ', end='', flush=True)
    dogs = dict()
    # Dogs are loaded using Ajax - require Selenium to await loading
    print('Not yet implemented.', flush=True)
    return dogs
    return scrape_generic('https://www.adoptapet.com.au/search?state=3&animalType=3%2C+500')


def selenium_get_with_wait(driver, lambdaa, timeout=3):
    elements = []
    try:
        elements = WebDriverWait(driver, timeout=timeout).until(lambdaa)
    except selenium.common.exceptions.TimeoutException:
        pass
    return elements

def selenium_try_click(element):
    try:
        element.click()
    except selenium.common.exceptions.ElementNotInteractableException:
        pass
    except selenium.common.exceptions.ElementClickInterceptedException:
        pass

def retry_selenium(func, n_times=3):
    attempt = 0
    while attempt < n_times:
        try:
            return func()
        except:
            attempt += 1
    print(f'Failed after {n_times} attempts.')
    return {}



def scrape_saveadog():
    print('Scraping saveadog.org.au... ', end='', flush=True)
    dogs = dict()

    driver = webdriver.Chrome(executable_path='chromedriver_linux64/chromedriver')

    for category in ('small-dogs', 'puppies'):
        driver.get(f'https://saveadog.org.au/animals-adoptions/dog/{category}')


        modal_close = selenium_get_with_wait(driver, lambda d: d.find_elements_by_class_name('mmodal__close'))
        if modal_close:
            selenium_try_click(modal_close[0])

        dog_boxes = selenium_get_with_wait(driver, lambda d: d.find_elements_by_class_name('animal-box-inner'))
        for dog_box in dog_boxes:
            img_src = dog_box.find_element_by_tag_name('img').get_attribute('src')
            href = dog_box.find_element_by_tag_name('a').get_attribute('href')
            if img_src:
                if filepath := get_image_filepath(img_src):
                    if not os.path.exists(filepath):
                        if save_image(img_src, filepath):
                            dogs[href] = filepath
            # dogs[href] = img_src

    driver.quit()
    print('done.', flush=True)
    return dogs

def scrape_rspca():
    print('Scraping rspcavic.org... ', end='', flush=True)
    dogs = dict()

    driver = webdriver.Chrome(executable_path='chromedriver_linux64/chromedriver')

    page = 1
    while True:
        driver.get(f'https://rspcavic.org/adoption/Search/?animal=Dog&location=&keywords=&seed=9&page={page}')

        modal_close = selenium_get_with_wait(driver, lambda d: d.find_elements_by_id('danqam'))
        if modal_close:
            selenium_try_click(modal_close[0])

        dog_boxes = selenium_get_with_wait(driver, lambda d: d.find_elements_by_class_name('animalSearchImageWrapper'))
        if len(dog_boxes) == 0:
            break
        for dog_box in dog_boxes:
            img_src = dog_box.find_element_by_tag_name('img').get_attribute('src')
            href = dog_box.find_element_by_tag_name('a').get_attribute('href')
            if img_src:
                if filepath := get_image_filepath(img_src):
                    if not os.path.exists(filepath):
                        if save_image(img_src, filepath):
                            dogs[href] = filepath
        page += 1

    driver.quit()
    print('done.', flush=True)
    return dogs


def facebook_login(driver):
    email_input = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('email'))
    if email_input:
        pass_input = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('pass'))
        if pass_input:
            email_input.send_keys(EMAIL)
            pass_input.send_keys(PWD)
            submit_btn = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('loginbutton'))
            if submit_btn:
                submit_btn.click()


def scrape_fb(url):
    def func():
        return _scrape_fb(url)
    return retry_selenium(func)


def _scrape_fb(url):
    print(f'Scraping {url}... ', end='', flush=True)
    dogs = dict()

    driver = webdriver.Chrome(executable_path='chromedriver_linux64/chromedriver')

    driver.get(url)
    facebook_login(driver)
    posts = selenium_get_with_wait(driver, lambda d: d.find_elements_by_class_name('userContentWrapper'))

    for post in posts:
        href = None
        for a in post.find_elements_by_tag_name('a'):
            address = a.get_attribute('href')
            if '/posts/' in address and '#' not in address:
                href = address
                break
        if href is None:
            break

        img_src = None
        for image in post.find_elements_by_tag_name('img'):
            if img_src:
                break
            for preferredScale in ['scaledImageFitHeight', 'scaledImageFitWidth']:
                if preferredScale in image.get_attribute('class'):
                    img_src = image.get_attribute('src')
                    break
        if img_src:
            if filepath := get_image_filepath(img_src):
                if not os.path.exists(filepath):
                    if save_image(img_src, filepath):
                        dogs[href] = filepath

    driver.quit()
    print('done.', flush=True)
    return dogs


def scrape():
    dogs = dict()
    dogs.update(scrape_dogshome())
    dogs.update(scrape_petrescue())
    dogs.update(scrape_adoptapet())
    dogs.update(retry_selenium(scrape_saveadog))
    dogs.update(retry_selenium(scrape_rspca))
    dogs.update(scrape_fb('https://www.facebook.com/DogRescueAssociationofVictoria/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/vicdogrescue/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/StartingOverDogRescue/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/All4PawsDogRescue/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/groups/571800346240922/'))
    dogs.update(scrape_fb('https://www.facebook.com/groups/611101722623366/'))
    dogs.update(scrape_fb('https://www.facebook.com/SecondChanceAnimalRescueInc/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/PuppyTalesRescue/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/rescuedwithlove/posts/'))
    dogs.update(_scrape_fb('https://www.facebook.com/FFARLatrobe/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/FFARau/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/LostDogsHome/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/PetRescueAU/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/RSPCA.Victoria/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/petshavenfoundation/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/Australiank9rescuevic/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/TheAnimalRehomingService/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/melbourneanimalrescue/posts/'))
    dogs.update(scrape_fb('https://www.facebook.com/newbeginnings.animalrescueinc/posts/'))
    return dogs

if __name__ == '__main__':
    dogs = scrape()
    # dogs = scrape_saveadog()
    # dogs = scrape_rspca()
    # dogs = scrape_fb('https://www.facebook.com/pg/StartingOverDogRescue/posts')
    # dogs = scrape_fb('https://www.facebook.com/pg/DogRescueAssociationofVictoria/posts/')
    print('Dogs found:', flush=True)
    for k, v in dogs.items():
        print(k, v, flush=True)
