export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
    },
    icons: {
      close: 'iconoir:xmark',
      loading: 'iconoir:refresh-double',
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
    },
    navigationMenu: {
      slots: {
        link: 'cursor-pointer',
      },
    },
  },
})
