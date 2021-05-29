import time
import selenium.common.exceptions
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
import database as db

import tqdm

print('Enter Facebook credentials:')
EMAIL = input('Email: ')
PWD = getpass()


def scrape_generic(url):
    resp = requests.get(url)
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
                            db.add(url=href, img_url=src)

def scrape_dogshome():
    print('Scraping dogshome.com... ', end='', flush=True)
    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1')
    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=2')
    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=3')
    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=4')
    print('done.', flush=True)

def scrape_petrescue():
    print('Scraping www.petrescue.com.au... ', end='', flush=True)
    scrape_generic('https://www.petrescue.com.au/listings/search/dogs?interstate=false&page=1&per_page=500&size%5B%5D=10&state_id%5B%5D=2')
    print('done.', flush=True)

def scrape_adoptapet():
    print('Scraping www.adoptapet.com.au... ', end='', flush=True)
    # Dogs are loaded using Ajax - require Selenium to await loading
    print('Not yet implemented.', flush=True)
    # return scrape_generic('https://www.adoptapet.com.au/search?state=3&animalType=3%2C+500')


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
                db.add(url=href, img_url=img_src)

    driver.quit()
    print('done.', flush=True)

def scrape_rspca():
    print('Scraping rspcavic.org... ', end='', flush=True)

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
                db.add(url=href, img_url=img_src)
                # if filepath := get_image_filepath(img_src):
                #     if not os.path.exists(filepath):
                #         if save_image(img_src, filepath):
                #             dogs[href] = filepath
        page += 1

    driver.quit()
    print('done.', flush=True)


def facebook_login(driver):
    email_input = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('email'))
    if email_input:
        pass_input = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('pass'))
        if pass_input:
            submit_btn = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('loginbutton'))
            if submit_btn:
                print("LOGING INT")
                email_input.send_keys(EMAIL)
                pass_input.send_keys(PWD)
                submit_btn.click()



def scrape_fb(url):
    def func():
        return _scrape_fb(url)
    return retry_selenium(func)


def _scrape_fb(url):
    print(f'Scraping {url}... ', end='', flush=True)

    driver = webdriver.Chrome(executable_path='chromedriver_linux64/chromedriver')

    driver.get(url)
    facebook_login(driver)


    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1)

    link_divs = driver.find_elements_by_class_name('_78cz')
    for link_div in link_divs:
        href = img_src = None

        if links := link_div.find_elements_by_tag_name('a'):
            href = links[0].get_attribute('href')

        parent = link_div
        while parent.get_attribute('class') != 'story_body_container':
            parent = parent.find_element_by_xpath('..')
        if parent:
            if images := parent.find_elements_by_class_name('_5sgi'):
                img_src = images[0].get_attribute('src')
        if href and img_src:
            db.add(url=href, img_url=img_src)

    driver.quit()
    print('done.', flush=True)


def scrape():
    functions = [
        lambda: scrape_dogshome(),
        lambda: scrape_petrescue(),
        lambda: scrape_adoptapet(),
        lambda: retry_selenium(scrape_saveadog),
        lambda: retry_selenium(scrape_rspca),
        lambda: scrape_fb('https://m.facebook.com/DogRescueAssociationofVictoria/posts/'),
        lambda: scrape_fb('https://m.facebook.com/vicdogrescue/posts/'),
        lambda: scrape_fb('https://m.facebook.com/StartingOverDogRescue/posts/'),
        lambda: _scrape_fb('https://m.facebook.com/All4PawsDogRescue/posts/'),
        lambda: scrape_fb('https://m.facebook.com/groups/571800346240922/'),
        lambda: scrape_fb('https://m.facebook.com/groups/611101722623366/'),
        lambda: scrape_fb('https://m.facebook.com/SecondChanceAnimalRescueInc/posts/'),
        lambda: scrape_fb('https://m.facebook.com/PuppyTalesRescue/posts/'),
        lambda: scrape_fb('https://m.facebook.com/rescuedwithlove/posts/'),
        lambda: scrape_fb('https://m.facebook.com/FFARLatrobe/posts/'),
        lambda: scrape_fb('https://m.facebook.com/FFARau/posts/'),
        lambda: scrape_fb('https://m.facebook.com/LostDogsHome/posts/'),
        lambda: scrape_fb('https://m.facebook.com/PetRescueAU/posts/'),
        lambda: scrape_fb('https://m.facebook.com/RSPCA.Victoria/posts/'),
        lambda: scrape_fb('https://m.facebook.com/petshavenfoundation/posts/'),
        lambda: scrape_fb('https://m.facebook.com/Australiank9rescuevic/posts/'),
        lambda: scrape_fb('https://m.facebook.com/TheAnimalRehomingService/posts/'),
        lambda: scrape_fb('https://m.facebook.com/melbourneanimalrescue/posts/'),
        lambda: scrape_fb('https://m.facebook.com/newbeginnings.animalrescueinc/posts/'),
    ]
    for f in tqdm.tqdm(functions):
        f()


if __name__ == '__main__':
    scrape()
    # dogs = scrape_saveadog()
    # dogs = scrape_rspca()
    # dogs = scrape_fb('https://www.facebook.com/pg/StartingOverDogRescue/posts')
    # dogs = scrape_fb('https://www.facebook.com/pg/DogRescueAssociationofVictoria/posts/')
    # print('Dogs found:', flush=True)
    # for k, v in db.get_records().items():
    #     print(k, v, flush=True)
