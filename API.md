## API

### Create a temporary shortened URL

``` sh
$ curl --data '{"type": "url", "payload": "https://example.com"}' -XPOST https://uau.li
https://uau.li/WZL7
```

### Create a temporary shortened snippet

``` sh
$ curl --data '{"type": "txt", "payload": "any_test_available"}' -XPOST https://uau.li
https://uau.li/BFPF
```

Size limit: 1MB