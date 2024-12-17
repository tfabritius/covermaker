export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
    },
    icons: {
      close: 'iconoir:xmark',
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
