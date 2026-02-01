import React from 'react'
import styled from 'styled-components'

const StyledBackgroundImage = styled.div`
  &.background-image-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .background-image {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    min-width: 100%;
    min-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: cover;
    font-family: 'object-fit: cover;';
  }
`

function BackgroundImage(props) {
  const { alt, url } = props

  return (
    <StyledBackgroundImage className="background-image-wrapper">
      <img className="background-image" src={url} alt={alt} />
    </StyledBackgroundImage>
  )
}

export default BackgroundImage
