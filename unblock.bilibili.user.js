// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.1.9.2
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
    // 请务必清空哔哩哔哩 Cookie 和 localStorage 重新登录后再使用。
    const ORIGINAL_VIP_COOKIES = "";

    // 下行双引号里的数字用于控制画质，从高到低依次为 116，112，80，64，32，16，自适应对应 0。
    const CURRENT_QUALITY = "0";

    const NEEDED_VIP_COOKIES_KEYS = ['bili_jct', 'DedeUserID', 'DedeUserID__ckMd5', 'sid', 'SESSDATA', 'CURRENT_QUALITY'];
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
    const OPERATION_UTIL = {
        isLocked: () => STORAGE_UTIL.localStorage.get('OPRATION_LOCK'),
        lock: () => STORAGE_UTIL.localStorage.set('OPRATION_LOCK', true),
        unlock: () => STORAGE_UTIL.localStorage.delete('OPRATION_LOCK')
    };

    const FORMATED_VIP_COOKIES = (() => {
        let formatedCookies = {};
        if (ORIGINAL_VIP_COOKIES !== "") {
            const cookies = ORIGINAL_VIP_COOKIES.split('; ');
            cookies.forEach(cookie => {
                const kv = cookie.split('=');
                if (NEEDED_VIP_COOKIES_KEYS.indexOf(kv[0]) >= 0) {
                    formatedCookies[kv[0]] = kv[1];
                }
            });
        } else {
            formatedCookies = STORAGE_UTIL.localStorage.get('FORMATED_VIP_COOKIES') || formatedCookies;
        }
        formatedCookies.CURRENT_QUALITY = CURRENT_QUALITY;
        const player_settings = STORAGE_UTIL.localStorage.get('bilibili_player_settings') || { setting_config: {} };
        player_settings.setting_config.defquality = parseInt(CURRENT_QUALITY);
        STORAGE_UTIL.localStorage.set('FORMATED_VIP_COOKIES', formatedCookies);
        STORAGE_UTIL.localStorage.set('bilibili_player_settings', player_settings);
        return formatedCookies;
    })();

    if (Object.getOwnPropertyNames(FORMATED_VIP_COOKIES).length !== NEEDED_VIP_COOKIES_KEYS.length) {
        if (confirm('哔哩哔哩番剧解锁：大会员 Cookie 不正确，脚本无法正常运行，是否查看详细使用说明？')) {
            location.href = 'https://logi.im/script/unblocking-bilibili-without-perception.html';
        }
        return;
    }

    const saveUserCookie = callback => STORAGE_UTIL.cookie.list({}, cookies => {
        if (!document.cookie.includes('CURRENT_QUALITY')) {
            cookies.push({ "name": "CURRENT_QUALITY", "domain": ".bilibili.com", "path": "/", "value": CURRENT_QUALITY });
        }
        STORAGE_UTIL.localStorage.set('USER_COOKIES', cookies);
        let countOfCookies = cookies.length;
        cookies.forEach(cookie => STORAGE_UTIL.cookie.delete({ name: cookie.name }, () => { if (--countOfCookies <= 0) callback(); }));
    });

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
        let countOfCookies = userCookies.length;
        userCookies.forEach(cookie => STORAGE_UTIL.cookie.set(cookie, () => { if (--countOfCookies <= 0) { STORAGE_UTIL.localStorage.delete('USER_COOKIES'); callback(); } }));
    };

    const referrer = document.referrer;
    const sequence = () => {
        if (OPERATION_UTIL.isLocked()) return;
        OPERATION_UTIL.lock();
        saveUserCookie(() => setVipCookie(() => { OPERATION_UTIL.unlock(); location.reload(); }))
    };
    if (STORAGE_UTIL.localStorage.get('USER_COOKIES') === null
        && (referrer.indexOf('/video/av') >= 0 || referrer === location.href ||
            (referrer.indexOf('/video/av') < 0 && referrer.indexOf('/bangumi/play') < 0)
        )
    ) {
        sequence();
    } else {
        if (OPERATION_UTIL.isLocked()) return;
        OPERATION_UTIL.lock();
        setTimeout(() => {
            recoverUserCookie(() => {
                ['.r-con', '.plp-r'].forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) el.addEventListener('click', sequence);
                });
                OPERATION_UTIL.unlock();
            });
        }, 300);
    }
})();
