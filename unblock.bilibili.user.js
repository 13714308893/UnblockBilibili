// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.0.9
// @icon                https://www.bilibili.com/favicon.ico
// @description         大会员账号共享解锁脚本
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @match               *://*.bilibili.com/video/av*
// @match               *://*.bilibili.com/bangumi/play/*
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
    let countOfCookies = Object.getOwnPropertyNames(FORMATED_VIP_COOKIES).length;
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
            if (name.indexOf('COPY_') < 0) {
                if (--countOfCookies <= 0) {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            }
        });
    };

    const changeCookies = callback => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: key }).then(cookies => {
                    if (cookies[0] && cookies[0].value != FORMATED_VIP_COOKIES[key]) {
                        setCookie('COPY_' + key + '_COPY', cookies[0].value, cookies[0].domain, cookies[0].path, cookies[0].expirationDate, cookies[0].httpOnly, null);
                        setCookie(key, FORMATED_VIP_COOKIES[key], cookies[0].domain, cookies[0].path, cookies[0].expirationDate, cookies[0].httpOnly, callback);
                    }
                });
            }
        }
    };

    const recoverCookies = callback => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: 'COPY_' + key + '_COPY' }).then(cookies => {
                    if (cookies[0] && cookies[0].value != '') {
                        setCookie(key, cookies[0].value, cookies[0].domain, cookies[0].path, cookies[0].expirationDate, cookies[0].httpOnly, null);
                        GM.cookie.delete({ name: 'COPY_' + key + '_COPY' }).then(() => callback());
                    }
                });
            }
        }
    };

    if (document.referrer.indexOf('/video/av') < 0 && document.referrer.indexOf('/bangumi/play/') < 0 && document.cookie.indexOf('COPY_') < 0) {
        changeCookies(() => location.reload());
    } else {
        recoverCookies(() => {
            window.lastep = location.href;
            const LISTEN_URL_CHANGE = setInterval(() => {
                if (window.lastep != location.href) {
                    clearInterval(LISTEN_URL_CHANGE);
                    countOfCookies = Object.getOwnPropertyNames(FORMATED_VIP_COOKIES).length;
                    changeCookies(() => location.reload());
                }
            }, 600);
        });
    }
})();