import React, { useEffect, useState } from 'react'
import { RichText } from 'prismic-reactjs'
import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import get from 'lodash/get'
import gsap from 'gsap'
import styled from 'styled-components'
import { addClass, hasClass, removeClass } from '../../utils/classie'
import ClientList from '../ClientList'
import Grid from '../Grid'
import PasswordGate from '../PasswordGate'
import { openLinksNewTab } from '../../utils/helpers'
import { isAuthedClient } from '../../utils/auth'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const resizeGridItem = (item) => {
  const rowHeight = 20
  const rowGap = 8

  const content = item?.querySelector?.('.content')
  if (!content) return

  const rowSpan = Math.ceil(
    (content.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap),
  )

  item.style.gridRowEnd = 'span ' + rowSpan
}

const resizeAllGrid = () => {
  const allItems = document.getElementsByClassName('grid-item')
  for (let x = 0; x < allItems.length; x++) {
    resizeGridItem(allItems[x])
  }
}

const StyledPage = styled.div`
  min-width: calc(100vw + 2px);
  overflow: hidden;
  &.expanded {
    .grid-wrapper {
      display: grid;
      grid-gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(47%, 1fr));
      grid-auto-rows: 20px;
    }
  }
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
  float: left;
  min-width: 62px;
  height: 100vh;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow: auto;
  width: calc(calc(100vw - 300px) / 2);
  position: relative;

  &.column-bio {
    max-width: 300px;
    font-family: 'Sneak Regular', 'Helvetica Neue', sans-serif;
    .client {
      padding-left: 0.5rem;
    }
    .project {
      padding-left: 1rem;
    }
  }

  &.column.collapsed .column-placeholder {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    cursor: pointer;
  }

  .border-top {
    border-top: 1px solid ${(props) => props.color};
    padding: 8px 0 0;
    margin-top: 8px;
  }

  .border-bottom {
    border-bottom: 1px solid ${(props) => props.color};
    padding: 8px 0;
    margin-bottom: 8px;
  }

  .column-inner-content {
    padding-bottom: 16px;
  }

  .column-header {
    position: sticky;
    top: 0;
    z-index: 999;
    padding: 8px 0;
    background: ${(props) => props.background};
    color: ${(props) => props.color};
    cursor: pointer;
  }

  &.column.collapsed {
    overflow: hidden;
  }

  &.column-bio.collapsed {
    .last {
      display: none;
    }
    .border-bottom {
      border: none;
    }
  }
`

