// ==UserScript==
// @name                哔哩解析辅助
// @namespace           https://github.com/vcheckzen/UnblockBilibiliAssistant
// @version             0.0.1
// @icon                https://www.bilibili.com/favicon.ico
// @description         为哔哩视频注入一键解析按钮
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibiliAssistant/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibiliAssistant
//  @include            *2333.com*
// @match               *.bilibili.com/video/av*
// @match               *.bilibili.com/bangumi/play*
// @run-at              document-end
// ==/UserScript==

(() => {
    'use strict';

    if (location.host === '2333.com' && box) {
        const from = new URLSearchParams(location.search).get('from');
        if (from && /.+(av|ep)\d+/.test(from) && localStorage.getItem('token')) {
            box.originalUrl = from;
        }
        return;
    }

    const elemWaitor = [];
    const rightLists = ['.r-con', '.plp-r'];

    const payVideo = function () {
        if (typeof __PGC_USERSTATE__ !== 'undefined'
            && __PGC_USERSTATE__.hasOwnProperty('dialog')
            && __PGC_USERSTATE__.dialog.hasOwnProperty('btn_left')) {
            return true;
        }
        return false;
    };

    const redirectToAnalysisServer = function () {
        let analysisServer = 'http://2333.com/?from=';
        if (/.+(ep|av)\d+.+/.test(location.href)) {
            analysisServer += location.href.split('?')[0]
        } else if (/.+ss\d+.+/.test(location.href)) {
            analysisServer += 'https://www.bilibili.com/bangumi/play/ep' + __PGC_USERSTATE__.progress.last_ep_id;
        }
        window.open(analysisServer);
    };

    const waitElement = function (selector, callback, interval, timeout) {
        interval = interval || 100;
        timeout = timeout || 10000;
        var flag = true;
        var elem = null;
        var waiterId = Date.now();
        elemWaitor[waiterId] = setInterval(() => {
            elem = document.querySelector(selector);
            if (flag && elem) {
                flag = false;
                if (!payVideo()) {
                    callback(elem);
                }
                clearInterval(elemWaitor[waiterId]);
            }
        }, interval);
        setTimeout(() => clearInterval(elemWaitor[waiterId]), timeout);
    };

    const registerAnalysisButton = function registerAnalysisButton() {
        const hintText = '一键解析';
        waitElement('.twp-btn.right.vip', elem => {
            elem.innerHTML = hintText;
            elem.addEventListener('click', redirectToAnalysisServer);
        });
        waitElement('.bilibili-player-video-top-follow.bilibili-player-show', elem => {
            if (!document.querySelector('#btn-anls')) {
                elem.parentElement.insertBefore(document.createRange().createContextualFragment(
                    `<div id="btn-anls" class="${elem.className}"><span style="margin: 0 1em;">${hintText}</span></div>`
                ).firstElementChild, elem);
                document.querySelector('#btn-anls').addEventListener('click', redirectToAnalysisServer);
            }
        }, 100);

        rightLists.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.addEventListener('click', registerAnalysisButton);
            }
        });
    };

    registerAnalysisButton();
})();
