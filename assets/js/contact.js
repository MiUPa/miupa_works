/* miupa.jp — contact form.
   Posts natively to the Google Form backend (formResponse endpoint).
   mode:"no-cors" makes the response opaque, so success is shown
   optimistically when the request resolves; network failures show
   an error pointing at the fallback Google Form link. */
(function () {
    'use strict';

    var form = document.getElementById('contact-form');
    if (!form) return;

    var ENDPOINT = 'https://docs.google.com/forms/d/e/1FAIpQLSd_hIBHaibkUGzNusEB7nSvlL5KyfgrsCLbS2_IiiWcCk0J3Q/formResponse';
    var ENTRY = {
        type: 'entry.191184380',     // 種別
        name: 'entry.298176938',     // お名前
        email: 'entry.88747827',     // 返信用メールアドレス
        message: 'entry.1265614861'  // お問い合わせ内容
    };
    var FBZX = '1390385662613740558';
    var MIN_FILL_MS = 2000;

    var renderedAt = Date.now();
    var errorEl = document.getElementById('cf-error');
    var submitBtn = document.getElementById('cf-submit');
    var messageEl = document.getElementById('cf-message');

    function showThanks() {
        var p = document.createElement('p');
        p.className = 'form-thanks';
        p.setAttribute('role', 'status');
        p.textContent = '送信しました。ありがとうございます。';
        form.replaceWith(p);
    }

    function showError(text) {
        errorEl.textContent = text;
        errorEl.hidden = false;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        errorEl.hidden = true;

        var message = messageEl.value.trim();
        if (!message) {
            showError('お問い合わせ内容を入力してください。');
            messageEl.focus();
            return;
        }

        /* Bot checks: honeypot field filled, or submitted faster than
           a human could type. Pretend success and send nothing. */
        var honeypot = form.querySelector('input[name="cf-website"]');
        if ((honeypot && honeypot.value) || Date.now() - renderedAt < MIN_FILL_MS) {
            showThanks();
            return;
        }

        var params = new URLSearchParams();
        var type = form.querySelector('input[name="cf-type"]:checked');
        if (type) params.append(ENTRY.type, type.value);
        var name = document.getElementById('cf-name').value.trim();
        if (name) params.append(ENTRY.name, name);
        var email = document.getElementById('cf-email').value.trim();
        if (email) params.append(ENTRY.email, email);
        params.append(ENTRY.message, message);
        params.append('fvv', '1');
        params.append('pageHistory', '0');
        params.append('fbzx', FBZX);

        submitBtn.disabled = true;
        submitBtn.textContent = '送信中…';

        fetch(ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        }).then(function () {
            showThanks();
        }).catch(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = '送信する';
            showError('送信できませんでした。お手数ですが、下記のリンク先フォームからお送りください。');
        });
    });
})();
