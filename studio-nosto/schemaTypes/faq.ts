import {defineField, defineType} from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Display order priority (lower numbers appear first)',
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The question text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'details',
      title: 'Details',
      type: 'array',
      description: 'The answer to the question',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'priority',
    },
    prepare({title, subtitle}) {
      return {
        title,
        subtitle: `Priority: ${subtitle}`,
      }
    },
  },
  orderings: [
    {
      title: 'Sortare dupa prioritate',
      name: 'priorityAsc',
      by: [{field: 'priority', direction: 'asc'}],
    },
  ],
})
