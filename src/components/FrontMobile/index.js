import React, { useEffect, useState } from 'react'
import PasswordGate from '../PasswordGate'
import { isAuthedClient } from '../../utils/auth'
import { RichText } from 'prismic-reactjs'
import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import get from 'lodash/get'
import gsap from 'gsap'
import styled from 'styled-components'
import { addClass, hasClass, removeClass } from '../../utils/classie'
import ClientList from '../ClientList'
import { openLinksNewTab } from '../../utils/helpers'
import Grid from '../Grid'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const StyledPage = styled.div`
  opacity: 0;
`

const StyledSiteBackground = styled.div`
  position: fixed;
  background: url(${(props) => props.background}) center center no-repeat;
  background-size: cover;
  width: 100vw;
  height: 100vh;
  z-index: -1;
`

const StyledColumn = styled.div`
  background: ${(props) => props.background};
  color: ${(props) => props.color};
  padding: 0 8px;
  display: block;
  width: 100vw;
  height: calc(calc(100vh - 38px) / 2);
  overflow: auto;
  position: relative;

  &.column-bio {
    font-family: 'Sneak Regular', 'Helvetica Neue', sans-serif;
    height: 40px;

    .client {
      padding-left: 0.5rem;
    }
    .project {
      padding-left: 1rem;
    }
    .column-header:before {
    }
  }

  &.column-art .client {
    display: none;
  }

  .column-inner-content {
    padding-bottom: 16px;
  }

  .column-header {
    position: sticky;
    top: 0;
    z-index: 999;
    padding: 11px 0;
    background: ${(props) => props.background};
    color: ${(props) => props.color};
    cursor: pointer;

    &:before {      
    }
  }

  &.column-bio .bio {
    margin-bottom: 8px;
  }

  .border-bottom {
    border-bottom: 1px solid ${(props) => props.color};
    padding: 8px 0;
    margin-bottom: 8px;
  }

  .border-top {
    border-top: 1px solid ${(props) => props.color};
    padding: 8px 0;
  }

  &.initial {
    .column-header:before {
    }
  }

  &.expanded {
    .column-header:before {
      
    }
  }
`

