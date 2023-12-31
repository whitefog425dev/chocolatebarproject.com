// TODO: research generateStaticParams

import { Container } from '#/components/Container'
import { ItemBlock } from '#/components/ItemBlock'
import { ItemBlockSupportingImages } from '#/components/ItemBlockSupportingImages'
import { Metadata } from '#/components/Metadata'
import {
  AwardsMetadataItem,
  DimensionsMetadataItem,
  IngredientMetadataItem,
  MetadataItem,
  transformDimensions,
  transformPercent,
  transformWeight,
} from '#/components/MetadataItem'
import { fetchBarBySlug } from '#/lib/getBars'
import { fetchMakerByName } from '#/lib/getMakers'
import { fetchOriginByProducer } from '#/lib/getOrigins'
import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Balancer from 'react-wrap-balancer'
import { Product, WithContext } from 'schema-dts'

export default async function BarSlugPage({ params }: { params?: any }) {
  const bar = await fetchBarBySlug(params.slug)
  const maker = await fetchMakerByName(bar?.maker)
  const origin =
    typeof bar?.origin === 'string'
      ? await fetchOriginByProducer(bar?.origin)
      : undefined

  if (!bar) {
    return notFound()
  }

  const isUnreleased =
    new Date(bar.releaseDate + 'T00:00:01-0800') >= new Date()

  const jsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: bar.description,
    name: `${bar.name} ${bar.subtitle || ''}`,
    image: [
      {
        '@type': 'ImageObject',
        url: bar.images.HERO.src,
        caption: bar.images.HERO.alt,
        description: bar.images.HERO.alt,
      },
      {
        '@type': 'ImageObject',
        url: bar.images.PACKAGE_FRONT.src,
        caption: bar.images.PACKAGE_FRONT.alt,
        description: bar.images.PACKAGE_FRONT.alt,
      },
      {
        '@type': 'ImageObject',
        url: bar.images.PACKAGE_BACK.src,
        caption: bar.images.PACKAGE_BACK.alt,
        description: bar.images.PACKAGE_BACK.alt,
      },
      {
        '@type': 'ImageObject',
        url: bar.images.BAR_FRONT.src,
        caption: bar.images.BAR_FRONT.alt,
        description: bar.images.BAR_FRONT.alt,
      },
      {
        '@type': 'ImageObject',
        url: bar.images.BAR_BACK.src,
        caption: bar.images.BAR_BACK.alt,
        description: bar.images.BAR_BACK.alt,
      },
    ],
    keywords: [
      `${bar.barType} Chocolate`,
      `${
        typeof bar.origin === 'string' ? bar.origin : bar.origin.country
      } Origin`,
      ...(bar.marketingTerms || []),
    ].join(', '),

    brand: {
      '@type': 'Brand',
      name: bar.maker,
    },
    manufacturer: {
      '@type': 'Organization',
      name: bar.maker,
    },

    countryOfOrigin: {
      '@type': 'Country',
      name: bar.productionCountry,
    },

    height: {
      '@type': 'QuantitativeValue',
      value: bar.packagingDimensions[0],
      unitCode: 'MMT',
    },
    width: {
      '@type': 'QuantitativeValue',
      value: bar.packagingDimensions[1],
      unitCode: 'MMT',
    },
    depth: {
      '@type': 'QuantitativeValue',
      value: bar.packagingDimensions[2],
      unitCode: 'MMT',
    },
    weight: {
      '@type': 'QuantitativeValue',
      value: bar.barWeight,
      unitCode: 'GRM',
    },

    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: bar.retailPrice,
      priceCurrency: 'USD',
    },

    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Chocolate Type',
        value: bar.barType,
      },
      {
        '@type': 'PropertyValue',
        name: 'Origin',
        value: typeof bar.origin === 'string' ? bar.origin : bar.origin.country,
      },
    ],
  }

  return (
    <section className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-primary-100/25">
        <Container className="relative h-[300px] sm:h-[80vh]">
          <Image
            priority
            src={bar.images.HERO.src}
            alt={bar.images.HERO.alt}
            fill
            className="object-cover object-center"
          />
        </Container>
      </div>

      <Container as="article">
        <div className="flex flex-col gap-2 py-4 sm:flex-row sm:gap-10">
          <section className="flex-2">
            <h1 className="mb-2 font-heading text-4xl font-bold text-primary-800">
              <Balancer>
                {bar.name}{' '}
                {bar.subtitle ? (
                  <span className="font-normal text-primary-900/75">
                    {bar.subtitle}
                  </span>
                ) : null}
              </Balancer>
            </h1>

            <p className="mb-2 text-primary-900/50">
              <Balancer>
                by {bar.maker} in {bar.productionCountry}
              </Balancer>
            </p>
          </section>

          <div className="flex-3">
            {isUnreleased ? (
              <div className="mb-2 inline-flex items-center gap-1 bg-primary-700 p-0.5 text-primary-100">
                <ExclamationTriangleIcon className="h-2.5 w-2.5" />
                <span>
                  This bar hasn{`'`}t been published yet, information may
                  change.
                </span>
              </div>
            ) : null}

            {bar.description ? (
              Array.isArray(bar.description) ? (
                bar.description.map((description, index) => (
                  <p key={index} className="mb-2 text-primary-900/50">
                    {description}
                  </p>
                ))
              ) : (
                <p className="mb-2 text-primary-900/50">{bar.description}</p>
              )
            ) : null}

            {bar.productUrl ? (
              <a
                rel="noreferrer"
                target="_blank"
                href={bar.productUrl}
                className="flex items-center gap-1 text-primary-900/50 hover:text-primary-900"
              >
                <ArrowRightIcon className="h-2.5 w-2.5" />
                <span>
                  {new URL(bar.productUrl).hostname.replace('www.', '')}
                </span>
              </a>
            ) : null}
          </div>
        </div>

        <ItemBlock
          title="Bar"
          renderSupporting={() => (
            <ItemBlockSupportingImages
              images={[bar.images.BAR_FRONT, bar.images.BAR_BACK]}
            />
          )}
        >
          {bar.seo?.about ? (
            <p className="mb-2 text-primary-900/50">{bar.seo?.about}</p>
          ) : null}
          <Metadata>
            <MetadataItem label="Type" value={bar.barType} />
            <MetadataItem
              label="Percent"
              value={bar.percent}
              transformValue={transformPercent}
            />
            <MetadataItem
              label="Weight"
              value={bar.barWeight}
              transformValue={transformWeight}
            />
            <DimensionsMetadataItem
              label="Dimensions"
              value={bar.barDimensions}
              transformValue={transformDimensions}
            />
            <IngredientMetadataItem
              label="Ingredients"
              value={bar.ingredients}
            />
            <MetadataItem label="Food Allergen" value={bar.foodAllergen} />
            <MetadataItem
              label="Facility Allergen"
              value={bar.facilityAllergen}
            />
          </Metadata>
        </ItemBlock>

        <ItemBlock
          title="Packaging"
          renderSupporting={() => (
            <ItemBlockSupportingImages
              images={[bar.images.PACKAGE_FRONT, bar.images.PACKAGE_BACK]}
            />
          )}
        >
          <Metadata>
            <MetadataItem label="Type" value={bar.packagingType} />
            <DimensionsMetadataItem
              label="Dimensions"
              value={bar.packagingDimensions}
              transformValue={transformDimensions}
            />
            <MetadataItem label="Wrapper" value={bar.wrapper} />
            <MetadataItem
              label="Certified Labels"
              value={bar.certifiedLabels}
            />
            <MetadataItem
              label="Uncertified Labels"
              value={bar.uncertifiedLabels}
            />
            <MetadataItem label="Marketing Terms" value={bar.marketingTerms} />
            <MetadataItem label="Tasting Notes" value={bar.tastingNotes} />

            <AwardsMetadataItem label="Awards" value={bar.awards} />
          </Metadata>
        </ItemBlock>

        {maker ? (
          <ItemBlock title="Maker">
            {bar.seo?.maker ? (
              <p className="mb-2 text-primary-900/50">{bar.seo?.maker}</p>
            ) : null}
            <Metadata>
              <MetadataItem label="Name" value={maker.name} />
              <MetadataItem
                label="Production Country"
                value={bar.productionCountry}
              />
            </Metadata>
          </ItemBlock>
        ) : null}

        {origin ? (
          <ItemBlock title="Origin">
            {bar.seo?.origin ? (
              <p className="mb-2 text-primary-900/50">{bar.seo?.origin}</p>
            ) : null}
            <Metadata>
              <MetadataItem label="Producer" value={origin.producer} />
              <MetadataItem label="Locality" value={origin.locality} />
              <MetadataItem label="Region" value={origin.region} />
              <MetadataItem label="Country" value={origin.country} />
            </Metadata>
          </ItemBlock>
        ) : typeof bar.origin !== 'string' ? (
          <ItemBlock title="Origin">
            {bar.seo?.origin ? (
              <p className="mb-2 text-primary-900/50">{bar.seo?.origin}</p>
            ) : null}
            <Metadata>
              <MetadataItem label="Producer" value={bar.origin.producer} />
              <MetadataItem label="Locality" value={bar.origin.locality} />
              <MetadataItem label="Region" value={bar.origin.region} />
              <MetadataItem label="Country" value={bar.origin.country} />
            </Metadata>
          </ItemBlock>
        ) : null}

        {bar.seo?.taste ? (
          <ItemBlock title="How to Enjoy the Bar">
            <p className="mb-2 text-primary-900/50">{bar.seo?.taste}</p>
          </ItemBlock>
        ) : null}
      </Container>
    </section>
  )
}
