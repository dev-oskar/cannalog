import { useState, useEffect } from 'react'

export function useAgeVerification() {
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has already verified their age
    const verified = localStorage.getItem('cannalog_age_verified') === 'true'
    setIsVerified(verified)
    setLoading(false)
  }, [])

  const markAsVerified = () => {
    setIsVerified(true)
  }

  return {
    isVerified,
    loading,
    markAsVerified
  }
}