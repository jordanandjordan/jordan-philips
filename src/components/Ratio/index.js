import React from 'react'

function Ratio(props) {
  return (
    <div
      className="ratio-wrapper"
      styles={{
        height: 0,
        width: '100%',
        overflow: 'hidden',
        paddingBottom: `calc(100% * 1 / (${props.ratio}))`,
        position: 'relative',
      }}
    >
      <div
        className="ratio-content"
        styles={{
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      >
        {props.children}
      </div>
    </div>
  )
}

export default Ratio
