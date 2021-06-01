import time
import selenium.common.exceptions
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait, Select
import database as db
from getpass import getpass


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
    start_count = db.count()

    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1')
    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=2')
    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=3')
    scrape_generic(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?age=&sex=&breed1=&resulttype=1&ShelterLocation=&Submit=Submit&pageno=4')
    print(f'done - {db.count() - start_count} dogs scraped.', flush=True)


def scrape_petrescue():
    print('Scraping www.petrescue.com.au... ', end='', flush=True)
    start_count = db.count()

    scrape_generic('https://www.petrescue.com.au/listings/search/dogs?interstate=false&page=1&per_page=500&size%5B%5D=10&state_id%5B%5D=2')
    print(f'done - {db.count() - start_count} dogs scraped.', flush=True)


def scrape_adoptapet(driver):
    print('Scraping www.adoptapet.com.au... ', end='', flush=True)
    start_count = db.count()

    driver.get('https://www.adoptapet.com.au/')

    # Close the covid info popup
    modal = selenium_get_with_wait(driver, lambda d: d.find_element_by_class_name('tingle-modal--visible'))
    if modal:
        close_btn = selenium_get_with_wait(driver, lambda d: d.find_element_by_class_name('tingle-btn--primary'))
        if close_btn:
            close_btn.click()

    advanced_search_btn = selenium_get_with_wait(driver, lambda d: d.find_element_by_class_name('advanced-search'))
    if advanced_search_btn:
        advanced_search_btn.click()

    # Form details
    anim_type_select = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('animal-type'))
    if anim_type_select:
        Select(anim_type_select).select_by_value('custom-mapping-1') # Dog and puppy

    state_select = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('state'))
    if state_select:
        Select(state_select).select_by_value('3') # Victoria

    # Submission
    time.sleep(2)
    search_btn = selenium_get_with_wait(driver, lambda d: d.find_element_by_xpath('//*[@id="search-button-bott"]/button'))
    if search_btn:
        search_btn.click()

    # Account for multiple pages
    more_pets = True
    while more_pets:
        time.sleep(1)
        for pet in selenium_get_with_wait(driver, lambda d: d.find_elements_by_class_name('pet')):
            href = img_src = None
            link = pet.find_element_by_tag_name('a')
            if link:
                href = link.get_attribute('href')
            img = pet.find_element_by_tag_name('img')
            if img:
                img_src = img.get_attribute('src')
            if href and img_src:
                db.add(url=href, img_url=img_src)
        if search_btn := selenium_get_with_wait(driver, lambda d: d.find_element_by_xpath('//*[@id="go-to-search-page"]/div/div/a')):
            search_btn.click()
        else:
            more_pets = False

    print(f'done - {db.count() - start_count} dogs scraped.', flush=True)


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


def retry_selenium(driver, func, n_times=3):
    attempt = 0
    while attempt < n_times:
        try:
            return func(driver)
        except:
            attempt += 1
    print(f'Failed after {n_times} attempts.')
    return {}


def scrape_saveadog(driver):
    print('Scraping saveadog.org.au... ', end='', flush=True)
    start_count = db.count()

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

    print(f'done - {db.count() - start_count} dogs scraped.', flush=True)


def scrape_rspca(driver):
    print('Scraping rspcavic.org... ', end='', flush=True)
    start_count = db.count()

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

    print(f'done - {db.count() - start_count} dogs scraped.', flush=True)


def _facebook_login(driver):
    email_input = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('m_login_email'))
    if email_input:
        pass_input = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('m_login_password'))
        if pass_input:
            submit_btn = selenium_get_with_wait(driver, lambda d: d.find_element_by_class_name('_56bu'))
            if submit_btn:
                email_input.send_keys(EMAIL)
                pass_input.send_keys(PWD)
                submit_btn.click()

    not_now_btn = selenium_get_with_wait(driver, lambda d: d.find_element_by_id('_56bw'))
    if not_now_btn:
        not_now_btn.click()


