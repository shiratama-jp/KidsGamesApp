/**
 * にこにこどうぶつらんど 共通オーディオマネージャー
 * Web Audio APIでSEを動的生成、<audio>でBGMを管理。
 * BGMは「はじめる」ボタン押下時に開始し、ゲームクリア時にフェードアウト停止する。
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

    initBGM() {
        if (this._bgmReady) return;
        this._bgmReady = true;

        this.bgm = new Audio('./natsuyasuminotanken.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.2;
        this.bgm.preload = 'auto';

        this.bgmEnabled = localStorage.getItem('bgmEnabled') === 'true';
    },

    // ゲーム開始時にBGMを再生（「はじめる」ボタンから呼ぶ）
    startBGM() {
        this.init();
        if (!this.bgmEnabled || !this.bgm) return;
        this.bgm.currentTime = 0;
        this.bgm.volume = 0.2;
        this.bgm.play().catch(() => {});
    },

    // ゲームクリア時にBGMをフェードアウトして停止
    stopBGM(fadeMs = 1000) {
        if (!this.bgm || this.bgm.paused) return;
        if (fadeMs <= 0) {
            this.bgm.pause();
            return;
        }
        const startVol = this.bgm.volume;
        const steps = 20;
        const interval = fadeMs / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            this.bgm.volume = Math.max(0, startVol * (1 - step / steps));
            if (step >= steps) {
                clearInterval(timer);
                this.bgm.pause();
                this.bgm.volume = startVol;
            }
        }, interval);
    },

    // BGMトグル（メニュー画面専用: グローバル設定を変更する）
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

    // ローカルトグル（各ゲーム画面専用: 今の画面の再生/停止のみ、グローバル設定は変更しない）
    localToggleBGM() {
        this.init();
        if (this.bgm.paused) {
            this.bgm.play().catch(() => {});
        } else {
            this.bgm.pause();
        }
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
        this._note(659.25, now, 0.1, 'sine');
        this._note(523.25, now + 0.15, 0.5, 'sine');
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
