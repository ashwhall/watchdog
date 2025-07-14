from setuptools import setup, find_packages

setup(
    name="watchdog",
    version="0.0.1",
    author="Ash Hall",
    author_email="ashwhall@gmail.com",
    description="A python service to predict dog breeds",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[],
    entry_points={
        "console_scripts": [
            "watchdog=watchdog.run:main",
        ],
    },
)
