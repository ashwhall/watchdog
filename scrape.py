from facebook_scraper import get_posts

print(list(get_posts(post_urls=['https://www.facebook.com/PuppyTalesRescue/photos/a.447408861940318/4494037987277365/'])))
# for post in get_posts(group='PuppyTalesRescue'):
#     print(post.keys())
#     print(post['text'][:50])