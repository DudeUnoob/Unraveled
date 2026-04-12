Google Trends Related Queries API
When a Google Trends search contains related queries, they are parsed and exist within the related_queries object in the JSON output. Related queries can contain rising and top array results. From these results, we can extract query, value, extracted_value, and link.


The API endpoint is https://serpapi.com/search?engine=google_trends

Head to the playground for a live and interactive demo.

Related queries chart accepts only single query per search.
API Parameters
data_type

Required

Parameter must be set to RELATED_QUERIES. (I.e., data_type=RELATED_QUERIES)

API Examples
Example with q: coffee
The value field represents the label shown by Google Trends and can be either a percentage increase (for example, +250%) or a textual label for record breakouts (for example, Breakout). In some languages, Google localizes this label (for example, French UI shows Record for Breakout). The extracted_value corresponds to the numeric percentage increase, which can be very large when the baseline search volume was low.

GET


https://serpapi.com/search.json?engine=google_trends&q=coffee&geo=FR&hl=en&data_type=RELATED_QUERIES

Code to integrate


Ruby

require "serpapi" 

client = SerpApi::Client.new(
  engine: "google_trends",
  q: "coffee",
  geo: "FR",
  hl: "en",
  data_type: "RELATED_QUERIES",
  api_key: "a36d4aa3b7e5450fcf16914b2cc4d9fd53f7542f18176311e650ee53c2670612"
)

results = client.search
related_queries = results[:related_queries]

JSON Example

{
  "related_queries": {
    "rising": [
      {
        "query": "usagi coffee",
        "value": "Breakout",
        "extracted_value": 8700,
        "link": "https://trends.google.com/trends/explore?q=usagi+coffee&date=today+12-m&geo=FR",
        "serpapi_link": "https://serpapi.com/search.json?data_type=RELATED_QUERIES&date=today+12-m&engine=google_trends&geo=FR&hl=en&q=usagi+coffee&tz=420"
      },
      {
        "query": "bacha coffee champs-élysées",
        "value": "Breakout",
        "extracted_value": 7050,
        "link": "https://trends.google.com/trends/explore?q=bacha+coffee+champs-%C3%A9lys%C3%A9es&date=today+12-m&geo=FR",
        "serpapi_link": "https://serpapi.com/search.json?data_type=RELATED_QUERIES&date=today+12-m&engine=google_trends&geo=FR&hl=en&q=bacha+coffee+champs-%C3%A9lys%C3%A9es&tz=420"
      },
      {
        "query": "crep and coffee",
        "value": "+4,500%",
        "extracted_value": 4500,
        "link": "https://trends.google.com/trends/explore?q=crep+and+coffee&date=today+12-m&geo=FR",
        "serpapi_link": "https://serpapi.com/search.json?data_type=RELATED_QUERIES&date=today+12-m&engine=google_trends&geo=FR&hl=en&q=crep+and+coffee&tz=420"
      },
      ...
    ],
    "top": [
      {
        "query": "coffee shop",
        "value": "100",
        "extracted_value": 100,
        "link": "https://trends.google.com/trends/explore?q=coffee+shop&date=today+12-m&geo=FR",
        "serpapi_link": "https://serpapi.com/search.json?data_type=RELATED_QUERIES&date=today+12-m&engine=google_trends&geo=FR&hl=en&q=coffee+shop&tz=420"
      },
      {
        "query": "the coffee",
        "value": "30",
        "extracted_value": 30,
        "link": "https://trends.google.com/trends/explore?q=the+coffee&date=today+12-m&geo=FR",
        "serpapi_link": "https://serpapi.com/search.json?data_type=RELATED_QUERIES&date=today+12-m&engine=google_trends&geo=FR&hl=en&q=the+coffee&tz=420"
      },
      {
        "query": "cafe",
        "value": "25",
        "extracted_value": 25,
        "link": "https://trends.google.com/trends/explore?q=cafe&date=today+12-m&geo=FR",
        "serpapi_link": "https://serpapi.com/search.json?data_type=RELATED_QUERIES&date=today+12-m&engine=google_trends&geo=FR&hl=en&q=cafe&tz=420"
      },
      ...
    ]
  }
}