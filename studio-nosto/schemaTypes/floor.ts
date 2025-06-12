import {defineField, defineType} from 'sanity'

export const floor = defineType({
  name: 'floor',
  title: 'Floor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nume Etaj',
      type: 'string',
      validation: (Rule) => Rule.required().error('Nume etaj obligatoriu'),
      description: 'e.g., Parter, Etajul 1, Etajul 2',
    }),
    defineField({
      name: 'level',
      title: 'Nivel',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).error('Nivelul incepe de la 0 (Parter)'),
      description: 'Nivelul etajului incepand de la 0 (Parter)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'level',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title: title,
        subtitle: `Nivel ${subtitle}`,
      }
    },
  },
})
