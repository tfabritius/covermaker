export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
    },
    icons: {
      check: 'iconoir:check',
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
