// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.0.5
// @icon                https://www.bilibili.com/favicon.ico
// @description         大会员账号共享解锁脚本
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @include             https://www.bilibili.com/video/av*
// @include             https://www.bilibili.com/bangumi/play/*
// @run-at              document-end
// @grant               GM.cookie
// ==/UserScript==

(() => {
    'use strict';
    const VIP_COOKIES = '';

    const formatCookies = () => {
        let formatedCookies = {};
        const cookies = VIP_COOKIES.split('; ');
        cookies.forEach(cookie => {
            const kv = cookie.split('=');
            formatedCookies[kv[0]] = kv[1];
        });
        return formatedCookies;
    };

    const FORMATED_VIP_COOKIES = formatCookies();

    const setCookie = (name, value, domain, path, expirationDate, httpOnly) => {
        GM.cookie.set({
            name: name,
            value: value,
            domain: domain,
            path: path,
            expirationDate: expirationDate,
            httpOnly: httpOnly
        }, null);
    };

    const changeCookies = () => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: key }).then(cookies => {
                    if (cookies[0].value != FORMATED_VIP_COOKIES[key]) {
                        setCookie('COPY_' + key + '_COPY', cookies[0].value, cookies[0].domain, cookies[0].path, cookies[0].expirationDate, cookies[0].httpOnly);
                        setCookie(key, FORMATED_VIP_COOKIES[key], cookies[0].domain, cookies[0].path, cookies[0].expirationDate, cookies[0].httpOnly);
                    }
                });
            }
        }
    };

    const recoverCookies = () => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: 'COPY_' + key + '_COPY' }).then(cookies => {
                    if (cookies[0].value != '') {
                        setCookie(key, cookies[0].value, cookies[0].domain, cookies[0].path, cookies[0].expirationDate, cookies[0].httpOnly);
                        GM.cookie.delete({ name: 'COPY_' + key + '_COPY' }, null);
                    }
                });
            }
        }
    };


    changeCookies();
    setTimeout(() => {
        if (document.referrer.indexOf('/video/av') < 0 && document.referrer.indexOf('/bangumi/play/') < 0) {
            location.reload();
        } else {
            recoverCookies();
            window.lastep = location.href;
            setInterval(() => {
                if (window.lastep != location.href) {
                    changeCookies();
                    setTimeout(() => location.reload(), 1000);
                }
            }, 1000);
        }
    }, 1000);
})();