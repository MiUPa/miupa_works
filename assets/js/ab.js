/*
 * miupa.jp A/Bテスト基盤（静的サイト用）
 *
 * 仕組み:
 * - 実験ごとにバリアント（A/B）を localStorage で固定割当する（同じ訪問者には常に同じ版を見せる）。
 * - 計測イベントは GA4 の gtag が存在すれば送信し、無ければ window.__abEvents に貯めるだけにする。
 *   → GA4（G-3Q0TK9GK8H）は 2026-11-23 に導入済み。実験1は同日開始。
 * - ストアへの導線クリック（.cta-store）も cta_click イベントとして記録する。
 *
 * 実験の始め方・実験案は運用記録（miupa-jp-optimization.md）参照。
 */
(function () {
    'use strict';

    var EXPERIMENTS = [
        {
            id: 'ext-mercari-copy-01',
            enabled: true, // 実験1: 2026-11-23 開始（GA4導入とサイト再構築に合わせて有効化）
            // A = 現行コピー（変更なし）, B = 書き換え案
            applyB: function () {
                var title = document.getElementById('ext-mercari-title');
                if (title) {
                    title.textContent = 'Amazonで買う前に、メルカリの中古価格をその場でチェック';
                }
                var cta = document.querySelector('a[data-store-link="mercari-compare"]');
                if (cta) {
                    cta.textContent = '無料で Chrome に追加';
                }
            }
        },
        {
            id: 'font-heading-01',
            enabled: true, // 実験2: 2026-11-25 開始。見出しフォント 明朝(A) vs ゴシック(B)
            // B = <html> に ab-font-gothic を付け、CSS 側のルールで見出しだけ本文と同じサンセリフに切り替える。
            applyB: function () {
                document.documentElement.classList.add('ab-font-gothic');
            }
        }
    ];

    function store(key, value) {
        try {
            if (value === undefined) return window.localStorage.getItem(key);
            window.localStorage.setItem(key, value);
        } catch (e) {
            return null;
        }
    }

    function assignVariant(expId) {
        var key = 'ab:' + expId;
        var v = store(key);
        if (v !== 'A' && v !== 'B') {
            v = Math.random() < 0.5 ? 'A' : 'B';
            store(key, v);
        }
        return v;
    }

    function track(eventName, params) {
        var payload = { event: eventName, params: params || {}, ts: Date.now() };
        window.__abEvents = window.__abEvents || [];
        window.__abEvents.push(payload);
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, params || {});
        }
    }

    var activeVariants = {};
    EXPERIMENTS.forEach(function (exp) {
        if (!exp.enabled) return;
        var variant = assignVariant(exp.id);
        activeVariants[exp.id] = variant;
        if (variant === 'B' && typeof exp.applyB === 'function') {
            exp.applyB();
        }
        track('ab_exposure', { experiment_id: exp.id, variant: variant });
    });

    document.querySelectorAll('a.cta-store').forEach(function (a) {
        a.addEventListener('click', function () {
            track('cta_click', {
                store_link: a.getAttribute('data-store-link') || '',
                variants: JSON.stringify(activeVariants)
            });
        });
    });

    window.__ab = { experiments: EXPERIMENTS, variants: activeVariants, track: track };
})();
