# aws-es-cli
A little utility to access a secured AWS hosted Elasticsearch cluster via command line. This simply wraps Elasticsearch javascript client with [http-aws-es](https://github.com/TheDeveloper/http-aws-es).

## Install
```
npm install -g https://github.com/parthshah/aws-es-cli.git

aws-es-cli
```

## Usage
```shell
aws-es$ help

  Commands:

    help [command...]             Provides help for a given command.
    exit                          Exits application.
    connect [options] [uri...]
    exec [options] [fn] [params]
    disconnect
  ```

  * Connect to AWS Elasticsearch
  ```
  aws-es$ connect -k {aws-access-key-id} -s {aws-secret-access-key} {elasticsearch-host}
  ```

  * Executing commands
Please refer to javascript client documentation - https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference-2-4.html

  Get params from file...

  params/search.json:
  ```json
  {
    "index": "projects",
    "type": "projectV4",
    "body": {
      "query": {
        "match": {
          "name": "test"
        }
      }
    }
  }

  ```

  ```shell
  aws-es$ exec search -f params/search.json
[info] {
  "took": 19,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 454,

    ...
  ```

  Pass params inline
  ```shell
aws-es$ exec search '{"index": "projects", "type": "projectV4", "body": { "query": { "match": {"name": "test"}}}}'

  ```
