Google Trends Interest Over Time API
When a Google Trends search contains interest over time results, they are parsed and exist within the interest_over_time object in the JSON output. Interest over time can contain timeline_data and averages array results. From timeline_data we are able to extract date and values array which contains query, value, and extracted_value. From averages we are able to extract query and value.


The API endpoint is https://serpapi.com/search?engine=google_trends

Head to the playground for a live and interactive demo.

Interest over time chart accepts both single and multiple queries per search.
API Parameters
data_type

Required

Parameter must be set to TIMESERIES. (I.e., data_type=TIMESERIES)

API Examples
Example with multiple queries
GET


https://serpapi.com/search.json?engine=google_trends&q=coffee,milk,bread,pasta,steak

Code to integrate


Ruby

require "serpapi" 

client = SerpApi::Client.new(
  engine: "google_trends",
  q: "coffee,milk,bread,pasta,steak",
  api_key: "a36d4aa3b7e5450fcf16914b2cc4d9fd53f7542f18176311e650ee53c2670612"
)

results = client.search
interest_over_time = results[:interest_over_time]

JSON Example

{
  "interest_over_time": {
    "timeline_data": [
      {
        "date": "May 30 – Jun 5, 2021",
        "timestamp": "1622304000",
        "values": [
          {
            "query": "coffee",
            "value": "80",
            "extracted_value": 80
          },
          {
            "query": "milk",
            "value": "58",
            "extracted_value": 58
          },
          {
            "query": "bread",
            "value": "35",
            "extracted_value": 35
          },
          ...
        ]
      },
      {
        "date": "Jun 6 – 12, 2021",
        "timestamp": "1622822400",
        "values": [
          {
            "query": "coffee",
            "value": "75",
            "extracted_value": 75
          },
          {
            "query": "milk",
            "value": "54",
            "extracted_value": 54
          },
          {
            "query": "bread",
            "value": "35",
            "extracted_value": 35
          },
          ...
        ]
      },
      {
        "date": "Jun 13 – 19, 2021",
        "timestamp": "1623513600",
        "values": [
          {
            "query": "coffee",
            "value": "78",
            "extracted_value": 78
          },
          {
            "query": "milk",
            "value": "54",
            "extracted_value": 54
          },
          {
            "query": "bread",
            "value": "35",
            "extracted_value": 35
          },
          ...
        ]
      },
      ...
    ],
    "averages": [
      {
        "query": "coffee",
        "value": 84
      },
      {
        "query": "milk",
        "value": 55
      },
      {
        "query": "bread",
        "value": 39
      },
      ...
    ]
  }
}
Example with single query
GET


https://serpapi.com/search.json?engine=google_trends&q=coffee

Code to integrate


Ruby

require "serpapi" 

client = SerpApi::Client.new(
  engine: "google_trends",
  q: "coffee",
  api_key: "a36d4aa3b7e5450fcf16914b2cc4d9fd53f7542f18176311e650ee53c2670612"
)

results = client.search
interest_over_time = results[:interest_over_time]

JSON Example

{
  "interest_over_time": {
    "timeline_data": [
      {
        "date": "May 30 – Jun 5, 2021",
        "timestamp": "1622304000",
        "values": [
          {
            "query": "coffee",
            "value": "80",
            "extracted_value": 80
          }
        ]
      },
      {
        "date": "Jun 6 – 12, 2021",
        "timestamp": "1622822400",
        "values": [
          {
            "query": "coffee",
            "value": "74",
            "extracted_value": 74
          }
        ]
      },
      {
        "date": "Jun 13 – 19, 2021",
        "timestamp": "1623513600",
        "values": [
          {
            "query": "coffee",
            "value": "78",
            "extracted_value": 78
          }
        ]
      },
      ...
    ]
  }
}
