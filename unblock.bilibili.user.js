// ==UserScript==
// @name                哔哩哔哩番剧解锁
// @namespace           https://github.com/vcheckzen/UnblockBilibili
// @version             0.0.1
// @icon                https://www.bilibili.com/favicon.ico
// @description         哔哩哔哩番剧解锁
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @include             https://www.bilibili.com/video/av*
// @include             https://www.bilibili.com/bangumi/play/*
// @run-at              document-end
// @grant               GM.cookie
// ==/UserScript==

(function () {
    'use strict';
    const VIP_SESSDATA = '';

    const setCookie = (name, value, expirationDate) => {
        GM.cookie.set({ name: name, value: value, domain: '.bilibili.com', path: '/', expirationDate: expirationDate, httpOnly: true }, error => {
            console.log(error || name + ' setted');
        });
    };

    const crack = () => {
        if (location.href === window.lastep) {
            return;
        }
        window.lastep = location.href;
        GM.cookie.list({ name: 'SESSDATACOPY' }).then(cookies => {
            if (cookies[0] && cookies[0].value) {
                setCookie('SESSDATA', cookies[0].value, cookies[0].expirationDate);
                setCookie('SESSDATACOPY');
            } else {
                GM.cookie.list({ name: 'SESSDATA' }).then(cookies => {
                    if (cookies[0]) {
                        setCookie('SESSDATACOPY', cookies[0].value, cookies[0].expirationDate);
                        setCookie('SESSDATA', VIP_SESSDATA, cookies[0].expirationDate);
                        location.reload();
                    }
                });
            }
        });
    }

    window.lastep;
    setInterval(() => crack(), 2000);
})();