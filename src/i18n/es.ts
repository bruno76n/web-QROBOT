/** Every visible text of the site, in Spanish (docs/05). Product texts live in the database. */
export const es = {
  site: {
    name: 'Quick Robot',
    tagline: 'Impresión 3D · Guadalajara',
    title: 'Quick Robot | Impresión 3D en Guadalajara',
    description:
      'Impresión 3D en Guadalajara. Piezas con el logo de tu negocio, figuras de los que quieres y regalos que no hay en ninguna tienda.',
  },
  a11y: {
    skipToContent: 'Ir al contenido',
    goHome: 'Quick Robot, ir al inicio',
    mainNav: 'Principal',
  },
  header: {
    nav: [
      { label: 'Navidad', href: '/#navidad' },
      { label: 'Ideas', href: '/#ideas' },
      { label: 'Catálogo', href: '/catalogo' },
      { label: 'Q-404', href: '/#q404' },
    ],
    quote: 'Cotizar',
    quoteHref: '/#pedido',
  },
  footer: {
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    instagram: 'Instagram',
    legal: (year: number) => `© ${year} Quick Robot · Impresión 3D en Guadalajara`,
  },
  underConstruction: {
    title: 'En construcción',
    text: 'Q-404 está armando la página. Vuelve pronto.',
    imageAlt: 'Q-404, el robot de Quick Robot, de pie',
  },
} as const;
