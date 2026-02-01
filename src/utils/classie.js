/**
 * @module lib/domClass
 * Utility function to add and remove classes from DOM element
 * @author Khoa Pham <khoa.pham@me.com>
 */

export function addClass(el, className) {
  if (!el || !el.classList) {
    return false
  }

  if (el.classList) {
    el.classList.add(className)
  } else {
    el.className = ` ${className}`
  }
}

export function removeClass(el, className) {
  if (!el || !el.classList) {
    return false
  }

  if (el.classList) {
    el.classList.remove(className)
  } else {
    el.className = el.className.replace(
      new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'),
      ' ',
    )
  }
}

export function hasClass(el, className) {
  if (!el || !el.classList) {
    return false
  }

  if (el.classList) {
    return el.classList.contains(className)
  }
  return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className)
}

export function toggleClass(el, className) {
  if (!el || !el.classList) {
    return false
  }

  const fn = hasClass(el, className) ? removeClass : addClass
  fn(el, className)
}
