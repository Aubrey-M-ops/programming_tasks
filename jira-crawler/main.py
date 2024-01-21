from crawler import parallel_crawl_batch

if __name__ == "__main__":
    all_result = parallel_crawl_batch(8320, 80, 1000)
