import {defineField, defineType} from 'sanity'

export const unit = defineType({
  name: 'unit',
  title: 'Unitate',
  type: 'document',
  fields: [
    defineField({
      name: 'uniqueId',
      title: 'ID unic unitate',
      type: 'string',
      validation: (Rule) => Rule.required().error('ID unic unitate obligatoriu'),
      description: 'ID unic unitate',
    }),
    defineField({
      name: 'name',
      title: 'Nume unitate',
      type: 'string',
      validation: (Rule) => Rule.required().error('Nume unitate obligatoriu'),
      description: 'Nume afisat pe plan',
    }),
    defineField({
      name: 'type',
      title: 'Tip unitate',
      type: 'string',
      options: {
        list: [
          {title: 'Comercial', value: 'C'},
          {title: 'Studio', value: '1'},
          {title: '1.5 camere', value: '1.5'},
          {title: '2 camere', value: '2'},
          {title: '2.5 camere', value: '2.5'},
          {title: '3 camere', value: '3'},
          {title: '4 camere', value: '4'},
        ],
      },
      validation: (Rule) => Rule.required().error('Tip unitate obligatoriu'),
    }),
    defineField({
      name: 'sold',
      title: 'Vandut',
      type: 'boolean',
      initialValue: false,
      description: 'Bifat daca e vandut, nebifat daca e disponibil',
    }),
    defineField({
      name: 'floor',
      title: 'Etaj',
      type: 'reference',
      to: [{type: 'floor'}],
      validation: (Rule) => Rule.required().error('Etaj obligatoriu'),
      description: 'Etajul pe care se afla unitatea',
    }),
    defineField({
      name: 'images',
      title: 'Imagini',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Descriere imagine',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Titlu afisat imagine',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'size',
      title: 'Dimensiune (m²)',
      type: 'number',
      validation: (Rule) => Rule.required().positive().error('Dimensiune obligatorie'),
      description: 'Dimensiune unitate in metri patrati',
    }),
    defineField({
      name: 'price',
      title: 'Preț',
      type: 'number',
      validation: (Rule) => Rule.required().positive().error('Preț obligatoriu'),
      description: 'Preț unitate',
    }),
    defineField({
      name: 'rooms',
      title: 'Camere',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Camera',
          fields: [
            {
              name: 'name',
              title: 'Nume camera',
              type: 'string',
              validation: (Rule) => Rule.required().error('Numele camerei este obligatoriu'),
              description: 'Ex: Living, Dormitor, Bucătărie, Baie, etc.',
            },
            {
              name: 'surface',
              title: 'Suprafață (m²)',
              type: 'number',
              validation: (Rule) => Rule.required().positive().error('Suprafața este obligatorie'),
              description: 'Suprafața camerei în metri pătrați',
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'surface',
            },
            prepare(selection) {
              const {title, subtitle} = selection
              return {
                title: title,
                subtitle: `${subtitle} m²`,
              }
            },
          },
        },
      ],
      description: 'Lista camerelor cu suprafețele lor',
    }),
    defineField({
      name: 'plan',
      title: 'Plan PDF',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      description: 'Încarcă planul PDF pentru această unitate',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'type',
      media: 'images.0',
      price: 'price',
      size: 'size',
      sold: 'sold',
    },
    prepare(selection) {
      const {title, subtitle, media, price, size, sold} = selection
      const status = sold ? '(SOLD)' : ''
      return {
        title: `${title} ${status}`,
        subtitle: `${subtitle} • ${size}m² • €${price?.toLocaleString()}`,
        media: media,
      }
    },
  },
  orderings: [
    {
      title: 'ID unic, crescător',
      name: 'uniqueIdAsc',
      by: [{field: 'uniqueId', direction: 'asc'}],
    },
    {
      title: 'Preț, crescător',
      name: 'priceAsc',
      by: [{field: 'price', direction: 'asc'}],
    },
    {
      title: 'Preț, descrescător',
      name: 'priceDesc',
      by: [{field: 'price', direction: 'desc'}],
    },
    {
      title: 'Dimensiune, crescătoare',
      name: 'sizeAsc',
      by: [{field: 'size', direction: 'asc'}],
    },
    {
      title: 'Disponibilitate',
      name: 'availableFirst',
      by: [{field: 'sold', direction: 'asc'}],
    },
  ],
})
