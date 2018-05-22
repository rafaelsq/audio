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
        src: 'https://griphon-g2.sscdn.co/palcomp3/7/d/4/4/tribodaperiferia-perdidos-em-narnia-638e8917.mp3',
    },
    {
        artist: 'Koopa Tropas',
        title: 'Brain Damage',
        img: 'https://studiosol-a.akamaihd.net/tb/palcomp3-discografia/7/e/4/6/7e69a25516194bb5933eb6b74b667674.jpg',
        src: 'https://pegasus-g4.sscdn.co/palcomp3/d/9/a/a/brain-damage-faixa-d07ce97a.mp3',
    },
    {
        artist: 'Kevinho',
        title: 'Tumbalatum',
        img: '',
        src:
      'https://phoenix-g5.sscdn.co/palcomp3/8/7/7/3/mckevinhooficial-whatsapp-audio-2016-09-27-at-102627-online-audio-convertercom-1c7b227e.mp3',
    },
    {
        artist: 'Koopa',
        title: 'Falling Away',
        img: 'https://studiosol-a.akamaihd.net/tb/palcomp3-discografia/1/1/4/a/821cf14de3ed4af18ff93e2554d96b2b.jpg',
        src: 'https://phoenix-g5.sscdn.co/palcomp3/c/d/6/6/koopa-falling-away.mp3',
    },
]

const secsToDisplay = t => {
    const m = t / 60 | 0
    const s = t % 60 | 0
    return (m > 9 ? m : '0' + m) + ':' + (s > 9 ? s : '0' + s)
}

const State = {
    audio: null,

    artist: null,
    title: null,
    src: null,

    autoplay: false,
    buffered: [],
    currentTime: 0,
    duration: 0,
    playing: null,
    progress: 0,
    ready: false,
    waiting: null,
    volume: 0.2,
}

const Actions = {
    up: params => () => params,
    progress: currentTime => ({duration}) => ({
        currentTime,
        progress: Math.round(currentTime * 100 / duration),
    }),
    src: ({src, artist, title}) => ({audio}) => {
        console.log('========== set', artist, title, audio)
        audio.src(src)
        return {src, title, artist}
    },
    play: seekTo => ({audio}) => {
        console.log('what?', seekTo)
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
    init: () => (_, actions) => {
        setTimeout(() => {
            actions.src(Playlist[1])
            setTimeout(() => actions.play(30), 1000)
        }, 500)

        const audio = new Wdio()
        audio.on(function(event) {
            actions.up(event)
        })
        window.a = audio

        return {audio}
    },
    playPl: index => (_, actions) => {
        actions.src(Playlist[index])
        actions.play(80)
    },
}

const view = (state, {init, playPl, play, pause, stop, seek, clear, setVolume, mute}) => 
  <section className="section" oncreate={init}>
    <div className="container">
      <h1 className="title">Player {state.audio}</h1>
      <p className={state.waiting ? 'is-loading' : ''}>
        {state.artist} - {state.title}
      </p>
      <div className="level">
        <div className="leve-item">{secsToDisplay(state.currentTime)}&nbsp;</div>
        <div className="leve-item" onclick={seek}>
          [{state.buffered
            .map((d, i) => i == (state.currentTime | 0) ? state.waiting ? '?' : '>' : d ? '-' : '_')
            .join('')}]
        </div>
        <div className="leve-item">&nbsp;{secsToDisplay(state.duration)}</div>
      </div>
      <progress class="progress is-small is-volume" value={state.volume} max="1.0" onclick={setVolume} />
      <p>
        <button
          className="button"
          onclick={() => (state.playing ? pause : play)()}
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
          {state.audio && (state.audio.state().muted ? 'un ' : '')}mute
        </button>
      </p>
      <p>
        <ul>
          {Playlist.map((m, i) => 
            <li onclick={() => playPl(i)}>
              {m.artist} - {m.title}
            </li>
          )}
        </ul>
      </p>
    </div>
  </section>


app(State, Actions, view, document.body)