function FrontPageMobile({ pageData }) {
  const bio = pageData[0]
  let groups = []
  if (get(pageData, '[1].results', []).length > 0) {
    groups = groupBy(get(pageData, '[1].results', []), 'data.category')
  }

  // FIX: typo "Camapign" -> "Campaign"
  const works = sortBy(get(groups, 'Campaign', []), 'uid')
  const arts = sortBy(get(groups, 'Digital', []), 'uid')
  const siteSettings = get(pageData[2], 'results[0].data', {})

  const MIN_HEIGHT = 38

  // Keep mobile in sync with desktop auth cookie
  const [authed, setAuthed] = useState(() => isAuthedClient())

  useEffect(() => {
    openLinksNewTab()
  }, [])

  const handleClickTitle = (columnType) => {
    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')
    const windowHeight = window.innerHeight

    if (!columnBio || !columnWork || !columnArt) return

    removeClass(columnWork, 'initial')
    removeClass(columnArt, 'initial')

    if (columnType === 'bio') {
      removeClass(columnWork, 'expanded')
      removeClass(columnArt, 'expanded')

      if (hasClass(columnBio, 'expanded')) {
        removeClass(columnBio, 'expanded')
        gsap.to([columnBio, columnWork, columnArt], 0.4, { height: MIN_HEIGHT })
      } else {
        addClass(columnBio, 'expanded')
        gsap.to([columnWork, columnArt, columnBio], 0.4, { height: MIN_HEIGHT })
        gsap.to(columnBio, 0.4, { height: windowHeight - 2 * MIN_HEIGHT })
      }
    } else if (columnType === 'art') {
      removeClass(columnBio, 'expanded')

      if (!hasClass(columnArt, 'expanded')) {
        addClass(columnArt, 'expanded')
        removeClass(columnWork, 'expanded')
        gsap.to([columnBio, columnWork], 0.4, { height: MIN_HEIGHT })
        gsap.to(columnArt, 0.4, { height: windowHeight - 2 * MIN_HEIGHT })
      } else if (!hasClass(columnWork, 'expanded') && !hasClass(columnBio, 'expanded')) {
        removeClass(columnArt, 'expanded')
        gsap.to([columnBio, columnWork, columnArt], 0.4, { height: MIN_HEIGHT })
      } else if (hasClass(columnArt, 'expanded')) {
        removeClass(columnArt, 'expanded')
        addClass(columnWork, 'expanded')
        gsap.to([columnBio, columnArt], 0.4, { height: MIN_HEIGHT })
        gsap.to(columnWork, 0.4, { height: windowHeight - 2 * MIN_HEIGHT })
      }
    } else if (columnType === 'work') {
      removeClass(columnBio, 'expanded')

      if (hasClass(columnWork, 'expanded')) {
        removeClass(columnWork, 'expanded')
        addClass(columnArt, 'expanded')
        gsap.to([columnBio, columnWork], 0.4, { height: MIN_HEIGHT })
        gsap.to(columnArt, 0.4, { height: windowHeight - 2 * MIN_HEIGHT })
      } else {
        addClass(columnWork, 'expanded')
        removeClass(columnArt, 'expanded')
        gsap.to([columnBio, columnArt], 0.4, { height: MIN_HEIGHT })
        gsap.to(columnWork, 0.4, { height: windowHeight - 2 * MIN_HEIGHT })
      }
    }
  }

  // Handling the link click on project (UPDATED to match Desktop behavior + new ClientList prop)
  const handleProjectClick = (columnClass, wayfinderId) => {
    const elmt = document.getElementById(wayfinderId)
    if (!elmt) return

    const container = document.querySelector(`.${columnClass}`)
    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')
    const windowHeight = window.innerHeight

    if (!container || !columnBio || !columnWork || !columnArt) return

    if (columnClass === 'column-art') {
      addClass(columnArt, 'expanded')
      removeClass(columnWork, 'expanded')

      // collapse others, expand target, then scroll
      gsap.to([columnBio, columnWork], 0.4, {
        height: MIN_HEIGHT,
        onComplete: () => removeClass(columnBio, 'expanded'),
      })
      gsap.to(columnArt, 0.4, {
        height: windowHeight - 2 * MIN_HEIGHT,
        onComplete: () => gsap.to(container, { duration: 0.6, scrollTo: elmt }),
      })
    } else if (columnClass === 'column-work') {
      addClass(columnWork, 'expanded')
      removeClass(columnArt, 'expanded')

      gsap.to([columnBio, columnArt], 0.4, {
        height: MIN_HEIGHT,
        onComplete: () => removeClass(columnBio, 'expanded'),
      })
      gsap.to(columnWork, 0.4, {
        height: windowHeight - 2 * MIN_HEIGHT,
        onComplete: () => gsap.to(container, { duration: 0.6, scrollTo: elmt }),
      })
    }
  }

  // Default mobile state (when unlocked): Jordan expanded, Campaign/Digital collapsed
  const setInitialMobileState = () => {
    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')
    const windowHeight = window.innerHeight

    if (!columnBio || !columnWork || !columnArt) return

    addClass(columnBio, 'expanded')
    removeClass(columnWork, 'expanded')
    removeClass(columnArt, 'expanded')

    // ensure arrows reflect collapsed state
    removeClass(columnWork, 'initial')
    removeClass(columnArt, 'initial')

    gsap.set(columnWork, { height: MIN_HEIGHT })
    gsap.set(columnArt, { height: MIN_HEIGHT })
    gsap.set(columnBio, { height: windowHeight - 2 * MIN_HEIGHT })
  }

  useEffect(() => {
    // Don’t run GSAP layout for locked state
    if (!authed) return

    gsap.set('.home-page', { height: window.innerHeight })
    gsap.to('.page-container', 0.6, { opacity: 1, delay: 1 })
    setInitialMobileState()

    // keep heights sane on rotate / resize
    const onResize = () => setInitialMobileState()
    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [authed])

  // Locked mobile view: only Jordan bio + select clients + password
  if (!authed) {
    return (
      <StyledPage className="page-container" style={{ opacity: 1 }}>
        {get(siteSettings, 'use_site_background_image', '') && (
          <StyledSiteBackground
            className="site-background"
            background={get(siteSettings, 'site_background_image.url', '')}
          />
        )}

        <StyledColumn
          className="column column-bio expanded"
          background={siteSettings.about_background_color}
          color={siteSettings.about_text_color}
          style={{ height: '100vh' }}
        >
          <p className="column-header">
            <span className="first">Jordan</span>
            <span className="last"> Philips</span>
          </p>

          <div className="column-inner-content">
            <div className="bio">{<RichText render={bio.data.bio} />}</div>

            <div className="clients border-top">
              {<RichText render={bio.data.select_clients} />}
            </div>

            <PasswordGate
              textColor={siteSettings.about_text_color}
              onSuccess={() => setAuthed(true)}
            />
          </div>
        </StyledColumn>
      </StyledPage>
    )
  }

  return (
    <StyledPage className="page-container">
      {get(siteSettings, 'use_site_background_image', '') && (
        <StyledSiteBackground
          className="site-background"
          background={get(siteSettings, 'site_background_image.url', '')}
        />
      )}

      <StyledColumn
        className="column column-bio"
        background={siteSettings.about_background_color}
        color={siteSettings.about_text_color}
      >
        <span className="column-placeholder" onClick={() => handleClickTitle('bio')} />
        <p onClick={() => handleClickTitle('bio')} className="column-header">
          <span className="first">Jordan</span>
          <span className="last"> Philips</span>
        </p>

        <div className="column-inner-content">
          <div className="bio border-top">{<RichText render={bio.data.bio} />}</div>

          <div className="clients border-top">
            <div className="client-work">
              <p>Brand</p>
              <ClientList
                clients={works}
                handleProjectClick={handleProjectClick}
                columnClass="column-work"
              />
            </div>

            <div className="client-art">
              <p>Digital</p>
              <ClientList
                clients={arts}
                handleProjectClick={handleProjectClick}
                columnClass="column-art"
              />
            </div>
          </div>

          <div className="clients border-top">{<RichText render={bio.data.select_clients} />}</div>
          <div className="award border-top">{<RichText render={get(bio, 'data.awards')} />}</div>
          <div className="credit">{<RichText render={get(bio, 'data.site_credit')} />}</div>
        </div>
      </StyledColumn>

      <StyledColumn
        className="column column-work"
        background={siteSettings.work_background_color}
        color={siteSettings.work_text_color}
      >
        <p onClick={() => handleClickTitle('work')} className="column-header">
          Brand ↗
        </p>
        <div className="column-inner-content">
          <Grid clients={works} playerTheme={'red'} />
        </div>
      </StyledColumn>

      <StyledColumn
        className="column column-art"
        background={siteSettings.art_background_color}
        color={siteSettings.art_text_color}
      >
        <p onClick={() => handleClickTitle('art')} className="column-header">
          Digital ↗
        </p>
        <div className="column-inner-content">
          <Grid clients={arts} playerTheme={'blue'} />
        </div>
      </StyledColumn>
    </StyledPage>
  )
}

export default FrontPageMobile
