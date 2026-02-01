import React, { useEffect, useState } from 'react'
import Prismic from 'prismic-javascript'
import { RichText } from 'prismic-reactjs'
import get from 'lodash/get'
import { client } from '../prismic-configuration'
import NotFound from './NotFound'
import FrontPage from '../components/FrontPage'
import FrontMobile from '../components/FrontMobile'
import { useMediaQuery } from 'react-responsive'
import { Helmet } from 'react-helmet'

const Page = ({ match }) => {
  const [pageData, setPageData] = useState(null)
  const [notFound, toggleNotFound] = useState(false)

  // Get the page document from Prismic
  useEffect(() => {
    const fetchData = async () => {
      // We are using the function to get a document by its UID
      const about = client.getByUID('about', 'about')
      const siteSettings = client.query(
        Prismic.Predicates.at('document.type', 'site_settings'),
      )
      const groups = client.query(Prismic.Predicates.at('document.type', 'client'))
      const result = await Promise.all([about, groups, siteSettings])

      if (result) {
        // We use the State hook to save the document
        return setPageData(result)
      } else {
        // Otherwise show an error message
        console.warn(
          'Page document not found. Make sure it exists in your Prismic repository',
        )
        toggleNotFound(true)
      }
    }
    fetchData()
  }, []) // Skip the Effect hook if the UID hasn't changed

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  })

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })

  if (pageData) {
    const siteSettings = get(pageData[2], 'results[0].data', {})

    return (
      <div className="home-page">
        <Helmet>
          {get(siteSettings, 'site_title', '') && (
            <title>{RichText.asText(get(siteSettings, 'site_title', ''))}</title>
          )}
          {get(siteSettings, 'site_meta_description', '') && (
            <meta
              name="description"
              content={RichText.asText(
                get(siteSettings, 'site_meta_description', ''),
              )}
            />
          )}

          <link rel="icon" href={get(siteSettings, 'favicon.url', '')} />
          <meta
            itemProp="image"
            content={get(siteSettings, 'site_meta_image__1200_x_627_.url', '')}
          />
          <meta
            property="og:url"
            content={get(siteSettings, 'site_meta_image__1200_x_627_.url', '')}
          />
          <meta property="og:type" content="Website" />
          <meta
            property="og:title"
            content={RichText.asText(get(siteSettings, 'site_title', ''))}
          />
          <meta
            property="og:site_name"
            content={get(siteSettings, 'site_title', '')}
          />
          {get(siteSettings, 'site_meta_description', '') && (
            <meta
              property="og:description"
              content={RichText.asText(
                get(siteSettings, 'site_meta_description', ''),
              )}
            />
          )}
          <meta
            property="og:image"
            content={get(siteSettings, 'site_meta_image__1200_x_627_.url', '')}
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />

          <meta property="twitter:card" content="summary_large_image" />
          <meta
            property="twitter:title"
            content={RichText.asText(get(siteSettings, 'site_title', ''))}
          />
          {get(siteSettings, 'site_meta_description', '') && (
            <meta
              property="twitter:description"
              content={RichText.asText(
                get(siteSettings, 'site_meta_description', ''),
              )}
            />
          )}
          <meta property="twitter:site" content={'/'} />
          <meta property="twitter:url" content={'/'} />
          <meta
            property="twitter:image"
            content={get(siteSettings, 'site_meta_image__1200_x_627_.url', '')}
          />
        </Helmet>
        {isDesktopOrLaptop && <FrontPage pageData={pageData} />}
        {isTabletOrMobile && <FrontMobile pageData={pageData} />}
      </div>
    )
  } else if (notFound) {
    return <NotFound />
  }
  return null
}

export default Page
