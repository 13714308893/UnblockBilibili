// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.1.6
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
    const VIP_COOKIES = "";

    const VIP_COOKIES_KEYS = ['SESSDATA', '_uuid', 'CURRENT_QUALITY'];
    const FORMATED_VIP_COOKIES = (() => {
        let formatedCookies = {};
        const cookies = VIP_COOKIES.split('; ');
        cookies.forEach(cookie => {
            const kv = cookie.split('=');
            if (VIP_COOKIES_KEYS.indexOf(kv[0]) >= 0) {
                formatedCookies[kv[0]] = kv[1];
            }
        });
        formatedCookies.CURRENT_QUALITY = '116';
        return formatedCookies;
    })();
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
        }).then(() => typeof callback === 'function' ? callback() : null);
    };

    const changeCookies = (callback) => {
        const realChange = (key, cookie) => {
            if (cookie && cookie.value !== FORMATED_VIP_COOKIES[key]) {
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
                    () => --countOfCookies <= 0 ? callback() : null
                );
            }
        };
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: key })
                    .then(cookies => realChange(key, cookies[0]));
            }
        }
    };

    const recoverCookies = (callback) => {
        const realRecover = (key, cookie) => {
            if (cookie && cookie.value !== '') {
                setCookie(key,
                    cookie.value,
                    cookie.domain,
                    cookie.path,
                    cookie.expirationDate,
                    cookie.httpOnly
                );
                GM.cookie.delete({ name: 'COPY_' + key + '_COPY' }).then(callback);
            }
        };
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: 'COPY_' + key + '_COPY' })
                    .then(cookies => realRecover(key, cookies[0]));
            }
        }
    };

    const deleteExtraCookies = (callback) => {
        const realDelete = (name, undeletedCookieCount) => GM.cookie.delete({ name: name }).then(() => undeletedCookieCount <= 0 ? callback() : null);
        GM.cookie.list({}).then(cookies => {
            if (cookies.length > 0) {
                let undeletedCookieCount = cookies.length - VIP_COOKIES_KEYS.length;
                for (let i = 0; i < cookies.length; i++) {
                    if (VIP_COOKIES_KEYS.indexOf(cookies[i].name) < 0) {
                        realDelete(cookies[i].name, --undeletedCookieCount);
                    }
                }
            }
        });
    };

    const referrer = document.referrer;
    const initial = () => deleteExtraCookies(() => changeCookies(() => location.reload()));
    if (referrer.indexOf('/video/av') < 0
        && referrer.indexOf('/bangumi/play') < 0
        && document.cookie.indexOf('COPY_') < 0) {
        initial();
    } else if ((location.href.indexOf('/bangumi/play' >= 0) || location.href.indexOf('/video/av' >= 0))
        && (referrer.indexOf('/video/av') >= 0 || referrer === location.href || referrer === '')
        && document.cookie.indexOf('COPY_') < 0) {
        initial();
    } else {
        setTimeout(() => recoverCookies(() => {
            window.lastep = location.href;
            setInterval(() => {
                if (window.lastep !== location.href) {
                    window.lastep = location.href;
                    countOfCookies = COOKIE_COUNT;
                    initial();
                }
            }, 1000);
        }), 2000);
    }
})();