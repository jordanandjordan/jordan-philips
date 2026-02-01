import { css } from 'styled-components'

// Small devices (landscape phones, 576px and up)
// Medium devices (tablets, 768px and up)
// Large devices (desktops, 992px and up)
// Extra large devices (large desktops, 1200px and up)

const breakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',
  xxl: '1400px',
}

export const mq = (index) => (...args) => css`
  @media (min-width: ${breakpoints[index]}) {
    ${css(...args)};
  }
`

export const mqMax = (index) => (...args) => css`
  @media (max-width: ${breakpoints[index]}) {
    ${css(...args)};
  }
`
