// ============================================================================
// SISTEMA DE ÁUDIO PROCEDURAL (WEB AUDIO API) - ESTILO NINTENDO SWITCH & ANIME
// Leve, zero arquivos pesados externos, compatível com qualquer PC e navegador
// ============================================================================

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.currentMood = 'campus'; // 'campus', 'romance', 'challenge', 'victory'
        this.bgmTimer = null;
        this.stepIndex = 0;
        this.volume = 0.35;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopBGM();
        } else {
            this.startBGM(this.currentMood);
        }
        return this.muted;
    }

    playTone(freq, type = 'sine', duration = 0.15, vol = 0.2, delay = 0, slideTo = null) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
        }

        const finalVol = Math.min(1, vol * this.volume * 2);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(finalVol, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.02);
    }

    // Efeitos Sonoros estilo Nintendo Switch UI
    playClick() {
        this.playTone(880, 'sine', 0.06, 0.15, 0, 1100);
        this.playTone(1320, 'triangle', 0.05, 0.1, 0.03);
    }

    playSwitchSnap() {
        this.playTone(320, 'triangle', 0.03, 0.2, 0, 180);
        this.playTone(1480, 'sine', 0.06, 0.22, 0.025, 1760);
    }

    playConfirm() {
        this.playTone(587.33, 'triangle', 0.1, 0.18, 0);
        this.playTone(880, 'sine', 0.18, 0.22, 0.07);
    }

    playCancel() {
        this.playTone(523.25, 'sine', 0.08, 0.15, 0);
        this.playTone(392.00, 'triangle', 0.14, 0.15, 0.06);
    }

    playPickup() {
        this.playTone(659.25, 'sine', 0.09, 0.18, 0);
        this.playTone(830.61, 'sine', 0.09, 0.18, 0.06);
        this.playTone(987.77, 'sine', 0.12, 0.2, 0.12);
        this.playTone(1318.5, 'triangle', 0.22, 0.24, 0.18);
    }

    playHeartUp() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((n, i) => {
            this.playTone(n, 'sine', 0.18, 0.2, i * 0.065);
        });
    }

    playHeartBreak() {
        this.playTone(392, 'sawtooth', 0.18, 0.12, 0, 330);
        this.playTone(311.13, 'sawtooth', 0.28, 0.12, 0.15, 220);
    }

    playMentorChime() {
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((n, i) => {
            this.playTone(n, 'triangle', 0.22, 0.16, i * 0.08);
        });
    }

    playStageClear() {
        const fanfare = [
            { f: 523.25, d: 0.14, t: 0 },
            { f: 659.25, d: 0.14, t: 0.13 },
            { f: 783.99, d: 0.14, t: 0.26 },
            { f: 1046.50, d: 0.28, t: 0.39 },
            { f: 880.00, d: 0.16, t: 0.68 },
            { f: 1046.50, d: 0.55, t: 0.85 }
        ];
        fanfare.forEach(n => this.playTone(n.f, 'triangle', n.d, 0.24, n.t));
    }

    startBGM(mood = 'campus') {
        this.currentMood = mood;
        if (this.muted) return;
        this.init();
        if (this.bgmTimer) clearInterval(this.bgmTimer);
        this.bgmPlaying = true;
        this.stepIndex = 0;

        // Escalas suaves estilo Visual Novel japonesa (acordes arpejados)
        const progressions = {
            campus: [
                [523.25, 659.25, 783.99, 987.77], // Cmaj7
                [440.00, 523.25, 659.25, 783.99], // Am7
                [349.23, 440.00, 523.25, 659.25], // Fmaj7
                [392.00, 493.88, 587.33, 783.99]  // G6
            ],
            romance: [
                [587.33, 739.99, 880.00, 1108.73], // Dmaj7
                [493.88, 587.33, 739.99, 880.00],  // Bm7
                [392.00, 493.88, 587.33, 739.99],  // Gmaj7
                [440.00, 554.37, 659.25, 880.00]   // A6
            ],
            challenge: [
                [440.00, 523.25, 659.25, 880.00],
                [349.23, 440.00, 523.25, 698.46],
                [392.00, 493.88, 587.33, 783.99],
                [329.63, 415.30, 493.88, 659.25]
            ]
        };

        const tempoMs = mood === 'challenge' ? 280 : (mood === 'romance' ? 420 : 350);

        this.bgmTimer = setInterval(() => {
            if (this.muted || !this.bgmPlaying) return;
            const prog = progressions[this.currentMood] || progressions.campus;
            const chordIdx = Math.floor(this.stepIndex / 4) % prog.length;
            const noteIdx = this.stepIndex % 4;
            const chord = prog[chordIdx];
            const note = chord[noteIdx];

            // Melodia principal suave
            this.playTone(note, 'sine', 0.35, 0.045, 0);
            // Baixo suave no primeiro tempo do compasso
            if (noteIdx === 0) {
                this.playTone(chord[0] * 0.5, 'triangle', 0.65, 0.05, 0);
            }
            this.stepIndex++;
        }, tempoMs);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundSystem = new SoundSystem();
