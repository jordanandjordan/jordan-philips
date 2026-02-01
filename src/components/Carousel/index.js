import React, { useMemo, useRef } from 'react'
import SwiperCore, { Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useWindowResize } from 'beautiful-react-hooks'
import get from 'lodash/get'
import delay from 'lodash/delay'
import styled from 'styled-components'

// Import Swiper styles
import 'swiper/swiper.scss'

const StyledSwiper = styled.div`
  .swiper-pagination {
    text-align: right;
    margin-top: 4px;
  }
  .swiper-pagination-current {
    margin-right: -4px;
  }
  .swiper-pagination-total {
    margin-left: -4px;
  }
  & + .project-info {
    margin-top: -16px;
    position: relative;
    z-index: 99;
  }

  .carousel-slide {
    cursor: pointer;
  }

  img,
  video {
    width: 100%;
    height: auto;
    display: block;
  }
`

export default function Carousel({ images, slides, onResize = () => {} }) {
  SwiperCore.use([Pagination])

  const videoRefs = useRef([])

  const normalizedSlides = useMemo(() => {
    if (Array.isArray(slides) && slides.length) {
      return slides
        .map((s) => ({
          type:
            s.type ||
            (String(s.url || '').toLowerCase().includes('.mp4')
              ? 'video'
              : 'image'),
          url: s.url || '',
          alt: s.alt || '',
        }))
        .filter((s) => s.url)
    }

    if (Array.isArray(images) && images.length) {
      return images
        .map((img) => ({
          type: 'image',
          url: get(img, 'url', ''),
          alt: get(img, 'alt', ''),
        }))
        .filter((s) => s.url)
    }

    return []
  }, [slides, images])

  useWindowResize(() => {
    onResize()
  })

  if (!normalizedSlides.length) return null

  return (
    <StyledSwiper className="carousel-wrapper">
      <Swiper
        spaceBetween={8}
        slidesPerView={1}
        loop={true}
        onClick={(swiper) => swiper.slideNext()}
        pagination={{
          el: '.swiper-pagination',
          clickable: true,
          type: 'fraction',
        }}
        onResize={(swiper) => {
          delay(() => {
            swiper.update()
          }, 250)
        }}
        onSlideChange={() => {
          // ensure videos restart cleanly when slides change
          videoRefs.current.forEach((video) => {
            if (video) {
              video.pause()
              video.currentTime = 0
              video.play().catch(() => {})
            }
          })
        }}
      >
        {normalizedSlides.map((s, index) => (
          <SwiperSlide key={index}>
            <div className="carousel-slide">
              {s.type === 'video' ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={s.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls={false}
                  onLoadedMetadata={onResize}
                />
              ) : (
                <img src={s.url} alt={s.alt || ''} onLoad={onResize} />
              )}
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination" />
      </Swiper>
    </StyledSwiper>
  )
}
