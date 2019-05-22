import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Audio from './audio'

const PlayerContext = React.createContext({})
const PlaylistContext = React.createContext({})

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
                hasPrev: false,
                hasNext: false,
            },
        }

        this._onPlayer = () => {}
        this._onPlaylist = () => {}

        this._player.on(state => {
            let ended = this.state.player.ended
            if (!this.state.player.ended && state.ended) {
                this.next()
                ended = false
            }

            this.state.player = {...this.state.player, ...state, ended}

            this._onPlayer(this.state.player)
        })
    }

    _updateStatePrevNext() {
        this.state.playlist.hasNext = this.state.playlist.repeat
            ? true
            : this.state.playlist.index < this.state.playlist.playlist.length - 1
        this.state.playlist.hasPrev = this.state.playlist.index > 0
    }
    onPlayer(emitter) {
        this._onPlayer = emitter
        this._onPlayer(this.state.player)
    }
    onPlaylist(emitter) {
        this._onPlaylist = emitter
        this._onPlaylist(this.state.playlist)
    }

    playerActions() {
        return this._player
    }

    playAt(index) {
        this.state.playlist.index = index
        this._updateStatePrevNext()
        this._onPlaylist(this.state.playlist)

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
        this._player.reset()
        this.state.playlist.index = -1
        this.state.playlist.playlist = playlist
        this._updateStatePrevNext()
        this._onPlaylist(this.state.playlist)
    }

    queue(music) {
        this.state.playlist.playlist.push(music)
        this._updateStatePrevNext()
        this._onPlaylist(this.state.playlist)
    }

    clear() {
        this.state.playlist.playlist = []
        this.state.playlist.index = -1
        this._updateStatePrevNext()
        this._onPlaylist(this.state.playlist)
    }

    toggleRepeat() {
        this.state.playlist.repeat = !this.state.playlist.repeat
        this._updateStatePrevNext()
        this._onPlaylist(this.state.playlist)
    }
}

const _playlistManager = new PlaylistManager()

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <PlaylistProvider actions={_playlistManager} onState={_playlistManager.onPlaylist.bind(_playlistManager)}>
                <PlayerProvider
                    actions={_playlistManager.playerActions()}
                    onState={_playlistManager.onPlayer.bind(_playlistManager)}
                >
                    <h1>Player</h1>
                    <div>
                        {CPlayer.bind(this)()}
                        {CPlayer.bind(this)()}
                    </div>
                    <div>
                        <h2>Playlist</h2>
                        <CPlaylist />
                    </div>
                </PlayerProvider>
            </PlaylistProvider>
        )
    }
}

class PlayerProvider extends React.Component {
    constructor(props) {
        super(props)

        this.state = {}
    }

    componentWillMount() {
        this.props.onState(state => this.setState(state))
    }

    render() {
        return (
            <PlayerContext.Provider value={{state: this.state, actions: this.props.actions}}>
                {/* rendered for each state change */ <span />}
                {this.props.children}
            </PlayerContext.Provider>
        )
    }
}

class PlaylistProvider extends React.Component {
    constructor(props) {
        super(props)

        this.state = {}
    }

    componentWillMount() {
        this.props.onState(state => this.setState(state))
    }

    render() {
        return (
            <PlaylistContext.Provider value={{state: this.state, actions: this.props.actions}}>
                {/* rendered for each state change */ <span />}
                {this.props.children}
            </PlaylistContext.Provider>
        )
    }
}

const CPlaylist = () => {
    return <PlaylistContext.Consumer>{Playlist}</PlaylistContext.Consumer>
}

const CPlayer = () => {
    return <PlayerContext.Consumer>{Player}</PlayerContext.Consumer>
}

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
        <button
            onClick={() => {
                actions.setPlaylist([
                    {
                        title: 'Tribo da Periferia - Perdidos em nárnia',
                        url: 'https://65381g.ha.azioncdn.net/7/d/4/4/tribodaperiferia-perdidos-em-narnia-638e8917.mp3',
                    },
                    {
                        title: 'Tribo da Periferia - Alma de Pipa',
                        url:
                            'https://65381g.ha.azioncdn.net/0/d/c/f/tribodaperiferia-tribo-' +
                            'da-periferia-alma-de-pipa-a6a0a218.mp3?',
                    },
                ])
                actions.playAt(0)
            }}
        >
            Tribo
        </button>
        <button
            onClick={() => {
                actions.setPlaylist([
                    {
                        title: 'Henrique e Juliano - Quem Pegou, Pegou',
                        url:
                            'https://65381g.ha.azioncdn.net/3/c/e/4/henriqueejulianooficial-quem-' +
                            'pegou-pegou-b0f3933d.mp3',
                    },
                    {
                        title: 'Henrique e Juliano - Três Corações',
                        url:
                            'https://65381g.ha.azioncdn.net/3/5/a/0/henriqueejulianooficial-tres' +
                            '-coracoes-c62a4fa4.mp3',
                    },
                ])
                actions.playAt(0)
            }}
        >
            H&J
        </button>
        <button onClick={() => actions.prev()} disabled={!state.hasPrev}>
            prev
        </button>
        <button onClick={() => actions.next()} disabled={!state.hasNext}>
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
