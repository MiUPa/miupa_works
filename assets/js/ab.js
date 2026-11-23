/*
 * miupa.jp A/Bテスト基盤（静的サイト用）
 *
 * 仕組み:
 * - 実験ごとにバリアント（A/B）を localStorage で固定割当する（同じ訪問者には常に同じ版を見せる）。
 * - 計測イベントは GA4 の gtag が存在すれば送信し、無ければ window.__abEvents に貯めるだけにする。
 *   → GA4 導入（測定IDの設定）が済むまで、実験は enabled:false で眠らせておく。
 * - ストアへの導線クリック（.cta-store）も cta_click イベントとして記録する。
 *
 * 実験の始め方・実験案は運用記録（miupa-jp-optimization.md）参照。
 */
(function () {
    'use strict';

    var EXPERIMENTS = [
        {
            id: 'ext-mercari-copy-01',
            enabled: false, // GA4 導入後に true にして開始する
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
