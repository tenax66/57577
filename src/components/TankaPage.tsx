import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Tanka } from '../types/tanka'
import { Header } from './Header/Header'
import styles from './TankaPage.module.scss'

type APIResponse = {
  tanka: Tanka
}

export const TankaPage = () => {
  const { tankaId } = useParams<{ tankaId: string }>()
  const [tanka, setTanka] = useState<Tanka | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTanka = async () => {
      if (!tankaId) return

      try {
        const response = await fetch(`/api/tankas/${tankaId}`)
        if (!response.ok) throw new Error('短歌の取得に失敗しました')
        const data = await response.json() as APIResponse
        setTanka(data.tanka)
      } catch (e) {
        setError(e instanceof Error ? e.message : '短歌の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTanka()
  }, [tankaId])

  if (!tankaId) return <div>短歌が見つかりません</div>
  if (isLoading) return <div>Loading...</div>
  if (!tanka) return <div>短歌が見つかりません</div>

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.tankaCard}>
        <p className={styles.content}>{tanka.content}</p>
        <div className={styles.metadata}>
          <Link to={`/users/${tanka.clerk_id}`} className={styles.author}>
            {tanka.display_name}
          </Link>
          <time className={styles.date}>
            {new Date(tanka.created_at).toLocaleDateString('ja-JP')}
          </time>
        </div>
      </div>
    </div>
  )
} 
