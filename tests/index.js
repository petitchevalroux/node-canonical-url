"use strict";

const path = require("path"),
    CanonicalUrl = require(path.join(__dirname, "..")),
    assert = require("assert"),
    nock = require("nock"),
    Promise = require("bluebird");

describe("CanonicalUrl", () => {

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    const nockUrl = (relativeUrl, file) => {
        nock("http://www.example.com")
            .get(
                relativeUrl
            )
            .replyWithFile(
                200,
                path.join(__dirname, "files", file), {
                    "Content-Type": "text/html; charset=utf-8"
                }
            );
        nock("https://www.example.com")
            .get(
                relativeUrl
            )
            .replyWithFile(
                200,
                path.join(__dirname, "files", file), {
                    "Content-Type": "text/html; charset=utf-8"
                }
            );
    };

    describe("get", () => {
        const checkCanonicalGet = (toNormalizeUrl, expectedUrl,
            requestUrl,
            filePath) => {
            nockUrl(requestUrl, filePath);
            return new CanonicalUrl().get(toNormalizeUrl).then(
                url => {
                    assert.equal(url, expectedUrl);
                    return url;
                });
        };
        it("remove utm query parameters", () => {
            return checkCanonicalGet(
                "http://www.example.com/article-1?utm_source=source&utm_campaign=campaign&utm_content=foo",
                "http://www.example.com/article-1",
                "/article-1?utm_source=source&utm_campaign=campaign&utm_content=foo",
                "article-without-meta.html"
            );
        });


        it("remove hash", () => {
            return checkCanonicalGet(
                "http://www.example.com/article-1#hash",
                "http://www.example.com/article-1",
                "/article-1",
                "article-without-meta.html"
            );
        });

        it("use meta og url", () => {
            return checkCanonicalGet(
                "http://www.example.com/article-og-url",
                "http://www.example.com/final-article-og-url.html",
                "/article-og-url",
                "article-with-og-url.html"
            );
        });

        it("use meta canonical url", () => {
            return checkCanonicalGet(
                "http://www.example.com/article-canonical",
                "https://www.example.com/final-article-canonical.html",
                "/article-canonical",
                "article-with-canonical.html"
            );
        });

        it("remove xtor query parameters", () => {
            return checkCanonicalGet(
                "http://www.example.com/article-1?xtor=foo",
                "http://www.example.com/article-1",
                "/article-1?xtor=foo",
                "article-without-meta.html"
            );
        });

        it("examples", () => {
            const canonicalUrl = new CanonicalUrl();
            return Promise.all([
                canonicalUrl.get(
                    "http://google.com"),
                canonicalUrl.get(
                    "https://bit.ly/1bdDlXc")
            ]).then(urls => {
                assert.equal(urls[0],
                    "https://www.google.com"
                ),
                assert.equal(urls[1],
                    "https://www.google.com"
                );
                return urls;
            });
        });
    });

    describe("hash", () => {
        const checkCanonicalHash = (toNormalizeUrl,
            expectedHash, requestUrl,
            filePath) => {
            nockUrl(requestUrl, filePath);
            return new CanonicalUrl().getHash(
                toNormalizeUrl).then(hash => {
                assert.equal(hash, expectedHash);
                return hash;
            });
        };
        it("http and https have the same hash", () => {
            return Promise.all([
                checkCanonicalHash(
                    "http://www.example.com/article-1?utm_source=source&utm_campaign=campaign&utm_content=foo",
                    "6d9fbbc907ca2088aaacb2dc7d1aac53735e84dd5b376f221369eed752b4ce71",
                    "/article-1?utm_source=source&utm_campaign=campaign&utm_content=foo",
                    "article-without-meta.html"
                ),
                checkCanonicalHash(
                    "https://www.example.com/article-1?utm_source=source&utm_campaign=campaign&utm_content=foo",
                    "6d9fbbc907ca2088aaacb2dc7d1aac53735e84dd5b376f221369eed752b4ce71",
                    "/article-1?utm_source=source&utm_campaign=campaign&utm_content=foo",
                    "article-without-meta.html"
                )
            ]).then(hashes => {
                assert.equal(
                    hashes[0],
                    hashes[1]
                );
                return hashes;
            });
        });

        it("examples", () => {
            const canonicalUrl = new CanonicalUrl();
            return Promise.all([
                canonicalUrl.getHash(
                    "http://google.com"),
                canonicalUrl.getHash(
                    "https://www.google.com"),
                canonicalUrl.getHash(
                    "https://bit.ly/1bdDlXc")
            ]).then(urls => {
                assert.equal(urls[0],
                    "d4c9d9027326271a89ce51fcaf328ed673f17be33469ff979e8ab8dd501e664f"
                ),
                assert.equal(urls[1],
                    "d4c9d9027326271a89ce51fcaf328ed673f17be33469ff979e8ab8dd501e664f"
                );
                assert.equal(urls[2],
                    "d4c9d9027326271a89ce51fcaf328ed673f17be33469ff979e8ab8dd501e664f"
                );
                return urls;
            });
        });
    });
});
