// ==UserScript==
// @name                哔哩哔哩解析辅助
// @namespace           https://github.com/vcheckzen/UnblockBilibili/blob/master/loliloli.user.js
// @version             0.0.3
// @icon                https://www.bilibili.com/favicon.ico
// @description         为哔哩哔哩视频注入一键解析按钮
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @include             *2333.com*
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
            let id = __INITIAL_STATE__.epInfo.id
            if (__PGC_USERSTATE__.hasOwnProperty('progress')) {
                id = __PGC_USERSTATE__.progress.last_ep_id;
            }
            analysisServer += 'https://www.bilibili.com/bangumi/play/ep' + id;
        }
        window.open(analysisServer);
    };

    const waitElement = function (selector, callback, fail, interval, timeout) {
        interval = interval || 100;
        timeout = timeout || 8000;
        let flag = true;
        let elem = null;
        const waiterId = Date.now();
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
        setTimeout(() => {
            if (typeof fail === 'function') {
                fail();
            }
            clearInterval(elemWaitor[waiterId]);
        }, timeout);
    };

    const registerAnalysisButton = function registerAnalysisButton() {
        const hintText = '解析';
        waitElement('.twp-btn.right.vip', elem => {
            const cloneNode = elem.cloneNode(true);
            cloneNode.innerHTML = '一键' + hintText;
            cloneNode.onclick = redirectToAnalysisServer;
            elem.parentElement.replaceChild(cloneNode, elem);
        });
        if (!document.head.querySelector('#style-loliloli')) {
            document.head.append(document.createRange().createContextualFragment(
                `<style id="style-loliloli">
                    .btn-anls {
                        pointer-events: all;
                        z-index: 2;
                        margin: 18px -16px 0 0;
                        line-height: 24px;
                        border-radius: 12px;
                        cursor: pointer;
                        background: rgba(33,33,33, .9);
                    }
                </style>`
            ).firstElementChild);
        }
        waitElement('.bilibili-player-video-top-issue', elem => {
            if (document.querySelector('.btn-anls')) return;
            elem.parentElement.insertBefore(document.createRange().createContextualFragment(
                `<div class="btn-anls"><span style="margin: 0 2em;">${hintText}</span></div>`
            ).firstElementChild, elem);
            document.querySelector('.btn-anls').addEventListener('click', redirectToAnalysisServer);
        });

        rightLists.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.addEventListener('click', registerAnalysisButton);
            }
        });
    };

    registerAnalysisButton();
})();
