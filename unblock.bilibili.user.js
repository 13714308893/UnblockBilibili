// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.1.0
// @icon                https://www.bilibili.com/favicon.ico
// @description         大会员账号共享解锁脚本
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @match               *.bilibili.com/video/av*
// @match               *.bilibili.com/bangumi/play/*
// @run-at              document-end
// @grant               GM.cookie
// ==/UserScript==

(() => {
    'use strict';
    const VIP_COOKIES = "";

    const VIP_COOKIES_KEYS = [
        'DedeUserID', 'DedeUserID__ckMd5', '_uuid', 'buvid3', 'bili_jct', 'SESSDATA', 'LIVE_BUVID', 'sid'
    ];

    const formatCookies = () => {
        let formatedCookies = {};
        const cookies = VIP_COOKIES.split('; ');
        cookies.forEach(cookie => {
            const kv = cookie.split('=');
            if (VIP_COOKIES_KEYS.indexOf(kv[0]) >= 0) {
                formatedCookies[kv[0]] = kv[1];
            }
        });
        return formatedCookies;
    };

    const FORMATED_VIP_COOKIES = formatCookies();
    const COOKIE_COUNT = Object.getOwnPropertyNames(FORMATED_VIP_COOKIES).length;

    let countOfCookies = COOKIE_COUNT;
    if (countOfCookies !== VIP_COOKIES_KEYS.length) {
        if (confirm('哔哩哔哩番剧解锁：大会员 Cookie 不正确，脚本无法正常运行。是否查看详细使用说明？')) {
            location.href = 'https://logi.ml/script/unblocking-bilibili-without-perception.html';
        }
        return;
    }

    const setCookie = (name, value, domain, path, expirationDate, httpOnly, callback) => {
        GM.cookie.set({
            name: name,
            value: value,
            domain: domain,
            path: path,
            expirationDate: expirationDate,
            httpOnly: httpOnly
        }).then(() => {
            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    const replaceCookie = (key, cookie, callback) => {
        if (cookie && cookie.value != FORMATED_VIP_COOKIES[key]) {
            setCookie('COPY_' + key + '_COPY',
                cookie.value,
                cookie.domain,
                cookie.path,
                cookie.expirationDate,
                cookie.httpOnly
            );
            setCookie(key,
                FORMATED_VIP_COOKIES[key],
                cookie.domain,
                cookie.path,
                cookie.expirationDate,
                cookie.httpOnly,
                () => {
                    if (--countOfCookies <= 0) {
                        callback();
                    }
                }
            );
        }
    };

    const changeCookies = callback => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: key })
                    .then(cookies => replaceCookie(key, cookies[0], callback));
            }
        }
    };

    const replaceCookie2 = (key, cookie, callback) => {
        if (cookie && cookie.value != '') {
            setCookie(key,
                cookie.value,
                cookie.domain,
                cookie.path,
                cookie.expirationDate,
                cookie.httpOnly
            );
            GM.cookie.delete({ name: 'COPY_' + key + '_COPY' }).then(() => callback());
        }
    };

    const recoverCookies = callback => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: 'COPY_' + key + '_COPY' })
                    .then(cookies => replaceCookie2(key, cookies[0], callback));
            }
        }
    };

    const referrer = document.referrer;
    if (referrer.indexOf('/video/av') < 0
        && referrer.indexOf('/bangumi/play/') < 0
        && document.cookie.indexOf('COPY_') < 0) {
        changeCookies(() => location.reload());
    } else {
        setTimeout(() => recoverCookies(() => {
            window.lastep = location.href;
            const LISTEN_URL_CHANGE = setInterval(() => {
                if (window.lastep != location.href) {
                    clearInterval(LISTEN_URL_CHANGE);
                    countOfCookies = COOKIE_COUNT;
                    changeCookies(() => location.reload());
                }
            }, 600);
        }), 10);
    }
})();