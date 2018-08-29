const _default = {
    autoplay: false,
    seekTo: 0,

    buffered: [],
    currentTime: 0,
    duration: 0,
    playing: null,
    progress: 0,
    ready: false,
    waiting: null,
    volume: 0.4,
    muted: false,
}

export default class {
    constructor() {
        const _audio = new Audio()
        _audio.preload = 'metadata'
        _audio.volume = _default.volume
        _audio.crossOrigin = 'anonymous'

        this._state = Object.assign({}, _default)

        _audio.addEventListener('abort', () => console.log('abort'))
        _audio.addEventListener('canplay', () => {
            this._up({playing: false, waiting: false})
        })
        _audio.addEventListener('canplaythrought', () => console.log('canplaythrought; all loaded'))
        _audio.addEventListener('durationchange', () => {
            this._up({
                duration: _audio.duration,
                buffered: this._buf(_audio.duration, _audio.buffered),
            })
        })
        _audio.addEventListener('emptied', () => console.log('emptied'))
        _audio.addEventListener('ended', () => {
            this._reset()
        })
        _audio.addEventListener('error', err => {
            this._reset()
            console.error('*err', err)
        })
        _audio.addEventListener('loadeddata', () => console.log('loadeddata'))
        _audio.addEventListener('loadedmetadata', () => {
            this._up({ready: true})
            this._onReady()
        })
        _audio.addEventListener('loadstart', () => {
            this._up({waiting: true})
        })
        _audio.addEventListener('pause', () => {
            this._up({playing: false})
        })
        _audio.addEventListener('play', () => console.log('play'))
        _audio.addEventListener('playing', () => {
            this._up({playing: true})
        })
        _audio.addEventListener('progress', () => {
            this._up({buffered: this._buf(_audio.duration, _audio.buffered)})
        })
        _audio.addEventListener('ratechange', () => console.log('ratechange'))
        _audio.addEventListener('seeked', () => console.log('seeked'))
        _audio.addEventListener('seeking', () => {
            this._up({waiting: true})
        })
        _audio.addEventListener('stalled', () => console.log('stalled'))
        _audio.addEventListener('suspend', () => console.log('suspend'))
        _audio.addEventListener('timeupdate', () => {
            this._progress(_audio.currentTime)
        })
        _audio.addEventListener('volumechange', () => {
            this._up({volume: _audio.volume, muted: _audio.muted})
        })
        _audio.addEventListener('waiting', () => {
            this._up({waiting: true})
        })

        this._audio = _audio
    }

    // private methods

    _up(state) {
        Object.assign(this._state, state)
        if (this._state.fn) this._state.fn(state)
    }

    _onReady() {
        if (this._state.seekTo) this.seek(this._state.seekTo)
        if (this._state.autoplay) this.play()
    }

    _reset() {
        this._up(_default)
    }

    _progress(currentTime) {
        this._up({
            currentTime,
            progress: Math.round(currentTime * 100 / this._state.duration),
        })
    }

    _buf(duration, buffered) {
        let secs = Array(duration | 0).fill(0)
        for (let i = 0; i < buffered.length; i++) {
            for (let x = buffered.start(i) | 0; x < buffered.end(i) | 0; x++) {
                secs[x] = 1
            }
        }
        return secs
    }

    // public methods

    src(src) {
        this._reset()
        this._audio.src = src
    }

    on(fn) {
        this._state.fn = fn
    }

    play() {
        if (this._state.ready) {
            const promise = this._audio.play()
            if (promise) {
                promise.then(function() {}).catch(function(err) {
                    this._up({playing: false})
                    console.log(' play.err', err)
                })
            }
        } else this._up({autoplay: true})
    }

    pause() {
        if (this._state.ready) this._audio.pause()
    }

    stop() {
        if (this._state.ready) {
            this.pause()
            this._audio.currentTime = 0
        }

        this._up({autoplay: false})
    }

    seek(seekTo) {
        if (this._state.ready) this._audio.currentTime = this._audio.duration * seekTo / 100
        else this._up({seekTo})
    }

    volume(value) {
        if (value !== this._audio.volume && this._state.muted) this.toggleMute()
        this._audio.volume = value
    }

    toggleMute() {
        this._audio.muted = !this._audio.muted
    }
}
