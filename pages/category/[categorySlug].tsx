import { GetStaticProps, InferGetStaticPropsType } from 'next'

import { getCategoryList, getPlantListByCategory } from '@api'

import { Layout } from '@components/Layout'
import { PlantCollection } from '@components/PlantCollection'

import { Typography } from '@ui/Typography'
import { Alert } from '@ui/Alert'

type CategoryEntryProps = {
  entries: Plant[]
  category: Category
}

type PathType = {
  params: {
    categorySlug: string
  }
}

export const getStaticPaths = async () => {
  const categories = await getCategoryList({ limit: 10 })

  const paths: PathType[] = categories.map(({ slug: categorySlug }) => ({
    params: {
      categorySlug,
    },
  }))

  return {
    paths,

    // 404 en las entradas no encontradas
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<CategoryEntryProps> = async ({
  params,
}) => {
  const slug = params?.categorySlug

  if (typeof slug !== 'string') {
    return {
      notFound: true,
    }
  }

  try {
    const { entries, category } = await getPlantListByCategory({
      category: slug,
      limit: 12,
    })

    return {
      props: {
        entries,
        category,
        status: 'success',
      },
      revalidate: 15 * 60, // once every fifteen minutes
    }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export default function CategoryPage({
  entries,
  category,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout>
      <Typography variant="h2" className="text-center mb-12">
        Category: {category.title}
      </Typography>
      <PlantCollection plants={entries} />
      {entries.length > 0 ? null : (
        <Alert severity="info">
          We couldn't find any entry for {category.title}
        </Alert>
      )}
    </Layout>
  )
}
