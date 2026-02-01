import React, { useState, useRef, useMemo } from 'react'
import get from 'lodash/get'
import { RichText } from 'prismic-reactjs'
import gsap from 'gsap'
import styled from 'styled-components'

const StyledProjectInfo = styled.div`
  margin: 8px 0 8px 0;
  .project-title {
    cursor: pointer;
    margin-bottom: 8px;
    &:after {
      content: '↓';
      margin-left: 8px;
    }
    &.expanded-true:after {
      content: '↑';
    }
  }

  .client {
    &:after {
      content: ', ';
    }
  }

  .project-description {
    display: block;
    height: 0;
    overflow: hidden;
    position: relative;
    width: 100%;
    .description-inner-content {
      margin-bottom: 16px;
    }
  }
`

// Handles both Prismic Rich Text arrays and plain strings
const asText = (v) => {
  if (!v) return ''
  if (Array.isArray(v)) return RichText.asText(v)
  if (typeof v === 'string') return v
  return ''
}

function ProjectInfo({ client, project, onResize }) {
  const desc = useRef(null)
  const [descExpanded, setDescExpaned] = useState(false)

  // Parent label fallback chain so Art + Work behave the same
  const parentLabel = useMemo(() => {
    return (
      asText(get(client, 'data.group_name')) ||
      asText(get(client, 'data.title')) ||
      asText(get(client, 'data.client_name')) ||
      get(client, 'uid', '')
    )
  }, [client])

  const projectTitle = useMemo(
    () => asText(get(project, 'primary.project_title')),
    [project],
  )

  const handleProjectTitleClick = () => {
    if (desc && desc.current) {
      if (descExpanded) {
        gsap.to(desc.current, 0.3, {
          height: 0,
          onComplete: () => {
            onResize()
          },
        })
      } else {
        gsap.set(desc.current, {
          height: 'auto',
          opacity: 0,
          onComplete: () => {
            onResize()
          },
        })

        gsap.to(desc.current, 0.3, {
          opacity: 1,
        })
      }
      setDescExpaned(!descExpanded)
    }
  }

  return (
    <StyledProjectInfo className="project-info">
      <div
        className={`project-title expanded-${descExpanded}`}
        onClick={handleProjectTitleClick}
      >
        {parentLabel ? <span className="client">{parentLabel}</span> : null}
        {projectTitle}
      </div>

      {get(project, 'primary.project_description') && (
        <div className="project-description" ref={desc}>
          <div className="description-inner-content">
            <RichText render={get(project, 'primary.project_description')} />
          </div>
        </div>
      )}
    </StyledProjectInfo>
  )
}

export default ProjectInfo
