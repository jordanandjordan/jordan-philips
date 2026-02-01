import React from 'react'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import Carousel from '../Carousel'
import VideoPlayer from '../VideoPlayer'
import ProjectInfo from '../ProjectInfo'
import styled from 'styled-components'
import { vimeoIdFromLink } from '../../utils/helpers'

const StyledGrid = styled.div``

function Grid({ clients, onResize = () => {}, playerTheme = 'blue' }) {
  return (
    <StyledGrid className="grid-wrapper">
      {clients.map((client, clientIndex) => {
        const projects = sortBy(
          get(client, 'data.body', []),
          'primary.project_title[0].text',
        )

        return projects.map((p, projectIndex) => {
          const type = get(p, 'slice_type', '')
          const wayfinderId = `${get(
            client,
            'data.category',
            'project',
          )}-${clientIndex}-${projectIndex}`

          if (type === 'video') {
            const videoId = vimeoIdFromLink(get(p, 'primary.video_link.url', ''))
            const imagePoster = get(p, 'primary.image_poster')

            return (
              <div
                className={`grid-item grid-${type}`}
                id={wayfinderId}
                key={wayfinderId}
              >
                <div className="content">
                  <VideoPlayer
                    videoId={videoId}
                    playerTheme={playerTheme}
                    poster={imagePoster}
                  />
                  <ProjectInfo client={client} project={p} onResize={onResize} />
                </div>
              </div>
            )
          } else if (type === 'looping_video') {
            const videoId = vimeoIdFromLink(get(p, 'primary.video_link.url', ''))
            return (
              <div
                className={`grid-item grid-${type}`}
                id={wayfinderId}
                key={wayfinderId}
              >
                <div className="content">
                  <VideoPlayer videoId={videoId} loop={true} />
                  <ProjectInfo client={client} project={p} onResize={onResize} />
                </div>
              </div>
            )
          } else if (type === 'multiple_images') {
            // NEW: supports mixed carousel slides (Prismic-hosted images OR mp4 files)
            // Expected Prismic repeat fields (per item):
            // - image (Image field)
            // - video_file (Link field with select: "media")
            const slides = get(p, 'items', [])
              .map((item) => {
                const videoUrl = get(item, 'video_file.url', '')
                const imageUrl = get(item, 'image.url', '')

                if (videoUrl) return { type: 'video', url: videoUrl }
                if (imageUrl)
                  return {
                    type: 'image',
                    url: imageUrl,
                    alt: get(item, 'image.alt', ''),
                  }
                return null
              })
              .filter(Boolean)

            return (
              <div
                className={`grid-item grid-${type}`}
                id={wayfinderId}
                key={wayfinderId}
              >
                <div className="content">
                  <Carousel slides={slides} onResize={onResize} />
                  <ProjectInfo client={client} project={p} onResize={onResize} />
                </div>
              </div>
            )
            // just single image
          } else {
            return (
              <div
                className={`grid-item grid-${type}`}
                id={wayfinderId}
                key={wayfinderId}
              >
                <div className="content">
                  <img
                    src={get(p, 'primary.image.url', '')}
                    alt={get(p, 'primary.image.alt', '')}
                  />
                  <ProjectInfo client={client} project={p} onResize={onResize} />
                </div>
              </div>
            )
          }
        })
      })}
    </StyledGrid>
  )
}

export default Grid
