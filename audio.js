export default function() {
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
        volume: 0.01,
        muted: false,
    }

    const _audio = new Audio()
    _audio.preload = 'metadata'
    _audio.volume = _default.volume

    let _state = Object.assign({}, _default)

    function src(src) {
        _reset()
        _audio.src = src
    }

    function up(state) {
        Object.assign(_state, state)
        if (_state.fn) _state.fn(state)
    }

    function on(fn) {
        _state.fn = fn
    }

    function play() {
        if (_state.ready) {
            const promise = _audio.play()
            if (promise) {
                promise.then(function() {}).catch(function(err) {
                    up({playing: false})
                    console.log(' play.err', err)
                })
            }
        } else up({autoplay: true})
    }

    function pause() {
        if (_state.ready) _audio.pause()
    }

    function stop() {
        if (_state.ready) {
            pause()
            _audio.currentTime = 0
        }

        up({autoplay: false})
    }

    function seek(seekTo) {
        if (_state.ready) _audio.currentTime = _audio.duration * seekTo / 100
        else up({seekTo})
    }

    function volume(value) {
        if (value !== _audio.volume && _state.muted) toggleMute()
        _audio.volume = value
    }

    function _onReady() {
        console.log(' onReady', _state.seekTo, _state.autoplay)
        if (_state.seekTo) seek(_state.seekTo)
        if (_state.autoplay) play()
    }

    function _reset() {
        up(_default)
    }

    function _progress(currentTime) {
        up({
            currentTime,
            progress: Math.round(currentTime * 100 / _state.duration),
        })
    }

    function _buf(duration, buffered) {
        let secs = Array(duration | 0).fill(0)
        for (let i = 0; i < buffered.length; i++) {
            for (let x = buffered.start(i) | 0; x < buffered.end(i) | 0; x++) {
                secs[x] = 1
            }
        }
        return secs
    }

    function toggleMute() {
        _audio.muted = !_audio.muted
    }

    _audio.addEventListener('abort', () => console.log('abort'))
    _audio.addEventListener('canplay', () => {
        console.log('*canplay enought to start')
        up({playing: false, waiting: false})
    })
    _audio.addEventListener('canplaythrought', () => console.log('canplaythrought; all loaded'))
    _audio.addEventListener('durationchange', () => {
        up({duration: _audio.duration, buffered: _buf(_audio.duration, _audio.buffered)})
        console.log('*durationchange', _audio.duration)
    })
    _audio.addEventListener('emptied', () => {
        console.log('emptied')
    })
    _audio.addEventListener('ended', () => {
        console.log('*ended')
        _reset()
    })
    _audio.addEventListener('error', err => {
        _reset()
        console.error('*err', err)
    })
    _audio.addEventListener('loadeddata', () => console.log('loadeddata'))
    _audio.addEventListener('loadedmetadata', () => {
        up({ready: true})
        _onReady()
        console.log('*loadedmetadata')
    })
    _audio.addEventListener('loadstart', () => {
        up({waiting: true})
        console.log('*loadstart')
    })
    _audio.addEventListener('pause', () => {
        up({playing: false})
        console.log('*pause')
    })
    _audio.addEventListener('play', () => console.log('play'))
    _audio.addEventListener('playing', () => {
        console.log('*playing')
        up({playing: true})
    })
    _audio.addEventListener('progress', () => {
        up({buffered: _buf(_audio.duration, _audio.buffered)})
    })
    _audio.addEventListener('ratechange', () => console.log('ratechange'))
    _audio.addEventListener('seeked', () => console.log('seeked'))
    _audio.addEventListener('seeking', () => {
        up({waiting: true})
        console.log('*seeking')
    })
    _audio.addEventListener('stalled', () => console.log('stalled'))
    _audio.addEventListener('suspend', () => console.log('suspend'))
    _audio.addEventListener('timeupdate', () => {
        _progress(_audio.currentTime)
    })
    _audio.addEventListener('volumechange', () => {
        console.log('*volumechange', _audio.volume)
        up({volume: _audio.volume, muted: _audio.muted})
    })
    _audio.addEventListener('waiting', () => {
        up({waiting: true})
        console.log('*waiting')
    })

    return {
        play,
        pause,
        stop,
        seek,
        src,
        volume,
        on,
        toggleMute,
        state: () => _state,
    }
}
