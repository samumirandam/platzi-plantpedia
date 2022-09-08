import { useCallback } from 'react'
import NextImage, {
  ImageLoaderProps,
  ImageProps as NextImageProps,
} from 'next/image'

type ImageProps = {
  width: number
  height?: never
  layout: ImageLayout
  aspectRatio: AspectRatio
  fit?: ImageFit
} & DistributiveOmit<NextImageProps, 'height'>

export function Image({
  width,
  fit = 'fill',
  aspectRatio,
  ...nextImageProps
}: ImageProps) {
  const heigth = calcAspectRatio(aspectRatio, width)

  const imageLoader = useCallback(
    (loaderArgs: ImageLoaderProps) => {
      const loaderHeigth = calcAspectRatio(aspectRatio, loaderArgs.width)
      return `${loaderArgs.src}?w=${width}&h=${loaderHeigth}&fit=${fit}`
    },
    [aspectRatio, fit]
  )

  return (
    <NextImage
      {...nextImageProps}
      width={width}
      height={heigth}
      loader={imageLoader}
    />
  )
}

export type ImageFit = 'pad' | 'fill' | 'scale' | 'crop' | 'thumb'

export type AspectRatio = '16:9' | '4:3' | '1:1' | '3:2' | '9:12'

export type ImageLayout = 'fill' | 'fixed' | 'intrisic' | 'responsive'

type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never

const aspectRatioToRatio: Record<AspectRatio, number> = {
  '1:1': 1,
  '16:9': 9 / 16,
  '4:3': 3 / 4,
  '3:2': 2 / 3,
  '9:12': 12 / 9,
}

function calcAspectRatio(aspectRatio: AspectRatio, width: number): number {
  const ratio = aspectRatioToRatio[aspectRatio]
  return Math.floor(width * ratio)
}
