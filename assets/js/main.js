
class AudioContextHost {
    static MIN_DURATION = 150;

    #context = null;
    #oscillators = [];
    #count = 0;
    #playRequested = false;
    #minDurationElapsed = false;

    static getDtmfFrequencies(key) {
        let freq = [];
        switch (String(key).charAt(0).toUpperCase()) {
            case '1':
                freq = [697, 1209];
                break;
            case '2':
                freq = [697, 1336];
                break;
            case '3':
                freq = [697, 1477];
                break;
            case 'A':
                freq = [697, 1633];
                break;
            case '4':
                freq = [770, 1209];
                break;
            case '5':
                freq = [770, 1336];
                break;
            case '6':
                freq = [770, 1477];
                break;
            case 'B':
                freq = [770, 1633];
                break;
            case '7':
                freq = [852, 1209];
                break;
            case '8':
                freq = [852, 1336];
                break;
            case '9':
                freq = [852, 1477];
                break;
            case 'C':
                freq = [852, 1633];
                break;
            case '*':
                freq = [941, 1209];
                break;
            case '0':
                freq = [941, 1336];
                break;
            case '#':
                freq = [941, 1477];
                break;
            case 'D':
                freq = [941, 1633];
                break;
        }
        return freq;
    }

    constructor() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.#createContext();
            } else {
                this.#closeContext();
            }
        });
    }

    #createContext() {
        if (!this.#context) {
            this.#context = new AudioContext({latencyHint: 'interactive', frequency: 8000});
        }
    }

    #closeContext() {
        if (this.#context) {
            this.#context.close();
            this.#context = null;
        }
    }

    get active() {
        return this.#context != null;
    }

    get playing() {
        return this.#playRequested;
    }

    playTone(frequencies) {
        this.#stopToneInternal();
        if (!this.active) {
            return;
        }
        ++this.#count;
        this.#playRequested = true;
        this.#minDurationElapsed = false;
        this.#oscillators = frequencies.map(f => {
            const oscillator = this.#context.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = f;
            oscillator.connect(this.#context.destination);
            return oscillator;
        });
        this.#oscillators.forEach(o => o.start());
        const currentCount = this.#count;
        setTimeout(() => {
            if (currentCount != this.#count) {
                return;
            }
            this.#minDurationElapsed = true;
            if (!this.#playRequested) {
                this.#stopToneInternal();
            }
        }, AudioContextHost.MIN_DURATION);
    }

    playDtmfTone(key) {
        this.playTone(AudioContextHost.getDtmfFrequencies(key));
    }

    #stopToneInternal() {
        if (this.active) {
            this.#oscillators.forEach(o => o.stop());
            this.#oscillators.forEach(o => o.disconnect());
        }
        this.#oscillators.length = 0;
    }

    stopTone() {
        this.#playRequested = false;
        if (this.#minDurationElapsed) {
            this.#stopToneInternal();
        }
    }
}

const host = new AudioContextHost();

const keypads = document.querySelectorAll('.keypad');
for (const keypad of keypads) {
    const key = keypad.dataset.value;
    keypad.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        host.playDtmfTone(key);
        keypad.classList.add('active');
    });
    keypad.addEventListener('pointerup', (ev) => {
        ev.preventDefault();
        host.stopTone();
        keypad.classList.remove('active');
    });
    keypad.addEventListener('pointercancel', (ev) => {
        ev.preventDefault();
        host.stopTone();
        keypad.classList.remove('active');
    })
    keypad.addEventListener('pointerleave', (ev) => {
        ev.preventDefault();
        host.stopTone();
        keypad.classList.remove('active');
    });
}

document.addEventListener('touchstart', (ev) => {
    if (ev.target.classList.contains('keypad')) {
        ev.preventDefault();
    }
}, {passive: false});
