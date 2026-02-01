import React from 'react'
import sortBy from 'lodash/sortBy'
import get from 'lodash/get'
import { RichText } from 'prismic-reactjs'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

function ClientList({ clients, handleProjectClick, columnClass }) {
  if (!clients) return null

  const scrollToProject = (wayfinderId) => {
    const elmt = document.getElementById(wayfinderId)
    if (!elmt) return

    // If FrontPage passed a handler, prefer it (keeps expand/collapse behavior)
    if (typeof handleProjectClick === 'function') {
      try {
        handleProjectClick(columnClass, wayfinderId)
        return
      } catch (e) {
        // fall through
      }
    }

    // Fallback: try to scroll the column container directly
    const container =
      (columnClass && document.querySelector(`.${columnClass}`)) ||
      document.querySelector('.page-container')

    if (container) {
      try {
        gsap.to(container, { duration: 0.6, scrollTo: elmt })
        return
      } catch (e) {
        // fall through
      }
    }

    // Final fallback
    try {
      elmt.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e) {}
  }

  return (
    <div className="client-list-wrapper">
      {clients.map((client, clientIndex) => {
        const projects = sortBy(
          get(client, 'data.body', []),
          'primary.project_title[0].text',
        )

        const clientWayfinderId = `${get(client, 'data.category', 'project')}-${clientIndex}-0`

        return (
          <div key={`client-${clientIndex}`}>
            <div className="client">
              <div
                className="cursor-pointer"
                onClick={() => scrollToProject(clientWayfinderId)}
              >
                {RichText.asText(get(client, 'data.group_name'))}
              </div>

              {projects.length > 0 && (
                <ul className="projects">
                  {projects.map((p, projectIndex) => {
                    const wayfinderId = `${get(
                      client,
                      'data.category',
                      'project',
                    )}-${clientIndex}-${projectIndex}`

                    return (
                      <li
                        className={`cursor-pointer project ${wayfinderId}`}
                        key={`project-${clientIndex}-${projectIndex}`}
                        onClick={() => scrollToProject(wayfinderId)}
                      >
                        <div>{RichText.asText(get(p, 'primary.project_title'))}</div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ClientList
