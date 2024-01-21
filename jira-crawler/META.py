# jira endpoint and APIs
jira_endpoint = "https://issues.apache.org/jira"
jira_search_url = jira_endpoint + "/rest/api/2/search"
jira_browse_url = jira_endpoint + "/browse/%s"
# /rest/api/2/{issueIdOrKey}/comment
jira_comment_url = jira_endpoint + "/rest/api/2/issue/%s/comment"

# process meta information
data_cols = [
    "Issue Key",
    # Detail Section
    "Type",
    "Priority",
    "Affects Version/s",
    "Component/s",
    "Labels",
    "Status",
    "Resolution",
    "Fix Version/s",
    # People Section
    "Assignee",
    "Reporter",
    "Votes",
    "Watchers",
    # Date Section
    "Created",
    "Updated",
    # Description and Comments Section
    "Description",
    "Comments",
]
