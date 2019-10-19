// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.0.3
// @icon                https://www.bilibili.com/favicon.ico
// @description         大会员账号共享解锁脚本
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @include             https://www.bilibili.com/video/av*
// @include             https://www.bilibili.com/bangumi/play/*
// @run-at              document-start
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

    const setCookie = (name, value, expirationDate) => {
        GM.cookie.set({
            name: name,
            value: value,
            domain: '.bilibili.com',
            path: '/',
            expirationDate: expirationDate,
            httpOnly: true
        }, null);
    };

    const changeCookies = () => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: key }).then(cookies => {
                    if (cookies[0].value != FORMATED_VIP_COOKIES[key]) {
                        setCookie(key + 'COPY', cookies[0].value, cookies[0].expirationDate);
                        setCookie(key, FORMATED_VIP_COOKIES[key], cookies[0].expirationDate);
                    }
                });
            }
        }
    };

    const recoverCookies = () => {
        for (const key in FORMATED_VIP_COOKIES) {
            if (FORMATED_VIP_COOKIES.hasOwnProperty(key)) {
                GM.cookie.list({ name: key + 'COPY' }).then(cookies => {
                    if (cookies[0].value != '') {
                        setCookie(key, cookies[0].value, cookies[0].expirationDate);
                        setCookie(key + 'COPY');
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
