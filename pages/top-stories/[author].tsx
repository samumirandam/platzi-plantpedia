import { useState, useEffect } from 'react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ErrorPage from '../_error'

import { Layout } from '@components/Layout'
import { PlantCollection } from '@components/PlantCollection'
import { AuthorCard } from '@components/AuthorCard'

import { Typography } from '@ui/Typography'
import { VerticalTabs, TabItem } from '@ui/Tabs'
import { Alert } from '@ui/Alert'

import { getAuthorList, getPlantListByAuthor, QueryStatus } from '@api'
import { IGetPlantListByAuthorQueryVariables } from '@api/generated/graphql'

type TopStoriesPageProps = {
  authors: Author[]
  currentAuthor: Author['handle']
  status: 'error' | 'sucess'
}

export const getServerSideProps: GetServerSideProps<
  TopStoriesPageProps
> = async ({ params, locale }) => {
  const authorHandle = String(params?.author)

  try {
    const authors = await getAuthorList({ limit: 10 })
    const doesAuthorExist = authors.some(
      (author) => author.handle === authorHandle
    )

    // Validates that the author exists and redirects to the first one in the list otherwise.
    if (authors.length > 0 && !doesAuthorExist) {
      const firstAuthor = authors[0].handle

      return {
        redirect: {
          destination: `/top-stories/${firstAuthor}`,
          permanent: false,
        },
      }
    }

    return {
      props: {
        authors,
        currentAuthor: authorHandle,
        status: 'sucess',
        ...(await serverSideTranslations(locale!)),
      },
    }
  } catch (e) {
    return {
      props: {
        authors: [],
        currentAuthor: authorHandle,
        status: 'error',
      },
    }
  }
}

export default function TopStories({
  authors,
  status,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(['page-top-stories'])
  const router = useRouter()
  const currentAuthor = router.query.author

  if (
    typeof currentAuthor !== 'string' ||
    authors.length === 0 ||
    status === 'error'
  ) {
    return <ErrorPage message={t('noInfoAvailable')} />
  }

  const tabs: TabItem[] = authors.map((author) => ({
    content: <AuthorTopStories {...author} />,
    label: author.fullName,
    value: author.handle,
  }))

  return (
    <Layout>
      <main className="pt-10">
        <div className="text-center pb-16">
          <Typography variant="h2" className="text-center pb-16">
            {t('top10Stories')}
          </Typography>
        </div>
        <VerticalTabs
          tabs={tabs}
          currentTab={currentAuthor}
          onTabChange={(_, newValue) => {
            router.push(`/top-stories/${newValue}`, undefined, {
              shallow: true,
            })
          }}
        />
      </main>
    </Layout>
  )
}

type AuthorTopStoriesProps = Author

function AuthorTopStories(author: AuthorTopStoriesProps) {
  const { t } = useTranslation(['page-top-stories'])
  const { data: plants, status } = usePlantListByAuthor({
    authorId: author.id,
    limit: 12,
  })

  return (
    <div>
      <section className="pb-16">
        <AuthorCard {...author} />
      </section>
      {status === 'error' ? (
        <Alert severity="error">{t('somethingWentWrong')}</Alert>
      ) : null}
      {status === 'success' && plants.length === 0 ? (
        <Alert severity="info">
          {t('authorHasNoStories', { name: author.fullName })}
        </Alert>
      ) : null}
      <PlantCollection plants={plants} />
    </div>
  )
}

export const usePlantListByAuthor = (
  args: IGetPlantListByAuthorQueryVariables
) => {
  const [plantList, setPlantList] = useState<Plant[]>([])
  const [status, setStatus] = useState<QueryStatus>('idle')
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setStatus('loading')
    getPlantListByAuthor(args)
      .then((receivedPlants) => {
        setPlantList(receivedPlants)
        setStatus('success')
      })
      .catch((e) => {
        setError(e)
        setStatus('error')
      })
  }, [])

  return {
    data: plantList,
    status,
    error,
  }
}
