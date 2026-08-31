import React, { useEffect, useState } from 'react'

const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (consent !== 'accepted') {
      setVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 text-sm flex justify-between items-center">
      <span>This site uses cookies to enhance your experience.</span>
      <button onClick={acceptCookies} className="bg-blue-500 px-3 py-1 rounded ml-4">
        Accept
      </button>
    </div>
  )
}

export default CookieConsent


