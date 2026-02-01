import React, { useState, useRef } from 'react'
import ReactPlayer from 'react-player'
import gsap from 'gsap'
import get from 'lodash/get'
import useSWR from 'swr'
import screenfull from 'screenfull'
import delay from 'lodash/delay'
import { fetcher, getVimeoMeta } from '../../utils/helpers'
import styled from 'styled-components'
import BackgroundImage from '../../components/BackgroundImage'

const StyledVideoPlayer = styled.div`
  position: relative;
  .video-player {
    & > div {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  button {
    border: 0;
    background: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    outline: none;
  }

  .player-play-icon {
    text-indent: -9999px;
    background-image: url('/images/play-white.svg');
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    width: 2rem;
    height: 2rem;
    display: block;
    position: absolute;
    cursor: pointer;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .poster-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    cursor: pointer;
    z-index: 1;
  }

  .player-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    cursor: pointer;
    z-index: 2;
  }

  .player-fullscreen {
    text-indent: -9999px;
    background: url(/images/fullscreen.svg) center center no-repeat;
    background-size: contain;
    width: 20px;
    height: 22px;
    display: block;
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    opacity: 0;
    visibility: hidden;
    z-index: 6; /* IMPORTANT: above anything else */
    cursor: pointer;
  }

  .player-play-pause {
    text-indent: -9999px;
    background: url(/images/play-white.svg) center center no-repeat;
    background-size: contain;
    width: 20px;
    height: 20px;
    display: block;
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    opacity: 0;
    visibility: hidden;
    z-index: 6; /* IMPORTANT: above anything else */
    cursor: pointer;
  }

  .player-play-pause.is-playing-true {
    text-indent: -9999px;
    background: url(/images/pause.svg) center center no-repeat;
    background-size: contain;
    width: 18px;
    height: 18px;
    display: block;
  }

  .player-progress {
    opacity: 0;
    visibility: hidden;
    z-index: 6;
  }

  .player-progress input[type='range'] {
    width: 100%;
    border: 0;
    position: absolute;
    bottom: 0;
    left: 0;
    border-radius: 0;
    height: 2px;
    overflow: hidden;
    -webkit-appearance: none;
    background-color: #ffffff;
    outline: none;
  }

  input[type='range']::-webkit-slider-thumb {
    width: 12px;
    -webkit-appearance: none;
    height: 2px;
    cursor: ew-resize;
    background: ${(props) => props.playerTheme};
    color: red;
  }

  input[type='range']::-moz-range-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    -moz-border-radius: 0;
    height: 2px;
    width: 12px;
    border-radius: 0px;
    background: ${(props) => props.playerTheme};
    border: 0;
  }

  &.has-played-true {
    .player-play-pause,
    .player-fullscreen,
    .player-progress {
      opacity: 1;
      visibility: visible;
      transition: all 0.3s;
    }
    .poster-wrapper {
      display: none;
    }
  }
`

function VideoPlayer({ videoId, loop = false, playerTheme, poster }) {
  const player = useRef(null)
  const wrapperRef = useRef(null)
  const playerButton = useRef(null)

  const [hasPlayed, setHasPlayed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(0)
  const [seeking, setSeeking] = useState(false)

  const { data, error } = useSWR(getVimeoMeta(videoId), fetcher)

  if (error) return <div>failed to load</div>
  if (!data) return <div>loading...</div>

  const handleClickPlayPause = () => setPlaying((p) => !p)

  const handleOnPause = () => setPlaying(false)

  const handleOnPlay = () => {
    setPlaying(true)
    setHasPlayed(true)
    gsap.to(playerButton.current, 0.4, { autoAlpha: 0 })
  }

  const handleClickFullscreen = async () => {
    // Target the actual iframe when possible (more reliable)
    const iframe = wrapperRef.current?.querySelector('iframe')
    const el = iframe || wrapperRef.current
    if (!el) return

    // Try Vimeo internal fullscreen if available
    const internal = player.current?.getInternalPlayer?.()
    if (internal && typeof internal.requestFullscreen === 'function') {
      try {
        await internal.requestFullscreen()
        return
      } catch (e) {
        // fall through
      }
    }

    // screenfull (desktop)
    if (screenfull.isEnabled) {
      try {
        await screenfull.request(el)
        return
      } catch (e) {
        // fall through
      }
    }

    // Native fallbacks (Safari)
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen()
        return
      } catch (e) {}
    }
    if (el.webkitRequestFullscreen) {
      try {
        el.webkitRequestFullscreen()
        return
      } catch (e) {}
    }

    // Last resort
    window.open(`https://vimeo.com/${videoId}`, '_blank', 'noopener,noreferrer')
  }

  const handleSeekMouseDown = () => setSeeking(true)

  const handleSeekChange = (e) => setPlayed(parseFloat(e.target.value))

  const handleSeekMouseUp = (e) => {
    if (player.current) {
      player.current.seekTo(parseFloat(e.target.value))
      delay(() => setSeeking(false), 200)
    }
  }

  const handleProgress = (state) => {
    if (!seeking) setPlayed(state.played)
  }

  const handleClickPlay = () => {
    if (player.current) {
      setPlaying((p) => !p)
      setHasPlayed(true)
      gsap.to(playerButton.current, 0.4, { autoAlpha: 0 })
    }
  }

  // ✅ IMPORTANT: disable Vimeo native controls
  const baseParams = 'controls=0&title=0&byline=0&portrait=0&badge=0'
  const url = loop
    ? `https://player.vimeo.com/video/${videoId}?background=1&${baseParams}`
    : `https://player.vimeo.com/video/${videoId}?${baseParams}`

  return (
    <StyledVideoPlayer
      ref={wrapperRef}
      className={`has-played-${hasPlayed}`}
      playerTheme={playerTheme}
    >
      <ReactPlayer
        url={url}
        playsinline={true}
        width={'100%'}
        height={0}
        ref={player}
        muted={loop}
        playing={playing || loop}
        loop={loop}
        onProgress={handleProgress}
        onPause={handleOnPause}
        onPlay={handleOnPlay}
        className="video-player"
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: `${(data.height / data.width) * 100}%`,
        }}
      />

      {!loop && (
        <>
          <div className="player-overlay" onClick={handleClickPlay}>
            <button ref={playerButton} className="player-play-icon" type="button">
              Play Icon
            </button>
          </div>

          <div className="poster-wrapper">
            {poster && <BackgroundImage url={get(poster, 'url')} />}
          </div>

          <button
            className={`player-play-pause  is-playing-${playing}`}
            onClick={handleClickPlayPause}
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            Play/Pause
          </button>

          <button
            className="player-fullscreen"
            onClick={handleClickFullscreen}
            type="button"
            aria-label="Fullscreen"
          >
            Fullscreen
          </button>

          <div className="player-progress">
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              style={{
                background: `linear-gradient(to right, ${playerTheme} 0%, ${playerTheme} ${
                  played * 100
                }%, #fff ${played * 100}%, #fff 100%)`,
              }}
            />
          </div>
        </>
      )}
    </StyledVideoPlayer>
  )
}

export default VideoPlayer
