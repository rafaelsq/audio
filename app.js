import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Audio from './audio'

const PlayerContext = React.createContext({state: {playlist: {}, player: {}}, actions: {}})

const secsToDisplay = t => {
    const m = t / 60 | 0
    const s = t % 60 | 0
    return (m > 9 ? m : '0' + m) + ':' + (s > 9 ? s : '0' + s)
}

class PlaylistManager {
    constructor() {
        this._player = new Audio()

        this.state = {
            player: {},
            playlist: {
                index: -1,
                playlist: [],
                repeat: true,
            },
        }

        this._emit = () => {}

        this._player.on(state => {
            let ended = this.state.player.ended
            if (!this.state.player.ended && state.ended) {
                this.next()
                ended = false
            }

            this.state.player = {...this.state.player, ...state, ended}

            this._emit(this.state)
        })
    }

    on(emitter) {
        this._emit = emitter
    }

    playerActions() {
        return this._player
    }

    playAt(index) {
        this.state.playlist.index = index
        this._emit(this.state)

        this._player.src(this.state.playlist.playlist[index].url)
        this._player.play()
    }

    next() {
        let index =
            this.state.playlist.index + 1 >= this.state.playlist.playlist.length
                ? this.state.playlist.repeat
                    ? 0
                    : this.state.playlist.index
                : this.state.playlist.index + 1

        if (index != this.state.playlist.index) {
            this.playAt(index)
        }
    }

    prev() {
        let index = this.state.playlist.index - 1 >= 0 ? this.state.playlist.index - 1 : this.state.playlist.index
        if (index != this.state.playlist.index) {
            this.playAt(index)
        }
    }

    setPlaylist(playlist) {
        this.state.playlist.playlist = playlist
        this._emit(this.state)
    }

    queue(music) {
        this.state.playlist.playlist.push(music)
        this._emit(this.state)
    }

    clear() {
        this.state.playlist.playlist = []
        this.state.playlist.index = -1
        this._emit(this.state)
    }

    toggleRepeat() {
        this.state.playlist.repeat = !this.state.playlist.repeat
        this._emit(this.state)
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)

        this._playlistManager = new PlaylistManager()

        this.state = {
            playlistState: {player: {}, playlist: {}},
        }
    }

    componentWillMount() {
        this._playlistManager.on(playlistState => this.setState({playlistState}))

        this._playlistManager.setPlaylist([
            {
                title: 'Tribo da Periferia - Perdidos em nárnia',
                url: 'https://65381g.ha.azioncdn.net/7/d/4/4/tribodaperiferia-perdidos-em-narnia-638e8917.mp3',
            },
            {
                title: 'Tribo da Periferia - Alma de Pipa',
                url:
                    'https://65381g.ha.azioncdn.net/0/d/c/f/tribodaperiferia-tribo-da-periferia-alma-de-pipa-a6a0a218.mp3?',
            },
        ])
    }

    render() {
        return (
            <PlayerContext.Provider
                value={{
                    state: this.state.playlistState,
                    actions: {
                        player: this._playlistManager.playerActions(),
                        playlist: this._playlistManager,
                    },
                }}
            >
                {CPlayer.bind(this)()}
                {CPlayer.bind(this)()}
                <CPlaylist />
            </PlayerContext.Provider>
        )
    }
}

const CPlaylist = () =>
    <PlayerContext.Consumer>
        {({state, actions}) => <Playlist actions={actions.playlist} state={state.playlist} />}
    </PlayerContext.Consumer>


const CPlayer = () =>
    <PlayerContext.Consumer>
        {({state, actions}) => <Player actions={actions.player} state={state.player} />}
    </PlayerContext.Consumer>


const Playlist = ({actions, state}) =>
    <div>
        <h1>Playlist</h1>
        <ul>
            {state.playlist.map((m, i) =>
                <li onClick={() => actions.playAt(i)}>
                    {i === state.index ? '*' : ''}
                    {m.title}
                </li>
            )}
        </ul>
        <button onClick={() => actions.prev()} disabled={!state.index}>
            prev
        </button>
        <button onClick={() => actions.next()} disabled={state.index >= state.playlist.length - 1}>
            next
        </button>
        <button onClick={() => actions.toggleRepeat()}>repeat: {state.repeat ? 'all' : 'no'}</button>
    </div>


const Player = ({actions, state}) =>
    <div className="player">
        <h1>
            Player {state.audio} {secsToDisplay(state.currentTime)}/{secsToDisplay(state.duration)}
        </h1>
        <div className="seek-bar" onClick={e => actions.seek(e.nativeEvent.offsetX * 100 / e.target.offsetWidth)}>
            <div className={'progress' + (state.waiting ? ' wait' : '')} style={{width: state.progress + '%'}} />
        </div>
        <p>
            <button
                onClick={() => state.playing ? actions.pause() : actions.play()}
                disabled={state.waiting || !state.ready}
            >
                {state.playing ? 'pause' : 'play'}
            </button>
            <button onClick={() => actions.stop()} disabled={!state.ready}>
                stop
            </button>
            <button onClick={() => actions.toggleMute()} disabled={!state.ready}>
                {state.muted ? 'un ' : ''}
                mute
            </button>
        </p>
    </div>


ReactDOM.render(<App />, document.getElementById('root'))
