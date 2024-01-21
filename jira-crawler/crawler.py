import json
import logging
from multiprocessing import Pool
import urllib3
import pandas as pd
from datetime import datetime
from bs4 import BeautifulSoup
from META import jira_search_url
from META import jira_browse_url
from META import jira_comment_url
from META import data_cols


def read_issues(project, start_at=0, max_result=50):
    """
    Use Jira REST API to read from certain project (jql style)

    Parameters
    ----------
    project : str
        the project name
    start_at : int
        the first return item number
    max_result : int
        the item count returned, if not enough remaining then return all
    """
    jql = "project=%s" % project
    query = {"jql": jql, "startAt": start_at, "maxResult": max_result}
    http = get_conn_manager()
    response = http.request("GET", jira_search_url, fields=query)

    response_dict = json.loads(response.data)
    response_dict["issues_keys"] = list(
        map(lambda x: x["key"], response_dict["issues"])
    )
    return response_dict


def get_conn_manager():
    """
    Return a avaliable http pool manager.
    China blocked website from outside mainland, we use a proxy everytime
    """
    return urllib3.ProxyManager("http://127.0.0.1:7890")
    # return urllib3.PoolManager()


def get_issue_browse_url(issue_key):
    return jira_browse_url % issue_key


def get_comment_url(issue_key):
    return jira_comment_url % issue_key


def crawl_one_issue(issue_key):
    """
    main method, search html to find useful information after webpage is loaded in selenium

    Parameters
    ----------
    issue_key : str
        the issue key we need to crawl
    """

    # retries = urllib3.Retry(10, connect=10, backoff_factor=0.1)
    http = get_conn_manager()
    url = get_issue_browse_url(issue_key)
    logging.warn("start to crawl: %s" % url)
    response = http.request("GET", url)
    browse_soup = BeautifulSoup(response.data, "html.parser")

    # Details section
    detail_mod = browse_soup.find("ul", id="issuedetails")
    issue_type_val = detail_mod.find("span", id="type-val").text.strip()
    status_val = detail_mod.find("span", id="status-val").text.strip()
    priority_val = detail_mod.find("span", id="priority-val").text.strip()
    resolution_val = detail_mod.find("span", id="resolution-val").text.strip()
    versions_soup = detail_mod.find("span", id="versions-val")
    versions_val = "None"
    if not versions_soup.text.strip() == "None":
        versions_val = ", ".join(
            list(
                map(
                    lambda span: span.text.strip(),
                    versions_soup.find("span", id="versions-field").find_all("span"),
                )
            ),
        )
    fixfor_soup = detail_mod.find("span", id="fixfor-val")
    fixfor_val = "None"
    if not fixfor_soup.text.strip() == "None":
        fixfor_val = ", ".join(
            list(map(lambda a: a.text.strip(), fixfor_soup.find_all("a")))
        )
    components_soup = detail_mod.find("span", id="components-val")
    components_val = "None"
    if not components_soup.text.strip() == "None":
        components_val = ", ".join(
            list(map(lambda a: a.text.strip(), fixfor_soup.find_all("a")))
        )
    labels_val = detail_mod.find("div", "labels-wrap value").text
    # custom_field_mod = browse_soup.find("div", "customfieldmodule")

    # People section
    people_mod = browse_soup.find("div", id="peoplemodule")
    assignee_val = people_mod.find("span", id="assignee-val").text.strip()
    reporter_val = people_mod.find("span", id="reporter-val").text.strip()
    votes_val = people_mod.find("aui-badge", id="vote-data").text.strip()
    watcher_val = people_mod.find("aui-badge", id="watcher-data").text.strip()

    # Dates section
    dates_mod = browse_soup.find("div", id="datesmodule")
    created_val = dates_mod.find("span", id="created-val").time["datetime"]
    created_val = datetime.strptime(created_val, "%Y-%m-%dT%H:%M:%S%z")
    updated_val = dates_mod.find("span", id="updated-val").time["datetime"]
    updated_val = datetime.strptime(updated_val, "%Y-%m-%dT%H:%M:%S%z")

    # Description section
    desc_mod = browse_soup.find("div", id="descriptionmodule")
    # description are consisted with multiple <p>, this concatenate all <p> labels
    desc_val = "No Desc"
    if desc_mod:
        desc_val = "\n".join(
            list(
                map(
                    lambda x: x.text,
                    desc_mod.find("div", id="description-val").div.children,
                )
            )
        ).strip()

    # Comment section
    comment_result = []
    comment_response = http.request("GET", get_comment_url(issue_key))
    comment_json = json.loads(comment_response.data)
    for cmt in comment_json["comments"]:
        one_comment = ":".join(
            [
                cmt["author"]["name"],
                datetime.strptime(cmt["created"], "%Y-%m-%dT%H:%M:%S.%f%z").strftime(
                    "%s"
                ),
                cmt["created"],
                datetime.strptime(cmt["updated"], "%Y-%m-%dT%H:%M:%S.%f%z").strftime(
                    "%s"
                ),
                cmt["updated"],
                cmt["body"],
            ]
        )
        comment_result.append(one_comment)
    comment_val = "\n".join(comment_result)

    # return data in the predefined order in META.data_cols
    return pd.DataFrame(
        data=[
            [
                issue_key,
                issue_type_val,
                priority_val,
                versions_val,
                components_val,
                labels_val,
                status_val,
                resolution_val,
                fixfor_val,
                assignee_val,
                reporter_val,
                votes_val,
                watcher_val,
                created_val,
                updated_val,
                desc_val,
                comment_val,
            ]
        ],
        columns=data_cols,
    )


