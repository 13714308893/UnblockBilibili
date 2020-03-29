// ==UserScript==
// @name                哔哩哔哩解析辅助
// @namespace           https://github.com/vcheckzen/UnblockBilibili/blob/master/loliloli.user.js
// @version             0.0.6.5
// @icon                https://www.bilibili.com/favicon.ico
// @description         为哔哩哔哩视频注入一键解析按钮
// @author              https://github.com/vcheckzen
// @supportURL          https://github.com/vcheckzen/UnblockBilibili/issues
// @contributionURL     https://github.com/vcheckzen/UnblockBilibili
// @include             *2333.com*
// @include             *bilibili.com/video/bv1*
// @include             *bilibili.com/bangumi/play*
// @run-at              document-end
// ==/UserScript==

(() => {
    'use strict';

    const LOLILOLI_PORT = 2333;

    if (location.host === `2333.com:${LOLILOLI_PORT}` && box) {
        const sp = new URLSearchParams(location.search);
        const from = sp.get('from'), p = sp.get('p');
        if (from && /.+(BV1|ep)\w+/.test(from) && localStorage.getItem('token')) {
            box.originalUrl = from + (p ? '?p=' + p : '');
        }
        return;
    }

    const rightLists = ['.r-con', '.plp-r'];

    const payVideo = function () {
        if (/.+(ep|ss)\d+.+/.test(location.href)
            && __INITIAL_STATE__.mediaInfo.payMent.vipDiscount !== 1) {
            return true;
        }
        return false;
    };


    const redirectToAnalysisServer = function () {
        const bilibiliHost = 'https://www.bilibili.com/'
        let analysisServer = `http://2333.com:${LOLILOLI_PORT}/?from=`;
        if (/.+ep\d+.+/.test(location.href)) {
            analysisServer += location.href.split('?')[0];
        } else if (/.+ss\d+.+/.test(location.href)) {
            let id = __INITIAL_STATE__.epInfo.id
            if (__PGC_USERSTATE__.hasOwnProperty('progress')) {
                id = __PGC_USERSTATE__.progress.last_ep_id;
            }
            analysisServer += bilibiliHost + 'bangumi/play/ep' + id;
        } else if (/.+BV1\w+.+/.test(location.href)) {
            const p = new URLSearchParams(location.search).get('p');
            analysisServer += bilibiliHost + 'video/' + __INITIAL_STATE__.videoData.bvid + (p ? '&p=' + p : '');
        }
        window.open(analysisServer);
    };

    const waitElement = function (selector, callback, fail, interval, timeout) {
        interval = interval || 500;
        timeout = timeout || 10000;
        let elem = null, iWaitor = null, tWaitor = null;
        iWaitor = setInterval(() => {
            elem = document.querySelector(selector);
            if (elem) {
                clearInterval(iWaitor);
                clearTimeout(tWaitor);
                if (!payVideo()) {
                    callback(elem);
                }
            }
        }, interval);
        tWaitor = setTimeout(() => {
            clearInterval(iWaitor);
            clearTimeout(tWaitor);
            if (typeof fail === 'function') {
                fail();
            }
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
