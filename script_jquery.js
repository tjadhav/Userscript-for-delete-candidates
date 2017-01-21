// ==UserScript==
// @name         Red-Green-Blue for Delete Candidates
// @namespace    https://github.com/tusharjadhav219/Userscript-for-delete-candidates
// @version      0.3
// @description  For https://gist.github.com/sotodel/0a2d92faa6c08192efed94fd4044a9cc.
// @author       Tushar
// @match        https://gist.github.com/sotodel/*
// @require      https://code.jquery.com/jquery-2.2.4.min.js
// @downloadURL  https://raw.githubusercontent.com/tusharjadhav219/Userscript-for-delete-candidates/master/script_jquery.js
// @updateURL    https://raw.githubusercontent.com/tusharjadhav219/Userscript-for-delete-candidates/master/script_jquery.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Open all links in new tab
    $('#readme a[href*="stackoverflow.com"]').attr('target', '_blank');

    var sendRequest = function(ids) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.stackexchange.com/2.2/questions/${ids.join(';')}?site=stackoverflow`,
            onload: function(res) {
                var response = JSON.parse(res.responseText);
                var questions = response.items;
                var now = +new Date();

                var questionIds = [];
                questions.forEach(function(question) {
                    var questionId = question.question_id;
                    questionIds.push(questionId);
                    var hoursSinceClosed = Math.abs(now - +new Date(question.closed_date * 1000)) / 36e5;
                    var style = {};
                    var $el = $(`#readme a[href*="/${questionId}/"]`);

                    if (question.closed_date === undefined) {
                        $el.css('color', 'gray').before(`<span style="color: red; font-weight: bold">[Reopened] </span>`);
                    } else if (hoursSinceClosed >= 48 || question.score <= -3) {
                        style = {
                            'font-weight': 'bold',
                            'font-style': 'italic',
                            'color': 'green'
                        };
                    } else {
                        style = {
                            'color': 'red'
                        };
                        $el.before(`<span style="color: gray;" title="Score">[${question.score} </span>|<span style="color: gray;" title="Hours remaining"> ~${48 - Math.ceil(hoursSinceClosed)} hr.] </span>`);
                    }

                    $el.css(style).text(question.title).addClass('deleteable');
                });

                $(`#readme a[href*="${ids.join('"], #readme a[href*="')}"]`).not(`#readme a[href*="${questionIds.join('"], #readme a[href*="')}"]`).css({
                    'background': '#f4eaea',
                    'text-decoration': 'line-through'
                });
            }
        });
    };

    var questionIds = $('#readme a[href*="stackoverflow.com"]').map(function() {
        return $(this).attr('href').match(/questions\/(\d+)\//)[1];
    }).get();

    while (questionIds.length) {
        sendRequest(questionIds.slice(0, 29));
        questionIds.splice(0, 29);
    }
}());
