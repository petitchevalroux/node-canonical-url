# node-url-canonical
Generate canonical url resolved from redirect and removing tracking parameters

## Getting canonical url
```javascript
const canonicalUrl = new (require("@petitchevalroux/canonical-url"));
canonicalUrl.get("http://google.com").then(url=>console.log(url)); // https://www.google.com
canonicalUrl.get("https://bit.ly/1bdDlXc").then(url=>console.log(url)); // https://www.google.com
```

## Getting canonical hash
```javascript
const canonicalUrl = new (require("@petitchevalroux/canonical-url"));
canonicalUrl.getHash("http://google.com").then(hash=>console.log(url)); // d4c9d9027326271a89ce51fcaf328ed673f17be33469ff979e8ab8dd501e664f
canonicalUrl.getHash("https://www.google.com").then(hash=>console.log(url));  // d4c9d9027326271a89ce51fcaf328ed673f17be33469ff979e8ab8dd501e664f
canonicalUrl.getHash("https://bit.ly/1bdDlXc").then(hash=>console.log(url));  // d4c9d9027326271a89ce51fcaf328ed673f17be33469ff979e8ab8dd501e664f
```