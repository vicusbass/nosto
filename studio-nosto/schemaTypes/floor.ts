import { defineField, defineType } from 'sanity'

export const floor = defineType({
  name: 'floor',
  title: 'Floor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Floor Name',
      type: 'string',
      validation: Rule => Rule.required().error('Floor name is required'),
      description: 'e.g., Parter, Etajul 1, Etajul 2'
    }),
    defineField({
      name: 'level',
      title: 'Level Number',
      type: 'number',
      validation: Rule => Rule.required().min(0).error('Level must be 0 or greater'),
      description: 'Floor level starting from 0 (ground floor)'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'level'
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title,
        subtitle: `Level ${subtitle}`
      }
    }
  }
})