def scrape_fb_group(driver, group_id):
    print(f'Scraping FB group {group_id}... ', end='', flush=True)
    start_count = db.count()
    scrape_fb_url(driver, f'https://touch.facebook.com/groups/{group_id}')
    print(f'done - {db.count() - start_count} dogs scraped.', flush=True)


def scrape_fb_page(driver, page_name):
    print(f'Scraping FB page {page_name}... ', end='', flush=True)
    start_count = db.count()
    scrape_fb_url(driver, f'https://touch.facebook.com/{page_name}/posts')
    print(f'done - {db.count() - start_count} dogs scraped.', flush=True)


def fb_login(driver):
    driver.get('https://touch.facebook.com')
    _facebook_login(driver)


def scrape_fb_url(driver, url):
    return retry_selenium(driver, lambda d: _scrape_fb(d, url))


def get_img_src(img):
    img_src = None
    if img.find_element_by_xpath('..').tag_name == 'span':
        return None
    try:
        img_src = img.get_attribute('src')
    except:
        pass
    try:
        css_img_prop = img.value_of_css_property('background-image')
        img_src = css_img_prop[css_img_prop.index('"') + 1:css_img_prop.rindex('"')]
    except:
        pass
    return img_src


def _scrape_fb(driver, url):
    driver.get(url)
    selenium_get_with_wait(driver, lambda d: d.find_elements_by_class_name('_78cz'))

    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1)

    link_divs = driver.find_elements_by_class_name('_78cz')

    for link_div in link_divs:
        href = img_src = None

        if links := link_div.find_elements_by_tag_name('a'):
            href = links[0].get_attribute('href').replace('m.facebook', 'facebook').replace('touch.facebook', 'facebook')

        parent = link_div
        while parent.get_attribute('class') != 'story_body_container':
            parent = parent.find_element_by_xpath('..')

        if parent:
            for img_class in ['_5sgi', '_2sxw', 'datstx6m']:
                for image in parent.find_elements_by_class_name(img_class):
                    img_src = get_img_src(image)
                if img_src:
                    break

        if href and img_src:
            db.add(url=href, img_url=img_src)


def scrape(headless=False):
    # This enables headless Chrome control so the window isn't opened and displayed
    if headless:
        from pyvirtualdisplay import Display
        display = Display(visible=False, size=(800, 600))
        display.start()

    driver = webdriver.Chrome(executable_path='chromedriver_linux64/chromedriver')

    scrape_dogshome()
    scrape_petrescue()
    retry_selenium(driver, scrape_adoptapet)
    retry_selenium(driver, scrape_saveadog)
    retry_selenium(driver, scrape_rspca)

    fb_login(driver)
    scrape_fb_group(driver, '571800346240922')
    scrape_fb_group(driver, '611101722623366')
    scrape_fb_page(driver, 'DogRescueAssociationofVictoria')
    scrape_fb_page(driver, 'vicdogrescue')
    scrape_fb_page(driver, 'StartingOverDogRescue')
    scrape_fb_page(driver, 'All4PawsDogRescue')
    scrape_fb_page(driver, 'SecondChanceAnimalRescueInc')
    scrape_fb_page(driver, 'PuppyTalesRescue')
    scrape_fb_page(driver, 'rescuedwithlove')
    scrape_fb_page(driver, 'FFARLatrobe')
    scrape_fb_page(driver, 'FFARau')
    scrape_fb_page(driver, 'LostDogsHome')
    scrape_fb_page(driver, 'PetRescueAU')
    scrape_fb_page(driver, 'RSPCA.Victoria')
    scrape_fb_page(driver, 'petshavenfoundation')
    scrape_fb_page(driver, 'Australiank9rescuevic')
    scrape_fb_page(driver, 'TheAnimalRehomingService')
    scrape_fb_page(driver, 'melbourneanimalrescue')
    scrape_fb_page(driver, 'newbeginnings.animalrescueinc')
    scrape_fb_page(driver, 'Australiank9rescuevic')

    driver.quit()

if __name__ == '__main__':
    scrape()
