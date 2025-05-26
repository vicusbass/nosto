import { defineField, defineType } from 'sanity'

export const unit = defineType({
  name: 'unit',
  title: 'Unit',
  type: 'document',
  fields: [
    defineField({
      name: 'uniqueId',
      title: 'Unique ID',
      type: 'string',
      validation: Rule => Rule.required().error('Unique ID is required'),
      description: 'Unique identifier for the unit'
    }),
    defineField({
      name: 'name',
      title: 'Unit Name',
      type: 'string',
      validation: Rule => Rule.required().error('Unit name is required')
    }),
    defineField({
      name: 'type',
      title: 'Unit Type',
      type: 'string',
      options: {
        list: [
          { title: 'Comercial', value: 'comercial' },
          { title: 'O cameră', value: 'o camera' },
          { title: '2 camere', value: '2 camere' },
          { title: '3 camere', value: '3 camere' },
          { title: '4 camere', value: '4 camere' }
        ]
      },
      validation: Rule => Rule.required().error('Unit type is required')
    }),
    defineField({
      name: 'vandut',
      title: 'Sold Status',
      type: 'boolean',
      initialValue: false,
      description: 'True if unit is sold, false otherwise'
    }),
    defineField({
      name: 'floor',
      title: 'Floor',
      type: 'reference',
      to: [{ type: 'floor' }],
      validation: Rule => Rule.required().error('Floor reference is required'),
      description: 'Reference to the floor this unit is located on'
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Important for SEO and accessibility'
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'size',
      title: 'Size (m²)',
      type: 'number',
      validation: Rule => Rule.required().positive().error('Size must be a positive number'),
      description: 'Unit size in square meters'
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: Rule => Rule.required().positive().error('Price must be a positive number'),
      description: 'Unit price'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'type',
      media: 'images.0',
      price: 'price',
      size: 'size',
      sold: 'vandut'
    },
    prepare(selection) {
      const { title, subtitle, media, price, size, sold } = selection
      const status = sold ? '(SOLD)' : ''
      return {
        title: `${title} ${status}`,
        subtitle: `${subtitle} • ${size}m² • €${price?.toLocaleString()}`,
        media: media
      }
    }
  },
  orderings: [
    {
      title: 'Price, Low to High',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }]
    },
    {
      title: 'Price, High to Low',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }]
    },
    {
      title: 'Size, Small to Large',
      name: 'sizeAsc',
      by: [{ field: 'size', direction: 'asc' }]
    },
    {
      title: 'Available First',
      name: 'availableFirst',
      by: [{ field: 'vandut', direction: 'asc' }]
    }
  ]
})