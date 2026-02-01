const getVimeoMeta = (vimeoId) => {
  return `https://vimeo.com/api/oembed.json?url=https://player.vimeo.com/video/${vimeoId}`
}

const fetcher = (...args) => fetch(...args).then((res) => res.json())

const vimeoIdFromLink = (url) => {
  const match = url.match(/\/?external\/(.*?)([^.hd.mp]+)/g)

  if (match && match.length > 0) {
    return match[0].replace('/external/', '')
  } else if (url.match(/\/?https:\/\/vimeo.com\/(.*?)([^.hd.mp]+)/g)) {
    return url
      .match(/\/?https:\/\/vimeo.com\/(.*?)([^.hd.mp]+)/g)[0]
      .replace('https://vimeo.com/', '')
  }

  return url
}

const openLinksNewTab = () => {
  const { links } = document
  for (let i = 0, linksLength = links.length; i < linksLength; i++) {
    if (links[i].hostname !== window.location.hostname) {
      links[i].target = '_blank'
      links[i].setAttribute('rel', 'noopener noreferrer')
      links[i].className += ' link-external'
    } else {
      links[i].className += ' link-local'
    }
  }
}

export { getVimeoMeta, fetcher, vimeoIdFromLink, openLinksNewTab }
