import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import styles from './LikeButton.module.scss'

type Props = {
  tankaId: number
  initialLiked: boolean
  likesCount: number
}

export const LikeButton = ({ tankaId, initialLiked, likesCount: initialLikesCount }: Props) => {
  const { user, isLoaded } = useUser()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleLike = async () => {
    if (!user || isProcessing) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/tankas/${tankaId}/likes`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to toggle like')
      
      const { liked } = await response.json()
      setIsLiked(liked)
      setLikesCount(prev => liked ? prev + 1 : prev - 1)
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isLoaded) return null

  return (
    <button 
      onClick={handleLike}
      className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
      disabled={!user || isProcessing}
      title={user ? undefined : 'いいねするにはログインが必要です'}
    >
      <span className={styles.icon}>♥</span>
      <span className={styles.count}>{likesCount}</span>
    </button>
  )
} 
