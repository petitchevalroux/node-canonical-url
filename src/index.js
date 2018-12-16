"use strict";

const normalizeUrl = require("normalize-url"),
    Promise = require("bluebird"),
    metascraper = require("metascraper")([
        require("metascraper-url")()
    ]),
    //got = require("got"),
    request = require("request"),
    crypto = require("crypto");
class CanonicalUrl {
    constructor() {}

    /**
     * Return canonicalized url
     * @param {String} url 
     * @returns {Promise<string>}
     */
    get(url) {
        const self = this;
        return this
            .getFromMetas(url)
            .then(url => {
                return self.getNormalized(url);
            });
    }

    /**
     * return normalized url
     * @param {String} url 
     * @requires {Promise<String>} 
     */
    getNormalized(url) {
        return new Promise((resolve) => {
            resolve(normalizeUrl(url, {
                stripHash: true,
                stripWWW: false,
                removeQueryParameters: [/^utm_\w+/i,
                    "xtor"
                ]
            }));
        });
    }

    /**
     * return urls from og:url or canonical metas
     * @param {String} url 
     * @requires {Promise<String>} 
     */
    getFromMetas(url) {
        return new Promise((resolve, reject) => {
            request({
                url: url,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36"
                }
            }, (error, response, body) => {
                if (error) {
                    return reject(error);
                }
                resolve({
                    url: response.request.uri.href,
                    body: body
                });
            });
        }).then(response => {
            return metascraper({
                url: response.url,
                html: response.body
            });
        }).then(metas => {
            return metas.url;
        });
    }

    getHash(url) {
        return this
            .get(url)
            .then(url => {
                return normalizeUrl(url, {
                    stripProtocol: true
                });
            })
            .then(url => {
                return crypto.createHash("sha256").update(url).digest(
                    "hex");
            });
    }

}


module.exports = CanonicalUrl;
