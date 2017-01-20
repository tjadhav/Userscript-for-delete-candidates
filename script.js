// ==UserScript==
// @name         Red-Green-Blue for Delete Candidates
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  For https://gist.github.com/sotodel/0a2d92faa6c08192efed94fd4044a9cc.
// @author       Tushar
// @match        https://gist.github.com/sotodel/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    var setColor = function(questionId, color) {
        document.querySelector(`#readme a[href*="/${questionId}/"]`).style.color = color;
    };

    var showVoteCount = function(questionId, score) {
        document.querySelector(`#readme a[href*="/${questionId}/"]`).insertAdjacentHTML('beforebegin', `<span style="color: gray;" title="Score"> ${score} </span>`);
    };

    var sendRequest = function(ids) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.stackexchange.com/2.2/questions/${ids.join(';')}?site=stackoverflow`,
            onload: function(res) {
                var response = JSON.parse(res.responseText);
                var questions = response.items;
                var now = +new Date();

                questions.forEach(function(question) {
                    var hoursSinceClosed = Math.abs(now - +new Date(question.closed_date * 1000)) / 36e5;

                    if (hoursSinceClosed >= 48 || question.score <= -3) {
                        setColor(question.question_id, 'green');
                    } else {
                        setColor(question.question_id, 'red');
                        showVoteCount(question.question_id, question.score);
                    }
                });
            }
        });
    };

    var links = document.querySelectorAll('#readme a[href*="stackoverflow.com"]');

    var questionIds = Array.from(links).map(q => q.href.match(/questions\/(\d+)\//)[1]);

    while (questionIds.length) {
        sendRequest(questionIds.slice(0, 29));
        questionIds.splice(0, 29);
    }
}());
