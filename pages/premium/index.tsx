import { useState, useEffect } from 'react'
import { Layout } from '@components/Layout'
import { GetServerSideProps } from 'next'
import { useSession, getSession } from 'next-auth/react'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)

  if (session === null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: { session },
  }
}

function PremiumPage() {
  const { data: session, status } = useSession()

  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/premium')
      .then((response) => response.json())
      .then(({ data }) => setImageUrl(data))
  }, [])

  if (status === 'loading') {
    return null
  }

  if (session === null) {
    return <Layout>Acceso denegado</Layout>
  }

  return (
    <Layout>
      <div>
        {imageUrl == null ? null : <img src={imageUrl} alt="Random fox" />}
      </div>
    </Layout>
  )
}

export default PremiumPage
