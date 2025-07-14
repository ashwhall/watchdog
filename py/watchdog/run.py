from model import load_model


def wait_forever():
    """
    Waits forever, useful for keeping the main thread alive.
    """
    import time
    while True:
        time.sleep(1)
        print("Watchdog service is running...", )


def main():
    """
    Main entry point for the watchdog service.
    """
    print("Starting watchdog service...", )
    try:
        wait_forever()
    except KeyboardInterrupt:
        print("Exiting due to keyboard interrupt.")


if __name__ == "__main__":
    print('Loading model...')
    load_model()
    main()