def crawl_batch(starts_from, batch_size):
    """
    Crawl the website using one thread, generate one data one time.

    Parameter
    ---------
    starts_from : int
        The start index of all the issues
    batch_size : int
        The issue batch size
    """
    progress = starts_from
    total_count = 0
    first_time = True
    batch_df = pd.DataFrame(columns=data_cols)
    while True:
        batch_issues = read_issues("camel", start_at=progress, max_result=batch_size)
        if first_time:
            first_time = False
            total_count = batch_issues["total"]

        for issue_key in batch_issues["issues_keys"]:
            batch_df = pd.concat([batch_df, crawl_one_issue(issue_key)])
            progress = progress + 1
        if total_count <= progress:
            logging.warn(
                "crawl single thread finished, progress = %s, total_count = %s"
                % (progress, total_count)
            )
            break

    return batch_df


def parallel_crawl_batch(starts_from, batch_size, export_step):
    """
    Create a threadPool for http request at batch size,
    crawl a batch of website at a time,
    export at a fixed length

    Parameter
    ---------
    starts_from : int
        The start index of all the issues
    batch_size : int
        The issue batch size
    """
    p = Pool(batch_size)
    progress = starts_from
    total_count = 0
    first_time = True
    batch_df = pd.DataFrame(columns=data_cols)
    last_export_progress = progress

    while True:
        batch_issues = read_issues("camel", start_at=progress, max_result=batch_size)
        if first_time:
            first_time = False
            total_count = batch_issues["total"]

        batch_result = p.map(crawl_one_issue, batch_issues["issues_keys"])

        batch_df = pd.concat([batch_df, pd.concat(batch_result)])
        progress = progress + batch_size
        if total_count <= progress:
            logging.warn(
                "crawl finished, progress = %s, total_count = %s"
                % (progress, total_count)
            )
            break
        elif progress - last_export_progress >= export_step:
            # export sometime and update the last export progress
            batch_df.to_csv(
                "camel_issue_data_%s_to_%s.csv" % (last_export_progress, progress)
            )
            batch_df = pd.DataFrame(columns=data_cols)
            last_export_progress = progress

    if batch_df.size != 0:
        # if the last batch is not empty, just export them
        batch_df.to_csv(
            "camel_issue_data_%s_to_%s.csv" % (last_export_progress, progress)
        )
