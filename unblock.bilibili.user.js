// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.1.7
// @icon                https://www.bilibili.com/favicon.ico
// @description         大会员账号共享解锁脚本
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @match               *.bilibili.com/video/av*
// @match               *.bilibili.com/bangumi/play*
// @run-at              document-end
// @grant               GM.cookie
// ==/UserScript==

(() => {
    'use strict';
    // 目前看视频会自动切换到会员账号，其他页面会切回来，暂时没有精力实现精细的登录控制。
    // 下行双引号里面填写大会员 Cookie。复制得到的 Cookie，不要做任何修改，直接粘贴保存。
    const ORIGINAL_VIP_COOKIES = "";

    const NEEDED_VIP_COOKIES_KEYS = ['SESSDATA', '_uuid', 'CURRENT_QUALITY'];
    const STORAGE_UTIL = {
        cookie: {
            set: (cookie, callback) => {
                'secure session sameSite hostOnly'.split(' ').forEach(key => delete cookie[key]);
                GM.cookie.set(cookie).then(error => callback(error));
            },
            list: (option, callback) => GM.cookie.list(option).then(cookies => callback(cookies)),
            delete: (option, callback) => GM.cookie.delete(option).then(() => callback())
        },
        localStorage: {
            set: (key, value) => window.localStorage.setItem(key, JSON.stringify(value)),
            get: key => JSON.parse(window.localStorage.getItem(key)),
            delete: key => window.localStorage.removeItem(key)
        }
    };
    const FORMATED_VIP_COOKIES = (() => {
        if (ORIGINAL_VIP_COOKIES !== "") {
            const formatedCookies = {};
            const cookies = ORIGINAL_VIP_COOKIES.split('; ');
            cookies.forEach(cookie => {
                const kv = cookie.split('=');
                if (NEEDED_VIP_COOKIES_KEYS.indexOf(kv[0]) >= 0) {
                    formatedCookies[kv[0]] = kv[1];
                }
            });
            formatedCookies.CURRENT_QUALITY = '116';
            STORAGE_UTIL.localStorage.set('FORMATED_VIP_COOKIES', formatedCookies);
            return formatedCookies;
        } else {
            return STORAGE_UTIL.localStorage.get('FORMATED_VIP_COOKIES');
        }
    })();

    if (Object.getOwnPropertyNames(FORMATED_VIP_COOKIES).length !== NEEDED_VIP_COOKIES_KEYS.length) {
        if (confirm('哔哩哔哩番剧解锁：大会员 Cookie 不正确，脚本无法正常运行。是否查看详细使用说明？')) {
            location.href = 'https://logi.ml/script/unblocking-bilibili-without-perception.html';
        }
        return;
    }

    const saveUserCookie = callback => STORAGE_UTIL.cookie.set({ "expirationDate": 9999999999, "domain": ".bilibili.com", "httpOnly": false, "name": "CURRENT_QUALITY", "path": "/", "value": "116" },
        () => STORAGE_UTIL.cookie.list({}, cookies => {
            STORAGE_UTIL.localStorage.set('USER_COOKIES', cookies);
            let undeletedCookieCount = cookies.length;
            cookies.forEach(cookie => STORAGE_UTIL.cookie.delete({ name: cookie.name }, () => { if (--undeletedCookieCount <= 0) { callback(); } }));
        }));

    const setVipCookie = callback => {
        const userCookies = STORAGE_UTIL.localStorage.get('USER_COOKIES');
        let countOfCookies = NEEDED_VIP_COOKIES_KEYS.length;
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                userCookies.forEach(cookie => {
                    if (cookie.name === key) {
                        cookie.value = FORMATED_VIP_COOKIES[key];
                        STORAGE_UTIL.cookie.set(cookie, () => { if (--countOfCookies <= 0) callback(); });
                    }
                });
            }
        }
    };

    const recoverUserCookie = callback => {
        const userCookies = STORAGE_UTIL.localStorage.get('USER_COOKIES');
        let userCookieCount = userCookies.length;
        userCookies.forEach(cookie => STORAGE_UTIL.cookie.set(cookie, () => { if (--userCookieCount <= 0) { STORAGE_UTIL.localStorage.delete('USER_COOKIES'); callback(); } }));
    };

    const referrer = document.referrer;
    const sequence = () => saveUserCookie(() => setVipCookie(() => location.reload()));
    if (referrer.indexOf('/video/av') < 0
        && referrer.indexOf('/bangumi/play') < 0
        && STORAGE_UTIL.localStorage.get('USER_COOKIES') === null) {
        sequence();
    } else if ((location.href.indexOf('/bangumi/play' >= 0) || location.href.indexOf('/video/av' >= 0))
        && (referrer.indexOf('/video/av') >= 0 || referrer === location.href || referrer === '')
        && STORAGE_UTIL.localStorage.get('USER_COOKIES') === null) {
        sequence();
    } else {
        setTimeout(() => recoverUserCookie(() => {
            window.lastep = location.href;
            setInterval(() => {
                if (window.lastep !== location.href) {
                    window.lastep = location.href;
                    sequence();
                }
            }, 1000);
        }), 2000);
    }
})();