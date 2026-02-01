import React from 'react'
import useSWR from 'swr'
import { fetcher, getVimeoMeta } from '../../utils/helpers'

function LoopingBackground({ videoId }) {
  const { data, error } = useSWR(getVimeoMeta(videoId), fetcher)

  if (error) {
    return <div>failed to load</div>
  }
  if (!data) {
    return <div>loading...</div>
  }

  return (
    <div
      class="iframe-container"
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: `${(data.width / data.height) * 100}%`,
      }}
    >
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?background=1`}
        width={data.width}
        height={data.height}
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
        title="background video"
        muted={true}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '0',
        }}
      ></iframe>
    </div>
  )
}

export default LoopingBackground
