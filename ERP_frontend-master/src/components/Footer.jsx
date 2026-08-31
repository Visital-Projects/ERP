import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import CookieConsent from './CookieConsent'
import feather from 'feather-icons'

const Footer = () => {
  const { settings } = useSelector((state) => state.app)

  useEffect(() => {
    feather.replace()
  }, [])

  useEffect(() => {
    const themeLinks = document.querySelectorAll('.themes-color > a')
    themeLinks.forEach((el) => {
      el.addEventListener('click', (e) => {
        const target = e.target.closest('a')
        const theme = target?.dataset.value
        if (theme) {
          removeClassByPrefix(document.body, 'theme-')
          document.body.classList.add(theme)
        }
      })
    })

    return () => {
      themeLinks.forEach((el) => {
        el.removeEventListener('click', () => {})
      })
    }
  }, [])

  const removeClassByPrefix = (node, prefix) => {
    [...node.classList].forEach((cls) => {
      if (cls.startsWith(prefix)) {
        node.classList.remove(cls)
      }
    })
  }

  // return (
  //   // <footer className="dash-footer bg-white py-2 px-4 shadow-sm border-t">
  //   //   <div className="footer-wrapper text-center text-sm text-gray-500">
  //   //     &copy; {new Date().getFullYear()}{' '}
  //   //     {settings?.footer_text || 'ERPGo'}
  //   //   </div>
  //   //   {settings?.enable_cookie === 'on' && <CookieConsent />}
  //   // </footer>
  // )
}

export default Footer


