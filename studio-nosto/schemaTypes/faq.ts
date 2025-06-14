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
      type: 'text',
      description: 'The answer to the question',
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
})
