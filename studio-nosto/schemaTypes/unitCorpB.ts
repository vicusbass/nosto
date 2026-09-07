import {defineUnitType} from './unitBase'

/** Corp B apartments. Same shape as `unit`; price may be 0 while units are not yet on sale. */
export const unitCorpB = defineUnitType({
  name: 'unitCorpB',
  title: 'Unitate Corp B',
  allowZeroPrice: true,
})
