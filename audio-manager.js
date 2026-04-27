/**
 * にこにこどうぶつらんど 共通オーディオマネージャー
 * Web Audio APIでSEを動的生成、<audio>でBGMを管理。
 * BGMはページ遷移をまたいでlocalStorageで再生位置を保持し、シームレス風に継続させる。
 */
const AudioManager = {
    ctx: null,
    bgm: null,
    bgmEnabled: false,
    _bgmReady: false,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.initBGM();
    },

    // BGMの初期化（再生はしない、セットアップのみ）
    initBGM() {
        if (this._bgmReady) return;
        this._bgmReady = true;

        this.bgm = new Audio('./natsuyasuminotanken.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.2;
        this.bgm.preload = 'auto';

        // localStorageの再生位置を復元（メタデータが揃ってから）
        this.bgm.addEventListener('loadedmetadata', () => {
            const savedTime = parseFloat(localStorage.getItem('bgmTime') || '0');
            if (savedTime > 0 && savedTime < this.bgm.duration) {
                try { this.bgm.currentTime = savedTime; } catch(e) {}
            }
        }, { once: true });

        // 0.5秒ごと + ページ離脱時に現在位置を保存
        setInterval(() => {
            if (this.bgm && !this.bgm.paused) {
                localStorage.setItem('bgmTime', this.bgm.currentTime.toString());
            }
        }, 500);
        const persist = () => {
            if (this.bgm && !this.bgm.paused) {
                localStorage.setItem('bgmTime', this.bgm.currentTime.toString());
            }
        };
        window.addEventListener('pagehide', persist);
        window.addEventListener('beforeunload', persist);

        this.bgmEnabled = localStorage.getItem('bgmEnabled') === 'true';
    },

    // BGMトグル（メニュー画面のボタンが使う）
    // 実際のpause状態を見て切り替えるので、自動再生中の挙動とぶつからない
    toggleBGM() {
        this.init();
        if (this.bgm.paused) {
            this.bgm.play().catch(() => {});
            this.bgmEnabled = true;
        } else {
            this.bgm.pause();
            this.bgmEnabled = false;
        }
        localStorage.setItem('bgmEnabled', this.bgmEnabled);
        return this.bgmEnabled;
    },

    // ゲーム画面用: ページ遷移後にBGMが有効ならユーザー操作を待って再開
    autoResumeBGM() {
        this.initBGM();
        if (!this.bgmEnabled || !this.bgm) return;

        const tryPlay = () => {
            if (this.bgmEnabled && this.bgm && this.bgm.paused) {
                this.bgm.play().catch(() => {});
            }
        };
        // まずダメ元で（ユーザージェスチャ文脈ならそのまま再生される）
        tryPlay();
        // ダメだった場合に備えて最初のタッチ/クリックで再生
        // BGMトグルボタン自体へのタップは除外（toggleBGMと競合するため）
        const onFirst = (e) => {
            if (e.target && e.target.closest && e.target.closest('#bgm-toggle')) return;
            tryPlay();
            window.removeEventListener('touchstart', onFirst);
            window.removeEventListener('mousedown', onFirst);
        };
        window.addEventListener('touchstart', onFirst);
        window.addEventListener('mousedown', onFirst);
    },

    isPlaying() {
        return !!(this.bgm && !this.bgm.paused);
    },

    getBGMState() {
        return localStorage.getItem('bgmEnabled') === 'true';
    },

    // ぽよん（選択・ボタン押し）
    playPoyon() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },

    // ぴんぽーん（正解）
    playCorrect() {
        this.init();
        const now = this.ctx.currentTime;
        this._note(659.25, now, 0.1, 'sine'); // E5
        this._note(523.25, now + 0.15, 0.5, 'sine'); // C5
    },

    // ぽよん？（不正解）
    playWrong() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    },

    // てってれ〜！（全クリア）
    playClear() {
        this.init();
        const now = this.ctx.currentTime;
        const tempo = 0.12;
        this._note(523.25, now, tempo, 'triangle');
        this._note(523.25, now + tempo, tempo, 'triangle');
        this._note(523.25, now + tempo * 2, tempo, 'triangle');
        this._note(659.25, now + tempo * 3, tempo * 4, 'triangle');
    },

    _note(freq, start, duration, type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
        gain.gain.linearRampToValueAtTime(0, start + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
    }
};

// 全ページで自動再開を試みる（メニュー画面も含む）
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        AudioManager.autoResumeBGM();
    });
}