function FrontPage({ pageData }) {
  const tl = gsap.timeline({})
  const [authed, setAuthed] = useState(() => isAuthedClient())
  const bio = pageData[0]
  let groups = []

  if (get(pageData, '[1].results', []).length > 0) {
    groups = groupBy(get(pageData, '[1].results', []), 'data.category')
  }

  const siteSettings = get(pageData[2], 'results[0].data', {})

  const MAX_BIO = 300
  const MIN_COLUMN = 62

  // ---- SORTING (A–Z by client/group name; projects handled inside ClientList) ----
  const getClientSortKey = (client) => {
    const groupName = RichText.asText(get(client, 'data.group_name', []))
    return (groupName || get(client, 'uid', '') || '').toLowerCase()
  }

  // Campaign can stay uid-sorted if you want; change to getClientSortKey for A–Z
  const works = sortBy(get(groups, 'Campaign', []), 'uid')

  // Digital: A–Z by client/group name
  const arts = sortBy(get(groups, 'Digital', []), getClientSortKey)
  // ------------------------------------------------------------------------------

  const triggerResize = () => {
    window.dispatchEvent(new Event('resize'))
  }

  useEffect(() => {
    openLinksNewTab()
    setAuthed(isAuthedClient())
    gsap.set('.home-page', { height: window.innerHeight })
  }, [])

  //---------------------------------------------------------------------------
  // When window resize
  const onResize = () => {
    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')

    if (!columnBio || !columnWork || !columnArt) return

    const singleExpand = hasClass(columnBio, 'collapsed')
      ? Math.ceil((window.innerWidth - MIN_COLUMN) / 2)
      : Math.ceil((window.innerWidth - MAX_BIO) / 2)

    const doubleExpand = hasClass(columnBio, 'collapsed')
      ? window.innerWidth - MIN_COLUMN - MIN_COLUMN
      : window.innerWidth - MAX_BIO - MIN_COLUMN

    if (!hasClass(columnWork, 'collapsed') && !hasClass(columnArt, 'collapsed')) {
      gsap.to(columnWork, 0, { width: singleExpand })
      gsap.to(columnArt, 0, {
        width: singleExpand,
        onComplete: () => {
          resizeAllGrid()
        },
      })
    } else if (
      hasClass(columnWork, 'collapsed') &&
      !hasClass(columnArt, 'collapsed')
    ) {
      gsap.to(columnArt, 0, {
        width: doubleExpand,
        onComplete: () => {
          resizeAllGrid()
        },
      })
    } else if (
      hasClass(columnArt, 'collapsed') &&
      !hasClass(columnWork, 'collapsed')
    ) {
      gsap.set(columnWork, { opacity: 1 })
      gsap.to(columnWork, 0, {
        width: doubleExpand,
        onComplete: () => {
          resizeAllGrid()
        },
      })
    } else {
      resizeAllGrid()
    }
  }

  const expandColumnDouble = (expand, collapse) => {
    const columnBio = document.querySelector('.column-bio')
    const innerExpand = expand?.querySelector?.('.column-inner-content')
    const pageContainer = document.querySelector('.page-container')

    if (!columnBio || !innerExpand || !pageContainer) return

    const doubleExpand = hasClass(columnBio, 'collapsed')
      ? window.innerWidth - MIN_COLUMN - MIN_COLUMN
      : window.innerWidth - MAX_BIO - MIN_COLUMN

    tl.to(innerExpand, 0.3, {
      opacity: 0,
      onComplete: () => {
        resizeAllGrid()
        addClass(pageContainer, 'expanded')
      },
    }).addLabel('start')

    tl.to(collapse, 0.4, { width: MIN_COLUMN }, 'start')
    tl.to(
      expand,
      0.4,
      {
        width: doubleExpand,
        onComplete: () => {
          triggerResize()
        },
      },
      'start',
    ).addLabel('end')

    tl.to(innerExpand, 0.5, { opacity: 1 }, 'end')
  }

  //---------------------------------------------------------------------------
  // When column art change
  const onColumnArtChange = () => {
    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')

    const pageContainer = document.querySelector('.page-container')
    if (!columnBio || !columnWork || !columnArt || !pageContainer) return

    const singleExpand = hasClass(columnBio, 'collapsed')
      ? Math.ceil((window.innerWidth - MIN_COLUMN) / 2)
      : Math.ceil((window.innerWidth - MAX_BIO) / 2)

    const doubleExpand = hasClass(columnBio, 'collapsed')
      ? window.innerWidth - MIN_COLUMN - MIN_COLUMN
      : window.innerWidth - MAX_BIO - MIN_COLUMN

    if (hasClass(columnWork, 'collapsed') && hasClass(columnArt, 'collapsed')) {
      addClass(pageContainer, 'expanded')
      gsap.to(columnArt, 0.4, {
        width: doubleExpand,
        onComplete: () => {
          resizeAllGrid()
          triggerResize()
        },
      })
    } else if (
      !hasClass(columnWork, 'collapsed') &&
      !hasClass(columnArt, 'collapsed')
    ) {
      expandColumnDouble(columnWork, columnArt)
    } else if (
      hasClass(columnWork, 'collapsed') &&
      !hasClass(columnArt, 'collapsed')
    ) {
      gsap.to(columnArt, 0.4, { width: MIN_COLUMN })
      removeClass(pageContainer, 'expanded')
    } else if (
      !hasClass(columnWork, 'collapsed') &&
      hasClass(columnArt, 'collapsed')
    ) {
      removeClass(pageContainer, 'expanded')
      gsap.to(columnArt, 0.4, { width: singleExpand, onComplete: triggerResize })
      gsap.to(columnWork, 0.4, { width: singleExpand })
    }
  }

  //---------------------------------------------------------------------------
  // When column work change
  const onColumnWorkChange = () => {
    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')
    const pageContainer = document.querySelector('.page-container')

    if (!columnBio || !columnWork || !columnArt || !pageContainer) return

    const singleExpand = hasClass(columnBio, 'collapsed')
      ? Math.ceil((window.innerWidth - MIN_COLUMN) / 2)
      : Math.ceil((window.innerWidth - MAX_BIO) / 2)

    const doubleExpand = hasClass(columnBio, 'collapsed')
      ? window.innerWidth - MIN_COLUMN - MIN_COLUMN
      : window.innerWidth - MAX_BIO - MIN_COLUMN

    if (hasClass(columnArt, 'collapsed') && hasClass(columnWork, 'collapsed')) {
      addClass(pageContainer, 'expanded')
      gsap.to(columnWork, 0.4, {
        width: doubleExpand,
        onComplete: () => {
          triggerResize()
          resizeAllGrid()
        },
      })
    } else if (
      !hasClass(columnArt, 'collapsed') &&
      !hasClass(columnWork, 'collapsed')
    ) {
      expandColumnDouble(columnArt, columnWork)
    } else if (
      hasClass(columnArt, 'collapsed') &&
      !hasClass(columnWork, 'collapsed')
    ) {
      removeClass(pageContainer, 'expanded')
      gsap.to(columnWork, 0.4, { width: MIN_COLUMN })
    } else if (
      !hasClass(columnArt, 'collapsed') &&
      hasClass(columnWork, 'collapsed')
    ) {
      removeClass(pageContainer, 'expanded')
      gsap.to(columnWork, 0.4, { width: singleExpand })
      gsap.to(columnArt, 0.4, { width: singleExpand, onComplete: triggerResize })
    }
  }

  //---------------------------------------------------------------------------
  // When column bio change
  const onColumnBioChange = () => {
    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')
    const pageContainer = document.querySelector('.page-container')

    if (!columnBio || !columnWork || !columnArt || !pageContainer) return

    if (hasClass(columnBio, 'collapsed')) {
      gsap.to(columnBio, 0.4, { width: MAX_BIO })
    } else {
      gsap.to(columnBio, 0.4, { width: MIN_COLUMN })
    }

    const singleExpand = hasClass(columnBio, 'collapsed')
      ? Math.ceil((window.innerWidth - MAX_BIO) / 2)
      : Math.ceil((window.innerWidth - MIN_COLUMN) / 2)

    const doubleExpand = hasClass(columnBio, 'collapsed')
      ? window.innerWidth - MAX_BIO - MIN_COLUMN
      : window.innerWidth - MIN_COLUMN - MIN_COLUMN

    if (!hasClass(columnArt, 'collapsed') && !hasClass(columnWork, 'collapsed')) {
      gsap.to(columnWork, 0.4, { width: singleExpand })
      gsap.to(columnArt, 0.4, { width: singleExpand, onComplete: triggerResize })
      removeClass(pageContainer, 'expanded')
    } else if (
      hasClass(columnArt, 'collapsed') &&
      !hasClass(columnWork, 'collapsed')
    ) {
      gsap.to(columnWork, 0.4, {
        width: doubleExpand,
        opacity: 1,
        onComplete: () => {
          resizeAllGrid()
          triggerResize()
        },
      })
      addClass(pageContainer, 'expanded')
    } else if (
      !hasClass(columnArt, 'collapsed') &&
      hasClass(columnWork, 'collapsed')
    ) {
      gsap.to(columnArt, 0.4, {
        width: doubleExpand,
        onComplete: () => {
          resizeAllGrid()
          triggerResize()
        },
      })
      addClass(pageContainer, 'expanded')
    }
  }

  const handleClickTitle = (columnType) => {
    const column = document.querySelector(`.column-${columnType}`)
    const innerContent = document.querySelector(`.column-${columnType} .column-inner-content`)
    if (!column || !innerContent) return

    gsap.killTweensOf(innerContent)

    if (columnType === 'bio') onColumnBioChange()
    else if (columnType === 'art') onColumnArtChange()
    else if (columnType === 'work') onColumnWorkChange()

    if (hasClass(column, 'collapsed')) {
      removeClass(column, 'collapsed')
      gsap.to(innerContent, 0.5, { autoAlpha: 1, delay: 0.5 })
    } else {
      addClass(column, 'collapsed')
      gsap.to(innerContent, 0, { autoAlpha: 0 })
    }
  }

  // Handling the link click on project (this is the key)
  const handleProjectClick = (columnClass, wayfinderId) => {
    const elmt = document.getElementById(wayfinderId)
    if (!elmt) return

    const container = document.querySelector(`.${columnClass}`)
    if (!container) return

    const columnBio = document.querySelector('.column-bio')
    const columnWork = document.querySelector('.column-work')
    const columnArt = document.querySelector('.column-art')
    const pageContainer = document.querySelector('.page-container')

    if (!columnBio || !columnWork || !columnArt || !pageContainer) return

    const singleExpand = hasClass(columnBio, 'collapsed')
      ? Math.ceil((window.innerWidth - MIN_COLUMN) / 2)
      : Math.ceil((window.innerWidth - MAX_BIO) / 2)

    if (hasClass(columnArt, 'collapsed') && hasClass(columnWork, 'collapsed')) {
      removeClass(pageContainer, 'expanded')
      removeClass(columnWork, 'collapsed')
      removeClass(columnArt, 'collapsed')
      gsap.to([columnWork, columnArt], 0.4, {
        width: singleExpand,
        onComplete: () => {
          triggerResize()
          gsap.to(container, { duration: 0.6, scrollTo: elmt })
        },
      })
      gsap.to('.column-inner-content', 0.5, { autoAlpha: 1, delay: 0.6 })
      return
    }

    const targetIsWork = columnClass === 'column-work'
    const targetColumn = targetIsWork ? columnWork : columnArt
    const otherColumn = targetIsWork ? columnArt : columnWork

    if (hasClass(targetColumn, 'collapsed') && !hasClass(otherColumn, 'collapsed')) {
      removeClass(pageContainer, 'expanded')
      removeClass(targetColumn, 'collapsed')
      gsap.to([targetColumn, otherColumn], 0.4, {
        width: singleExpand,
        onComplete: () => {
          triggerResize()
          gsap.to(container, { duration: 0.6, scrollTo: elmt })
        },
      })
      gsap.to('.column-inner-content', 0.5, { autoAlpha: 1, delay: 0.6 })
      return
    }

    gsap.to(container, { duration: 0.6, scrollTo: elmt })
  }

  if (!authed) {
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
          <p className="column-header border-bottom">
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
              onSuccess={() => {
                setAuthed(true)
                window.location.reload()
              }}
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
        <p onClick={() => handleClickTitle('bio')} className="column-header border-bottom">
          <span className="first">Jordan</span>
          <span className="last"> Philips</span>
        </p>

        <div className="column-inner-content">
          <div className="bio">{<RichText render={bio.data.bio} />}</div>

          <div className="clients border-top">
            <div className="client-work">
              <p>Campaign</p>
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
        <span className="column-placeholder" onClick={() => handleClickTitle('work')} />
        <p onClick={() => handleClickTitle('work')} className="column-header">
          Campaign
        </p>
        <div className="column-inner-content">
          <Grid clients={works} playerTheme={'red'} onResize={onResize} />
        </div>
      </StyledColumn>

      <StyledColumn
        className="column column-art"
        background={siteSettings.art_background_color}
        color={siteSettings.art_text_color}
      >
        <span className="column-placeholder" onClick={() => handleClickTitle('art')} />
        <p onClick={() => handleClickTitle('art')} className="column-header">
          Digital
        </p>
        <div className="column-inner-content">
          <Grid clients={arts} playerTheme={'blue'} onResize={onResize} />
        </div>
      </StyledColumn>
    </StyledPage>
  )
}

export default FrontPage
