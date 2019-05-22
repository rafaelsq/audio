# HTML5 Audio Wrapper

Examples; [React](https://github.com/rafaelsq/audio/tree/react), [HyperApp](https://github.com/rafaelsq/audio/tree/hyperapp).

## Usage

| Method | Description |
|--------|-------------|
| reset() | reset player state to default |
| src(string) | set player src(file url) |
| on(state: Object => void) | set the callback function that will be called with the player state |
| play() | play the song |
| pause() | pause the song |
| stop() | stop the song |
| seek(second: number) | seek to the second |
| volume(0~1: number) | set volume |
| toggleMute() | toggle mute |

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Example</title>
    </head>
    <body>
        <script type="module">
            import Audio from "./audio.js"

            const audio = new Audio()
            audio.on(state => console.log("new state:", state))
            audio.src("MP3_URL")
            audio.play()
        </script>
    </body>
</html>
```

