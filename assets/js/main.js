
class DtmfTone {
    static getFrequencies(key) {
        let freq = [0, 0];
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

    constructor(key) {
        this.key = key;
        this.frequencies = DtmfTone.getFrequencies(key);
        this.oscillators = [];
        this.playing = false;
    }

    #createOscillator(context, frequency) {
        let oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        return oscillator;
    }

    play() {
        if (!this.playing) {
            let context = new AudioContext();
            this.oscillators = this.frequencies.map(f => this.#createOscillator(context, f));
            this.oscillators.forEach(o => o.connect(context.destination));
            this.oscillators.forEach(o => o.start());
            this.context = context;
            this.playing = true;
        }
    }

    stop() {
        if (this.playing) {
            this.oscillators.forEach(o => o.stop());
            this.oscillators.forEach(o => o.disconnect());
            this.oscillators = [];
            this.context.close();
            delete this.context;
            this.playing = false;
        }
    }
}

const keypads = document.querySelectorAll('.keypad');
const dtmfTones = {};
for (const keypad of keypads) {
    const key = keypad.dataset.value;
    dtmfTones[key] = new DtmfTone(key);
    keypad.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        dtmfTones[key].play();
    });
    keypad.addEventListener('pointerup', (ev) => {
        ev.preventDefault();
        dtmfTones[key].stop();
    });
}

document.addEventListener('touchstart', (ev) => {
    if (ev.target.classList.contains('keypad')) {
        ev.preventDefault();
    }
});
