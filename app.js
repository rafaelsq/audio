import {h, app} from 'hyperapp'
import Wdio from './audio'

// parcel hmr
if (module.hot) {
    module.hot.dispose(() => {
        window.location.reload()
    })
}

const Playlist = [
    {
        artist: 'Efi',
        title: 'Opz',
        img: 'https://studiosol-a.akamaihd.net/tb/palcomp3-discografia/f/5/a/5/3e469e4fd9574ebe87ccca9bcec1a520.jpg',
        src: 'https://griphon-g2.sscdn.co/palcomp3/7/d/4/4/tribodaperiferia-perdidos-em-narnia-638e891.mp3',
    },
    {
        artist: 'Tribo da Periferia',
        title: 'Perdido em Nárnia',
        img: 'https://studiosol-a.akamaihd.net/tb/palcomp3-discografia/f/5/a/5/3e469e4fd9574ebe87ccca9bcec1a520.jpg',
        src: 'https://65381g.ha.azioncdn.net/7/d/4/4/tribodaperiferia-perdidos-em-narnia-638e8917.mp3',
    },
    {
        artist: 'Tribo da Periferia',
        title: 'Alma de Pipa',
        img: 'https://studiosol-a.akamaihd.net/tb/palcomp3-discografia/f/5/a/5/3e469e4fd9574ebe87ccca9bcec1a520.jpg',
        src: 'https://65381g.ha.azioncdn.net/0/d/c/f/tribodaperiferia-tribo-da-periferia-alma-de-pipa-a6a0a218.mp3?',
    },
    {
        artist: 'Henrique e Juliano',
        title: 'Quem Pegou, Pegou',
        img: '',
        src: 'https://65381g.ha.azioncdn.net/3/c/e/4/henriqueejulianooficial-quem-pegou-pegou-b0f3933d.mp3',
    },
    {
        artist: 'Henrique e Juliano',
        title: 'Três Corações',
        img: '',
        src: 'https://65381g.ha.azioncdn.net/3/5/a/0/henriqueejulianooficial-tres-coracoes-c62a4fa4.mp3',
    },
]

const secsToDisplay = t => {
    const m = t / 60 | 0
    const s = t % 60 | 0
    return (m > 9 ? m : '0' + m) + ':' + (s > 9 ? s : '0' + s)
}

const State = {
    audio: null,

    index: null,
    artist: null,
    title: null,
    src: null,

    // player.stats
    autoplay: false,
    buffered: [],
    currentTime: 0,
    duration: 0,
    playing: null,
    progress: 0,
    ready: false,
    waiting: null,
    volume: 0.2,
    ended: false,
}

const Actions = {
    up: params => () => params,
    progress: currentTime => ({duration}) => ({
        currentTime,
        progress: Math.round(currentTime * 100 / duration),
    }),
    src: ({src, artist, title}) => ({audio}) => {
        audio.src(src)
        return {src, title, artist}
    },
    play: seekTo => ({audio}) => {
        audio.play(seekTo)
    },
    pause: () => ({audio}) => {
        audio.pause()
    },
    stop: () => ({audio}) => {
        audio.stop()
    },
    clear: () => ({audio}) => {
        audio.src(undefined)
        return {src: undefined}
    },
    mute: () => ({audio}) => audio.toggleMute(),
    seek: e => ({audio}) => {
        audio.seek(e.offsetX * 100 / e.target.offsetWidth)
    },
    setVolume: e => ({audio}) => {
        audio.volume(e.offsetX / e.target.offsetWidth)
    },
    initcanvas: canvas => () => ({
        canvas,
        canvasctx: canvas.getContext('2d'),
    }),
    init: () => (state, actions) => {
        const audio = new Wdio()

        audio.on(actions.upEvent)

        return {audio}
    },
    upEvent: st => (state, actions) => {
        if (st.progress) actions.upProgress(st.progress)
        if (st.duration) state.canvas.width = st.duration | 0
        if (!state.ended && st.ended) {
            st.index = state.index + 1
            actions.src(Playlist[st.index])
            actions.play()
            st.ended = false
        }

        return st
    },
    upProgress: () => ({canvasctx, buffered, currentTime, waiting}) => {
        buffered.forEach((d, i) => {
            canvasctx.beginPath()
            canvasctx.strokeStyle =
                i == (currentTime | 0)
                    ? waiting
                        ? '#FF00FF'
                        : '#CC3300'
                    : d
                        ? waiting
                            ? '#FFAAFF'
                            : '#EFEFEF'
                        : waiting
                            ? '#FF33FF'
                            : '#9F9F9F'
            canvasctx.moveTo(i, 0)
            canvasctx.lineTo(i, 10)
            canvasctx.stroke()
        })
    },
    playPl: index => (_, actions) => {
        actions.src(Playlist[index])
        actions.play(80)
        return {index}
    },
}

const view = (state, {init, initcanvas, playPl, play, pause, stop, seek, clear, setVolume, mute}) => 
    <section className="section" oncreate={init}>
        <div className="container">
            <h1 className="title">Player {state.audio}</h1>
            <p className={state.waiting ? 'is-loading' : ''}>
                {state.artist} - {state.title}
            </p>
            <div className="level">
                <div className="leve-item is-timer">
                    {secsToDisplay(state.currentTime)}
                    &nbsp;
                </div>
                <div className="leve-item" onclick={seek}>
                    <canvas oncreate={initcanvas} className="cv" width="200" height="10" />
                </div>
                <div className="leve-item is-timer">
                    &nbsp;
                    {secsToDisplay(state.duration)}
                </div>
            </div>
            <progress class="progress is-small is-volume" value={state.volume} max="1.0" onclick={setVolume} />
            <p>
                <button
                    className="button"
                    onclick={() => (state.playing ? pause : play).bind(state.audio)()}
                    disabled={state.waiting || !state.ready}
                >
                    {state.playing ? 'pause' : 'play'}
                </button>
                <button className="button" onclick={stop} disabled={!state.ready}>
                    stop
                </button>
                <button className="button" onclick={clear} disabled={!state.src}>
                    clear
                </button>
                <button className="button" onclick={mute} disabled={!state.ready}>
                    {state.muted ? 'un ' : ''}
                    mute
                </button>
            </p>
            <p>
                <ul>
                    {Playlist.map((m, i) => 
                        <li onclick={() => playPl(i)} className={i === state.index ? 'has-text-primary' : ''}>
                            {m.artist} - {m.title}
                        </li>
                    )}
                </ul>
            </p>
        </div>
    </section>


app(State, Actions, view, document.body)
