/** Every visible text of the site, in Spanish (docs/05). Product texts live in the database. */
export const es = {
  site: {
    name: 'Quick Robot',
    title: 'Quick Robot | Impresión 3D',
    description:
      'Impresión 3D. Piezas con el logo de tu negocio, figuras de los que quieres y regalos que no hay en ninguna tienda.',
  },
  a11y: {
    skipToContent: 'Ir al contenido',
    goHome: 'Quick Robot, ir al inicio',
    mainNav: 'Principal',
  },
  header: {
    nav: [
      { label: 'Catálogo', href: '/catalogo' },
      { label: 'Aprende', href: '/aprende' },
    ],
    quote: 'Cotizar',
    /** Over the hero the header shows this instead of the logo (docs/03 §5). */
    social: { lead: 'Visita nuestras redes:', button: 'Instagram' },
    quoteHref: '/#pedido',
    /** Menu link of the page for workshops, only while it is visible (docs/25 §2, §6.1). */
    system: { label: 'Para talleres', short: 'Talleres', href: '/talleres' },
  },
  footer: {
    navLabel: 'Secciones',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    instagram: 'Instagram',
    privacy: 'Aviso de privacidad',
    legal: (year: number) => `© ${year} Quick Robot · Impresión 3D`,
  },
  /** Aviso de privacidad (docs/19 §2): plain words, no personal data is asked on the site. */
  privacy: {
    title: 'Aviso de privacidad',
    metaDescription:
      'Qué datos usa Quick Robot: ninguno personal en la web. Lo que compartas por WhatsApp se usa solo para tu pedido.',
    lead: 'Esta web no te pide nombre, teléfono ni correo. Aquí te explicamos qué pasa con lo poco que sí se usa.',
    updated: (date: string) => `Última actualización: ${date}`,
    sections: [
      {
        id: 'responsable',
        title: 'Quién es responsable',
        body: (o: { name: string; address: string; email: string }) => [
          `${o.name}, con el nombre comercial Quick Robot, es responsable de tus datos. Domicilio: ${o.address}. Contacto: ${o.email}.`,
        ],
      },
      {
        id: 'datos',
        title: 'Qué datos se obtienen en la web',
        body: () => [
          'Ningún dato personal. El mensaje de tu pedido se arma en tu navegador y se va directo a WhatsApp: la web nunca lo recibe.',
          'Solo se miden estadísticas anónimas de visitas (qué páginas se abren y desde qué tipo de dispositivo), sin cookies y sin guardar tu IP. También se suma cuántas veces se toca cada botón de WhatsApp, como un contador por día, sin nada que te identifique.',
          'En Aprende, si una búsqueda no encuentra nada, se guarda el texto que escribiste y el día, sin tu IP ni nada que te identifique. Sirve para saber qué respuestas faltan.',
        ],
      },
      {
        id: 'whatsapp',
        title: 'Cuando escribes por WhatsApp',
        body: () => [
          'Al tocar “Pedir por WhatsApp” sales de esta web y la conversación se rige por las reglas de WhatsApp. Los datos que compartas en el chat (nombre, teléfono, fotos, logo) se usan solo para cotizar y hacer tu pedido.',
        ],
      },
      {
        id: 'fotos',
        title: 'Fotos y logos que nos mandas',
        body: () => ['Las usamos solo para tu pedido y no las publicamos sin tu permiso.'],
      },
      {
        id: 'arco',
        title: 'Tus derechos',
        body: (o: { name: string; address: string; email: string }) => [
          `Puedes pedir acceso, rectificación, cancelación u oposición sobre tus datos (derechos ARCO) escribiendo a ${o.email}.`,
        ],
      },
      {
        id: 'cambios',
        title: 'Cambios a este aviso',
        body: () => [
          'Si algo cambia, lo publicamos en esta misma página y cambiamos la fecha de arriba.',
        ],
      },
    ],
  },
  /** Panel (docs/12 §7). */
  admin: {
    pageTitle: 'Panel de Quick Robot',
    brand: 'Quick Robot',
    tabs: {
      products: 'Productos',
      categories: 'Categorías',
      hero: 'Portada',
      learn: 'Aprende',
      label: 'Sección',
    },
    viewCatalog: 'Ver catálogo ↗',
    moreOptions: 'Más opciones',
    backup: { label: 'Descargar respaldo', note: 'Todos los productos en un archivo .json' },
    unsaved: 'Sin guardar',
    leave: {
      title: 'Tienes cambios sin guardar. ¿Salir sin guardar?',
      yes: 'Salir',
      no: 'Seguir editando',
    },
    list: {
      aria: 'Productos',
      listAria: 'Lista de productos',
      search: 'Buscar',
      searchPlaceholder: 'Buscar producto',
      new: '+ Nuevo',
      filterAria: 'Mostrar',
      all: 'Todos',
      published: 'Publicados',
      hidden: 'Ocultos',
      clicksTotal: 'Últimos 30 días: {n} {taps} a WhatsApp',
      clicksOne: 'toque',
      clicksMany: 'toques',
      clicksBySource: {
        product: 'Productos',
        order: 'Pedido',
        q404: 'Q-404',
        customizer: 'Nombre en 3D',
      },
      clicksRow: '{n} en 30 días',
      dragHint: 'Arrastra ⋮⋮ para cambiar el orden en el catálogo.',
      dragOff: 'Para ordenar, quita la búsqueda y el filtro.',
      grip: 'Arrastrar para cambiar el orden',
      noPrice: 'Sin precio',
      statusPublished: 'Publicado',
      statusHidden: 'Oculto',
      none: 'Ningún producto coincide.',
      emptyCatalog: 'Todavía no hay productos.',
      loading: 'Cargando…',
    },
    empty: { title: 'Elige un producto', text: 'o crea uno nuevo con “+ Nuevo”.' },
    editor: {
      newTitle: 'Producto nuevo',
      back: 'Volver a la lista',
      photos: 'Fotos',
      photosHint: 'La primera es la portada. Arrástralas para cambiar el orden.',
      dropTitle: 'Arrastra fotos aquí',
      dropOr: 'o haz clic para elegirlas',
      dropFormats: 'JPG, PNG, WEBP o fotos del iPhone · hasta 10 fotos',
      basics: 'Lo básico',
      basicsHint: 'Lo que se ve en la tarjeta del catálogo.',
      name: 'Nombre',
      namePlaceholder: 'Ej. Llaveros con nombre',
      short: 'Frase corta',
      shortPlaceholder: 'Ej. Con tu nombre, el de tus hijos o el logo de tu negocio.',
      price: 'Precio desde (por pieza)',
      pricePlaceholder: '50',
      priceNote: 'Nota del precio',
      priceNotePlaceholder: 'Baja si pides varias.',
      categories: 'Dónde aparece',
      noCategories: 'Primero crea una categoría en la pestaña Categorías.',
      pageSection: 'Página del producto',
      pageHint: 'Lo que ve la gente al abrirlo.',
      description: 'Descripción',
      descriptionPlaceholder:
        'Cuenta qué es, para qué sirve y cómo se pide. Deja una línea en blanco para separar párrafos.',
      size: 'Tamaño',
      sizePlaceholder: 'Ej. 5 cm de diámetro',
      material: 'Material',
      leadTime: 'Tiempo de entrega',
      leadTimePlaceholder: 'Ej. 2 a 4 días',
      customSize: 'Tamaño a medida (a cotizar)',
      customSizePlaceholder: 'Ej. Lo hacemos del tamaño que necesites',
      customSizeHint:
        'Si lo llenas, la página lo muestra junto al tamaño. Déjalo vacío si solo hay uno.',
      colors: 'Colores que ofreces',
      colorsHint: 'Si no eliges ninguno, la página no muestra selector de color.',
      unitOne: 'Cómo se dice uno',
      unitMany: 'Cómo se dicen varios',
      unitHint: 'Para el mensaje de WhatsApp: “Hola, me interesa: 10 llaveros en morado”.',
      personalizable: 'Se personaliza',
      personalizableHint: 'Muestra un campo para que escriban el nombre, el logo o lo que pida.',
      personalHint: '¿Qué le preguntas al cliente?',
      personalHintPlaceholder: 'Ej. Nombre (hasta 10 letras)',
      featured: 'Más pedido',
      featuredHint:
        'Le pone la etiqueta “Más pedido” en el catálogo y lo puede mostrar en Navidad.',
      published: 'Publicado',
      publishedHint: 'Si está apagado, nadie lo ve en el catálogo.',
      cannotPublish: (list: string) => `Para publicarlo falta: ${list}`,
      missing: {
        photo: 'una foto',
        category: 'una categoría',
        price: 'el precio desde',
        name: 'el nombre',
      },
    },
    actions: {
      save: 'Guardar',
      saving: 'Guardando…',
      saved: 'Guardado',
      viewPage: 'Ver página ↗',
      duplicate: 'Duplicar',
      delete: 'Eliminar',
      deleteTitle: '¿Eliminar este producto?',
      deleteText: 'También se borran sus fotos. No se puede deshacer.',
      deleteYes: 'Sí, eliminar',
      deleteNo: 'No',
      deleted: 'Producto eliminado',
      duplicated: 'Copia creada',
      waitUploads: 'Espera a que terminen de subir las fotos.',
      reordered: 'Orden guardado',
    },
    photo: {
      cover: 'Portada',
      center: 'Centrar',
      alt: 'Texto alternativo',
      remove: 'Quitar',
      retry: 'Reintentar',
      failed: 'No se subió',
      small: 'La foto es chica; puede verse borrosa en pantallas grandes.',
      smallBadge: 'Foto chica',
      preparing: 'Preparando…',
      done: 'Listo',
      cancel: 'Cancelar',
      cropHelp: 'Mueve la foto y acércala hasta que quede como quieres.',
      cropHelpProduct:
        'Mueve la foto y acércala o aléjala hasta que se vea el producto completo, como quieres.',
      zoom: 'Acercar',
      cropTitle: 'Centrar la foto',
      previewCard: 'Así se ve en el catálogo',
      previewHero: 'Así se ve en el inicio',
      previewHeroMobile: 'Así se ve en el celular',
      cardName: 'Nombre del producto',
      cardPrice: 'Desde $50',
      tooMany: 'Caben hasta 10 fotos por producto.',
      unsupported: 'Esa foto no se puede usar. Sube JPG, PNG, WEBP o una foto del iPhone.',
      tooLarge: 'La foto pesa demasiado (máximo 25 MB).',
    },
    hero: {
      title: 'Portada del inicio',
      lead: 'Las fotos grandes de arriba de la página. Si subes varias, se van turnando solas.',
      preview: 'Así se ve',
      previewHint:
        'El nombre gigante va abajo, encima de la foto: deja esa parte de la foto libre (la franja rayada).',
      previewAlt: 'Vista previa de la portada',
      photos: 'Fotos',
      photosHint:
        'Para computadora: horizontal, 2400 × 1350 px. Para celular (opcional): vertical, 1200 × 1600 px. Si no subes la de celular, se usa la horizontal recortada.',
      dropTitle: 'Arrastra fotos aquí',
      dropOr: 'o haz clic para elegirlas',
      dropHint: 'Cada foto que subas es una portada nueva · hasta 6',
      slideDesktop: 'Computadora',
      slideMobile: 'Celular',
      noMobile: 'Sin foto de celular: se usa la de computadora',
      addMobile: 'Subir la de celular',
      change: 'Cambiar',
      center: 'Centrar',
      remove: 'Quitar',
      interval: 'Cambio entre fotos',
      every: 'Cambiar cada',
      seconds: (n: number) => `${n} segundos`,
      intervalHint: 'Solo aplica si hay más de una foto.',
      save: 'Guardar portada',
      viewHome: 'Ver inicio ↗',
      reset: 'Volver a la foto original',
      resetTitle: '¿Volver a la foto original?',
      resetText: 'Se borran todas las portadas que subiste y el inicio usa la foto por defecto.',
      resetYes: 'Sí, volver',
      resetDone: 'La portada volvió a la foto original',
      count: (n: number) =>
        n === 0 ? 'Usa la foto por defecto' : n === 1 ? '1 portada' : `${n} portadas`,
      tag: (i: number, n: number) => `Portada ${i} de ${n}`,
      tooMany: 'Caben hasta 6 portadas.',
      saved: 'Portada guardada',
    },
    errors: {
      UNAUTHORIZED: 'Tu sesión terminó. Vuelve a entrar.',
      VALIDATION: 'Revisa los campos marcados.',
      NOT_FOUND: 'Eso ya no existe.',
      SLUG_TAKEN: 'Esa dirección ya la usa otro producto.',
      CANNOT_PUBLISH: (list: string) => `Para publicarlo falta: ${list}.`,
      TOO_MANY_PHOTOS: 'Caben hasta 10 fotos por producto.',
      TOO_MANY_SLIDES: 'Caben hasta 6 portadas.',
      UNKNOWN_CATEGORY: 'Una categoría ya no existe. Recarga la página.',
      CATEGORY_PROTECTED: 'Navidad no se puede borrar: la usa la temporada.',
      CATEGORY_IN_USE: (names: string) =>
        `No se puede borrar: estos productos publicados se quedarían sin categoría: ${names}.`,
      TOO_MANY_CATEGORIES: 'Caben hasta 30 categorías.',
      UNKNOWN_RELATED: (slugs: string) =>
        `Estas páginas relacionadas ya no existen: ${slugs}. Quítalas de la lista.`,
      UNKNOWN_BLOCK: (marks: string) =>
        `El cuerpo usa un bloque que no existe: ${marks}. Revisa lo que escribiste entre [[ ]].`,
      SEARCH_UNAVAILABLE: 'El buscador no respondió. Intenta de nuevo en un rato.',
      SEARCH_NOT_UPDATED:
        'Se guardó, pero el buscador no se actualizó. Toca «Actualizar buscador» en un rato.',
      PHOTO_NOT_FOUND: 'Una foto no se encontró. Vuelve a subirla.',
      FILE_TYPE: 'Esa foto no se puede usar. Sube JPG, PNG, WEBP o una foto del iPhone.',
      FILE_TOO_LARGE: 'La foto pesa demasiado (máximo 25 MB).',
      INTERNAL: (errorId: string) => `Algo salió mal. Intenta de nuevo. (Código: ${errorId})`,
      OFFLINE: 'No hay conexión. Tus cambios siguen aquí; intenta guardar de nuevo.',
      reload: 'Volver a entrar',
    },
    categories: {
      title: 'Categorías',
      lead: 'Son los grupos del catálogo. Arrástralas para cambiar el orden; la primera de cada producto es la principal.',
      newLabel: 'Nueva categoría',
      newPlaceholder: 'Por ejemplo: Para la oficina',
      add: 'Agregar',
      rename: 'Renombrar',
      save: 'Guardar',
      cancel: 'Cancelar',
      remove: 'Borrar',
      grip: 'Arrastrar para cambiar el orden',
      loading: 'Cargando categorías',
      empty: 'Todavía no hay categorías.',
      protectedNote: 'La usa la temporada de Navidad',
      removeTitle: (label: string) => `¿Borrar “${label}”?`,
      removeText: 'Los productos dejan de aparecer ahí. Los productos no se borran.',
      removeYes: 'Borrar',
      removeNo: 'Mejor no',
      created: 'Categoría creada.',
      renamed: 'Nombre cambiado.',
      removed: 'Categoría borrada.',
      reordered: 'Orden guardado.',
    },
    required: 'Este dato es obligatorio.',
    tooLong: (max: number) => `Máximo ${max} caracteres.`,
    badPrice: 'Escribe un precio, por ejemplo 50 o 1,250.',
    badSlug: 'Solo minúsculas, números y guiones.',
    /** Tab «Aprende» of the panel (docs/12 §5c, docs/22 §10). */
    learn: {
      // ── List and editor of the pages (docs/12 §5c) ──
      editor: {
        pageTitle: 'Aprende · Panel de Quick Robot',
        list: {
          aria: 'Páginas de Aprende',
          listAria: 'Lista de páginas',
          search: 'Buscar',
          searchPlaceholder: 'Buscar página',
          topic: 'Tema',
          allTopics: 'Todos los temas',
          filterAria: 'Mostrar',
          all: 'Todas',
          published: 'Publicadas',
          hidden: 'Ocultas',
          edited: 'Editadas aquí',
          editedBadge: 'Editada aquí',
          switchLabel: (title: string) => `Publicada: ${title}`,
          none: 'Ninguna página coincide.',
          emptyAll: 'Todavía no hay páginas de Aprende.',
          loading: 'Cargando…',
          foot: 'Las páginas nuevas se agregan con los archivos de Aprende; aquí cambias su texto.',
        },
        /** Topic shown for the home page of Aprende, which has none. */
        homeTopic: 'Aprende',
        kinds: {
          home: 'Portada',
          section: 'Tema',
          sheet: 'Ficha',
          article: 'Artículo',
          problem: 'Problema',
          glossary: 'Glosario',
        },
        empty: {
          title: 'Elige una página',
          text: 'para cambiar su texto, sus preguntas y sus ligas.',
        },
        back: 'Volver a la lista',
        address: 'Dirección',
        topicLabel: 'Tema',
        kindLabel: 'Tipo',
        fixedHint: 'La dirección, el tema y el tipo se cambian en los archivos de Aprende.',
        basics: 'Lo básico',
        basicsHint: 'Lo que se ve arriba de la página y en los resultados del buscador.',
        title: 'Título',
        subtitle: 'Subtítulo',
        summary: 'En corto',
        summaryHint: 'La respuesta en dos o tres líneas, en el recuadro de arriba.',
        body: 'Cuerpo',
        bodyHint:
          'Markdown: ## para títulos, **negritas**, listas con guion y tablas. Un bloque va solo en su línea, entre [[ ]].',
        bodyModes: 'Ver',
        write: 'Texto',
        preview: 'Vista previa',
        previewEmpty: 'El cuerpo está vacío.',
        markBox: (name: string) => `Aquí va el bloque [[${name}]]`,
        markUnknown: (name: string) => `Este bloque no existe: [[${name}]]`,
        faqs: 'Preguntas',
        faqsHint: 'Salen al final de la página. Arrástralas para cambiar el orden.',
        faqQ: (n: number) => `Pregunta ${n}`,
        faqA: (n: number) => `Respuesta ${n}`,
        faqAdd: '+ Agregar pregunta',
        faqRemove: (n: number) => `Quitar la pregunta ${n}`,
        faqGrip: (n: number) => `Arrastrar la pregunta ${n} para cambiar el orden`,
        faqNone: 'Esta página no tiene preguntas.',
        links: 'Etiquetas, relacionadas y fuentes',
        tags: 'Etiquetas',
        tagsHint: 'Palabras con las que también se encuentra. Escribe una y presiona Enter.',
        tagAdd: 'Nueva etiqueta',
        tagRemove: (tag: string) => `Quitar la etiqueta ${tag}`,
        related: 'Relacionadas',
        relatedHint: 'Salen en «También te puede servir».',
        relatedAdd: 'Agregar una página…',
        relatedMissing: 'ya no existe',
        sources: 'Fuentes',
        sourcesHint: 'De dónde sale lo que dice la página.',
        sourceAdd: 'Agregar una fuente…',
        remove: (name: string) => `Quitar ${name}`,
        noneChosen: 'Ninguna.',
        cta: 'Llamado al final',
        ctaHint: 'El botón con el que cierra la página.',
        ctaKind: 'Botón',
        ctaKinds: {
          whatsapp: 'Cotizar por WhatsApp',
          system: 'Página para talleres',
          none: 'Sin botón',
        },
        ctaText: 'Texto del llamado',
        ctaTextHint: 'Si lo dejas vacío, se usa el texto de siempre.',
        published: 'Publicada',
        publishedHint:
          'Se aplica al momento: muestra u oculta la página en Aprende y en el buscador.',
        nowPublished: 'Página publicada',
        nowHidden: 'Página oculta',
        tooMany: (max: number) => `Caben hasta ${max}.`,
        save: 'Guardar',
        saving: 'Guardando…',
        saved: 'Guardado',
        viewPage: 'Ver página ↗',
      },

      // ── Search block and searches without a result (docs/22 §10) ──
      search: {
        title: 'Buscador',
        loading: 'Cargando el buscador',
        database:
          'El buscador usa la base de datos. Configura Meilisearch para que tolere errores de dedo.',
        never: 'Todavía no se ha actualizado. Toca «Actualizar buscador» para cargar las páginas.',
        synced: (date: string, docs: number) =>
          `Última actualización: ${date} · ${docs === 1 ? '1 documento' : `${docs} documentos`}.`,
        syncHint: 'Vuelve a cargar todas las páginas publicadas. Tarda unos segundos.',
        sync: 'Actualizar buscador',
        syncing: 'Actualizando…',
        syncedOk: (docs: number) =>
          `Buscador actualizado: ${docs === 1 ? '1 documento' : `${docs} documentos`}.`,
        skipped: 'No hacía falta: el buscador ya lee la base de datos.',
        missesTitle: 'Búsquedas sin resultado (30 días)',
        missesLead:
          'Lo que la gente buscó en Aprende y no encontró, de lo más buscado a lo menos. Te sirve para decidir qué respuesta escribir.',
        missesLoading: 'Cargando las búsquedas',
        missesEmpty:
          'Nadie se quedó sin respuesta en los últimos 30 días. Cuando alguien busque algo que no está, aparece aquí.',
        times: (n: number) => (n === 1 ? '1 vez' : `${n} veces`),
      },
    },
  },
  catalog: {
    titleLines: ['Elige uno.', 'O cincuenta.'],
    lead: 'Abre cualquiera para ver fotos, colores y detalles, y pídelo por WhatsApp.',
    volumeTitle: 'Mientras más pidas, menos pagas por pieza.',
    volumeText:
      'Los precios son por pieza. Si pides varias, te mandamos el mejor precio por WhatsApp.',
    tabsLabel: 'Categorías',
    all: 'Todos',
    count: (n: number) => (n === 1 ? '1 producto' : `${n} productos`),
    gridLabel: 'Productos',
    hot: 'Más pedido',
    from: 'Desde',
    noPrice: 'Precio por cotizar',
    emptyTitle: 'Todavía no hay nada aquí.',
    emptyLink: 'Ver todo el catálogo',
    notFoundText: '¿No ves lo que buscas? Mándanos una foto o una idea y te decimos cuánto cuesta.',
    notFoundButton: 'Cotizar algo distinto',
    footnote: 'Precios de referencia; el final te lo confirmamos por WhatsApp.',
    breadcrumbLabel: 'Ruta',
    home: 'Inicio',
    catalog: 'Catálogo',
  },
  product: {
    from: 'Desde',
    perPiece: 'por pieza',
    color: 'Color',
    quantity: 'Cantidad',
    quantityLess: 'Menos',
    quantityMore: 'Más',
    order: 'Pedir por WhatsApp',
    orderNote: 'Se abre WhatsApp con tu mensaje listo. No pagas nada todavía.',
    sheet: {
      size: 'Tamaño',
      customSize: 'A medida',
      material: 'Material',
      leadTime: 'Tiempo de entrega',
    },
    related: 'También te puede gustar',
    relatedAll: 'Ver todo el catálogo',
    galleryLabel: 'Fotos del producto',
    previous: 'Foto anterior',
    next: 'Foto siguiente',
    counter: (i: number, n: number) => `${i} / ${n}`,
    thumb: (i: number) => `Ver la foto ${i}`,
    optionsLabel: 'Pedir este producto',
  },
  errorPage: {
    title: 'Algo salió mal de nuestro lado.',
    retry: 'Intentar de nuevo',
    home: 'Ir al inicio',
  },
  notFound: {
    title: 'Error 404: página no encontrada.',
    text: 'Q-404 la buscó, pero ya sabes cómo es.',
    home: 'Ir al inicio',
    catalog: 'Ver el catálogo',
    imageAlt: 'Q-404, el robot de Quick Robot, buscando',
  },
  home: {
    hero: {
      heading: 'Quick Robot',
      alt: 'Un cuarto blanco con piezas impresas en 3D: un número de mesa, un porta QR y llaveros con nombre en la pared; abajo, un servilletero con el logo de una taquería, un robot, un niño, un gato y un árbol de Navidad.',
      slideAlt: (i: number, n: number) => `Portada ${i} de ${n}`,
    },
    xmas: {
      title: 'Regala algo que no hay en ninguna tienda.',
      lead: 'Con su nombre, su cara o lo que más le gusta.',
      cta: 'Apartar un regalo',
      clockLabel: 'Tiempo que falta para Nochebuena',
      remaining: 'Faltan para Nochebuena',
      day: 'día',
      days: 'días',
      hours: 'horas',
      minutes: 'min',
      seconds: 'seg',
      eveToday: 'Hoy es Nochebuena.',
      deadline: 'Último día para pedir',
      start: '1 oct',
      end: '24 dic',
      all: 'Ver todo lo de Navidad',
      today: 'Hoy',
    },
    ideas: {
      title: '¿Qué se te antoja?',
      lead: 'Toca una idea y te dejamos el mensaje listo para mandar.',
      prices: '¿Quieres ver precios?',
      openCatalog: 'Abre el catálogo',
    },
    video: {
      title: 'Así nace cada pieza.',
      lead: 'Capa por capa, de abajo hacia arriba. Horas de impresión en unos segundos.',
      playLabel: 'Reproducir el video',
      noVideo: 'Reproducir el video (todavía no hay video)',
    },
    printing: {
      title: 'Mientras lees esto, algo se está imprimiendo.',
      layer: 'Capa',
      of: 'de',
      done: 'Listo. Salió un Q-404.',
      meet: 'Conócelo →',
      alt: 'Q-404, el robot de Quick Robot, recién impreso.',
    },
    q404: {
      title: 'Q-404',
      choose: 'Escoge sus colores',
      say: [
        'Es nuestro robot. ',
        'No hace nada y tiene cara de menso,',
        ' pero en un escritorio se ve increíble.',
      ],
      cta: 'Quiero este Q-404',
      from: 'Desde',
      height: 'mide [alto] cm',
      notes: [
        { title: 'Antena', text: 'No capta nada.', x: 50, y: 13, side: 'l' },
        { title: 'Ojos', text: 'Cada uno ve para su lado.', x: 66, y: 34, side: 'r' },
        {
          title: 'Q-404',
          text: 'Su modelo. Error 404: función no encontrada.',
          x: 32,
          y: 64,
          side: 'l',
        },
        { title: 'Brazos', text: 'Nunca ha cargado nada.', x: 86, y: 58, side: 'r' },
        { title: 'Pies', text: 'Siempre parado. No va a ningún lado.', x: 34, y: 89, side: 'l' },
      ],
      imgAlt: (label: string) => `Q-404 en ${label.toLowerCase()}.`,
    },
    pit: {
      title: 'Q-404 no viene solo.',
      lead: 'Tiene muchos hermanos y todos quieren salir.',
      button: 'No aprietes este botón',
      pressing: 'Uy…',
      again: 'Te dije que no',
      note: 'En serio.',
      noteAgain: 'Te dije.',
      stop: 'Vaciar los robots',
      live: 'Están cayendo robots. Pulsa Escape o el botón Vaciar para quitarlos.',
      draining: 'Vaciando los robots.',
      freed: 'Listo, la pantalla quedó libre.',
    },
    order: {
      title: 'Pide lo que más te gusta.',
      lead: 'Llena lo morado y se abre WhatsApp con tu mensaje escrito. Te contestamos con precio y fecha.',
      small: 'Sin compromiso. Sabes el precio antes de que imprimamos nada.',
      contact: 'Quick Robot',
      reply: 'Contesta por WhatsApp',
      greeting: 'Hola, aquí Quick Robot. ¿Qué te imprimimos?',
      hello: 'Hola,',
      helloName: 'Hola, soy',
      namePlaceholder: 'tu nombre o tu negocio',
      nameLabel: 'Tu nombre o el de tu negocio',
      and: 'y necesito',
      quantityLabel: 'Cantidad',
      pieceLabel: 'Qué pieza',
      withWord: 'con',
      withLabel: 'Con qué',
      neededWord: 'Lo necesito',
      whenLabel: 'Para cuándo',
      detailsLabel: 'Detalles opcionales',
      detailsPlaceholder: 'Si quieres, cuéntanos más: colores, medidas, lo que se te ocurra…',
      send: 'Mandar por WhatsApp',
      sendNote:
        'Se abre WhatsApp con el mensaje listo. No se envía nada hasta que tú le das enviar.',
    },
  },
  /** Aprende (docs/21 §10, docs/22 §9). The texts of the pages themselves live in the database. */
  learn: {
    name: 'Aprende',
    homeTitle: 'Aprende · Quick Robot',
    home: { headline: '¿Se despegó? ¿Se tapó? ¿Salieron hilos?', try: 'Prueba con:' },
    searchPlaceholder: 'Busca un material, un problema o una pregunta',
    searchShort: 'Buscar en Aprende',
    crumbs: 'Migas',
    topics: 'Temas',
    /** Counts: `{n}` is replaced by the number (`countText` in src/lib/learn/tables.ts). */
    pagesCount: { one: '1 respuesta', many: '{n} respuestas' },
    termsCount: { one: '1 término', many: '{n} términos' },
    glance: 'Filamentos de un vistazo',
    glanceAll: 'Tabla completa',
    featured: 'Más buscado',
    summary: 'En corto',
    onThisPage: 'En esta página',
    related: 'También te puede servir',
    faq: 'Preguntas',
    sources: 'Fuentes',
    answers: 'Respuestas',
    topicChips: 'Temas de esta sección',
    allPages: 'Todas',
    table: 'Tabla',
    letters: 'Letras',
    seeMore: 'Ver más',
    reviewed: (month: string, year: number) => `Revisado en ${month} de ${year}`,
    months: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ],
    fact: 'Dato curioso',
    tip: 'Truco',
    careful: 'Cuidado',
    copy: 'Copiar',
    copied: 'Copiado',
    quick: {
      title: 'Revisión de 3 minutos:',
      text: 'cama limpia · filamento seco · placa y material correctos en el laminador',
      more: 'Ver más',
    },
    emptyTopic: 'Todavía no hay respuestas en este tema.',
    cta: {
      text: '¿Necesitas una pieza? Dinos qué necesitas y te decimos material, precio y fecha.',
      button: 'Cotizar por WhatsApp',
      /** Call to the page for workshops (`cta: system`, only while it is visible, docs/21 §4.6). */
      system: {
        /** Used when the page has no `ctaText`. */
        text: (name: string) =>
          `${name} lleva costos, pedidos, impresoras y filamento de tu taller en un solo lugar.`,
        button: (name: string) => `Conocer ${name}`,
      },
    },
    filaments: {
      label: 'Tabla de filamentos',
      use: 'Uso',
      count: { one: '1 material', many: '{n} materiales' },
      cols: {
        material: 'Material',
        uses: 'Usos',
        nozzle: 'Boquilla',
        bed: 'Cama',
        heat: 'Calor que aguanta',
        impact: 'Golpes',
        drying: 'Secado',
        printer: 'Impresora',
        hardened: 'Endurecida',
        hardenedLong: 'Boquilla endurecida',
        ams: 'AMS',
      },
      printer: {
        any: 'Abierta o cerrada',
        'enclosed-better': 'Mejor cerrada',
        enclosed: 'Cerrada',
      },
      yes: 'Sí',
      no: 'No',
      amsDry: 'Solo seco',
    },
    printers: {
      label: 'Volumen de impresión por impresora',
      size: 'Tamaño',
      brand: 'Marca',
      allBrands: 'Todas las marcas',
      onlyEnclosed: 'Solo cerradas',
      sortBySize: 'Ordenar por tamaño',
      sortByBrand: 'Ordenar por marca',
      count: { one: '1 impresora', many: '{n} impresoras' },
      cols: {
        printer: 'Impresora',
        size: 'Ancho × fondo × alto',
        volume: 'Volumen',
        type: 'Tipo',
        fits: '¿Cabe?',
        notes: 'Notas',
      },
      type: (enclosed: boolean, motion: string) =>
        `${enclosed ? 'Cerrada' : 'Abierta'}, ${motion === 'corexy' ? 'CoreXY' : 'cama móvil'}`,
      noFit: 'No cabe',
    },
    fit: {
      title: '¿Cabe mi pieza?',
      width: 'Ancho',
      depth: 'Fondo',
      height: 'Alto',
      unit: 'Unidad',
      mm: 'mm',
      cm: 'cm',
      standing: 'Cabe de pie',
      lying: 'Cabe acostada',
      prompt: 'Escribe las tres medidas.',
      /** `{n}` printers where it fits, of `{m}` shown. */
      count: 'Cabe en {n} de {m} impresoras.',
      none: 'No cabe en ninguna: se divide en partes.',
      note: (mm: number) =>
        `Se dejan ${mm} mm de margen en cada orilla de la cama. «Acostada» quiere decir que otra medida queda como alto.`,
    },
    calendar: { when: 'Cada cuándo' },
    cost: {
      title: 'Calculadora de costo',
      groups: { material: 'Material', machine: 'Máquina', other: 'Otros' },
      grams: 'Gramos de la pieza',
      purge: 'Purga',
      rollPrice: 'Precio del rollo',
      rollGrams: 'Peso del rollo',
      hours: 'Horas de impresión',
      watts: 'Consumo de la impresora',
      kwh: 'Precio del kWh',
      printerPrice: 'Precio de la impresora',
      lifeHours: 'Horas de vida',
      maintenance: 'Mantenimiento por hora',
      extras: 'Extras',
      fails: 'Piezas que salen mal',
      material: 'Material',
      electricity: 'Electricidad',
      machine: 'Máquina',
      extrasResult: 'Extras',
      subtotal: 'Subtotal',
      total: 'Costo',
      note: 'Valores de ejemplo. No se guarda nada.',
      detail: 'Ver detalle',
    },
    noResultsTable: 'Ningún filamento cumple todo eso. Quita un filtro.',
    search: {
      all: 'Todo',
      close: 'Cerrar',
      searching: 'Buscando…',
      results: { one: '1 resultado', many: '{n} resultados' },
      noResults: 'Sin resultados',
      seeAll: 'Ver los {n} resultados →',
      types: { page: 'Página', faq: 'Pregunta', term: 'Término', printer: 'Impresora' },
      empty: (q: string) => `404: no encontramos «${q}».`,
      emptyHint: 'Prueba con otras palabras, busca por tema o pregúntanos.',
      ask: '¿Lo preguntamos por ti?',
      error: 'No pudimos buscar. Intenta de nuevo.',
      resultsTitle: 'Resultados',
      pageTitle: (q: string) => `Resultados para «${q}» · Aprende · Quick Robot`,
      pageTitleEmpty: 'Buscar · Aprende · Quick Robot',
      heading: 'Buscar en Aprende',
      crumb: 'Buscar',
      resultsFor: { one: '1 resultado para «{q}»', many: '{n} resultados para «{q}»' },
    },
  },
  /**
   * The page for workshops («Para talleres», docs/25), from the mockups in
   * reference/mockups/talleres/, with the vocabulary of a system (docs/25 §1). The system's name,
   * days, limits and prices come in as arguments. Each page and each group of system screens has its
   * own section, with a `── … ──` title.
   */
  system: {
    seo: {
      home: (name: string) => ({
        title: `${name} · Sistema para talleres de impresión 3D`,
        description:
          'Costo por pieza, pedidos con anticipo, impresoras, filamento, existencias y reportes en un solo sistema para tu taller de impresión 3D.',
      }),
      pricing: (name: string) => ({
        title: `Precios · ${name}`,
        description: 'Paga por taller, no por impresora. El plan Gratis no vence.',
      }),
      download: (name: string) => ({
        title: `Descargar · ${name}`,
        description: 'Web, Mac, Windows y celular, con la misma cuenta.',
      }),
    },
    /** Product bar (`SystemNav`). */
    nav: {
      modules: 'Módulos',
      pricing: 'Precios',
      download: 'Descargar',
      signIn: 'Iniciar sesión',
      tryFree: 'Probar gratis',
      /** Label of the phone menu of the product bar. */
      menu: (name: string) => `Menú de ${name}`,
    },
    /** Shared calls to action. */
    cta: {
      tryDays: (days: number) => `Probar ${days} días gratis`,
      tryFree: 'Probar gratis',
      signUp: 'Crear cuenta',
      signUpFree: 'Crear cuenta gratis',
      seePricing: 'Ver precios',
      downloadApp: 'Descargar app',
      comparePlans: 'Comparar planes',
    },
    /** The 13 modules of the system, by group, in the order of its menu (`config/system.ts`). */
    groups: { sell: 'Vender', shop: 'Taller', business: 'Negocio' },
    modules: {
      products: {
        name: 'Productos',
        text: 'Piezas y colecciones con costo, precio de lista, ganancia y disponibles.',
      },
      sales: { name: 'Ventas', text: 'Registro por canal, con comisión, abonos y devoluciones.' },
      orders: {
        name: 'Pedidos',
        text: 'Cotizado, aceptado, en producción, listo y entregado, con anticipo y saldo.',
      },
      filaments: { name: 'Filamentos', text: 'Rollos, gramos disponibles y costo por gramo.' },
      supplies: { name: 'Insumos', text: 'Argollas, imanes y empaques, con existencia mínima.' },
      printers: {
        name: 'Impresoras',
        text: 'Cola de trabajos, horas de uso, mantenimiento e inversión recuperada.',
      },
      production: {
        name: 'Producción',
        text: 'Registro de cada impresión: resultado, horas y filamento usado.',
      },
      stock: {
        name: 'Existencias',
        text: 'Piezas terminadas: en existencia, apartadas y disponibles.',
      },
      purchases: {
        name: 'Compras',
        text: 'Compras sugeridas por proveedor, con cantidad y costo estimado.',
      },
      customers: { name: 'Clientes', text: 'Historial de pedidos y ventas, y saldo por cobrar.' },
      expenses: {
        name: 'Gastos',
        text: 'Fijos y variables; los recurrentes se prorratean por día.',
      },
      reports: {
        name: 'Reportes',
        text: 'Ventas, ganancia bruta y ganancia neta por periodo, canal y producto.',
      },
      settings: {
        name: 'Ajustes',
        text: 'Tarifa de luz, margen mínimo, canales de venta y datos de tus cotizaciones.',
      },
    },
    /** The 3 plans (`PlanBand`): name, who it is for and what it brings (limits as arguments). */
    plans: {
      label: 'Planes',
      recommended: 'Recomendado',
      perMonth: 'al mes',
      perYear: 'al año',
      noExpiry: 'sin vencimiento',
      /** Line under a monthly price: the yearly one. */
      orYearly: (amount: string) => `o ${amount} al año`,
      /** Line under a yearly price: what it comes to per month. */
      perMonthEquals: (amount: string) => `Equivale a ${amount} al mes`,
      note: (days: number) =>
        `Precios en pesos mexicanos, IVA incluido. Prueba de ${days} días del plan Negocio, sin tarjeta.`,
      noteShort: 'Precios en pesos mexicanos, IVA incluido.',
      /** «Ilimitadas» impresoras, «Ilimitados» pedidos (`limitLabel`). */
      unlimitedF: 'Ilimitadas',
      unlimitedM: 'Ilimitados',
      free: {
        name: 'Gratis',
        for: (printers: number) => `Una persona con hasta ${printers} impresoras.`,
        features: (p: { users: number; printers: number; orders: number }) => [
          p.users === 1 ? '1 usuario' : `${p.users} usuarios`,
          `Hasta ${p.printers} impresoras`,
          `${p.orders} ventas y pedidos al mes`,
          'Todos los módulos',
          'Copias de seguridad diarias',
        ],
      },
      shop: {
        name: 'Taller',
        for: 'Más impresoras y pedidos, sin límites.',
        features: (p: { users: number }) => [
          'Todo lo de Gratis',
          `${p.users} usuarios`,
          'Impresoras ilimitadas',
          'Ventas y pedidos ilimitados',
          'Soporte por WhatsApp',
        ],
      },
      business: {
        name: 'Negocio',
        for: 'Taller con empleados.',
        features: (p: { users: number }) => [
          'Todo lo de Taller',
          `${p.users} usuarios con roles`,
          'Ventas sin acceso a costos ni ganancia',
          'Soporte prioritario por WhatsApp',
        ],
      },
    },
    /** Dark closing band of the 3 pages (`EndCta`). */
    end: {
      title: 'Tu taller merece un cerebro.',
      lead: (days: number) =>
        `${days} días del plan Negocio, gratis y sin tarjeta. Al terminar eliges plan o continúas en Gratis.`,
    },

    // ── Main page /talleres (docs/25 §7.1) ──
    home: {
      /** Hero: under the big name. */
      hero: {
        sub: 'El cerebro de tu taller de impresión 3D.',
        lead: 'Sabe cuánto te cuesta cada gramo, qué imprime cada máquina, qué pedido se entrega mañana y cuánto ganaste este mes.',
        facts: (days: number) => [`${days} días gratis`, 'Sin tarjeta', 'Web, Mac y Windows'],
      },
      /** Modules (`ModuleIndex`). */
      modules: {
        title: '13 módulos. Cero libretas.',
        lead: 'Del primer gramo a la última entrega, en el mismo orden que el menú del sistema.',
      },
      /** Sections of the modules: name above, title, sentence and details. */
      cost: {
        title: 'Sabes cuánto ganas antes de imprimir.',
        lead: 'Material, luz, desgaste de la impresora y piezas fallidas, al centavo y con los datos de tu taller.',
        specs: [
          {
            name: 'Costo por gramo',
            text: 'Promedio de tus rollos del mismo filamento, según lo disponible en cada uno.',
          },
          {
            name: 'Precio de lista',
            text: 'Por valor (lo escribes tú) o por fórmula (margen sobre el costo).',
          },
          {
            name: 'Precio mínimo',
            text: 'Alerta cuando un precio queda debajo de tu margen mínimo.',
          },
          {
            name: 'Ganancia por canal',
            text: 'Descuenta la comisión de cada canal, como Mercado Libre.',
          },
          {
            name: 'Variantes y colecciones',
            text: 'Colores agrupados bajo la misma pieza; sets con su propio precio.',
          },
        ],
        /** The cost formula (`CostFormula`, terms of `costTerms`). */
        formula: {
          material: { name: 'Material', text: 'Gramos × costo por gramo × (1 + % de purga)' },
          power: { name: 'Luz', text: 'Horas × consumo de la impresora (kW) × tarifa del kWh' },
          machine: {
            name: 'Máquina',
            text: 'Horas × (precio de la impresora ÷ horas de vida + mantenimiento por hora)',
          },
          extras: { name: 'Extras', text: 'Extras + insumos de la pieza' },
          total: { name: 'Costo', text: '(Material + Luz + Máquina + Extras) ÷ (1 − % de fallos)' },
        },
      },
      orders: {
        title: 'Ningún pedido se te escapa.',
        lead: 'Del anticipo a la entrega, con el saldo y la fecha de entrega siempre a la vista.',
        specs: [
          {
            name: 'Anticipo y abonos',
            text: 'El saldo se cobra al entregar y la venta se registra automáticamente.',
          },
          {
            name: 'Apartado de existencias',
            text: 'Al aceptar, aparta las piezas terminadas; el resto pasa a producción.',
          },
          {
            name: 'Asignación de impresoras',
            text: 'Reparte los artículos entre tus impresoras y calcula la hora de término.',
          },
          { name: 'Filamento insuficiente', text: 'Alerta antes de iniciar la producción.' },
          { name: 'Vistas', text: 'Tablero, lista y calendario de entregas.' },
        ],
      },
      production: {
        title: 'Tus impresoras no descansan. Tú sí.',
        lead: 'Cola por impresora, tiempo restante de cada trabajo y mantenimiento antes de la falla.',
        specs: [
          {
            name: 'Cola automática',
            text: 'Al terminar un trabajo inicia el siguiente; al terminar el último de un pedido, el pedido pasa a Listo.',
          },
          {
            name: 'Registro de impresiones',
            text: 'Pieza, cantidad, resultado, horas y filamento por rollo. Las fallidas también descuentan filamento.',
          },
          {
            name: 'Mantenimiento por horas de uso',
            text: 'Boquilla cada 300 h, ejes cada 200 h y cama cada 100 h, editables. Al completarlo se registra el gasto.',
          },
          {
            name: 'Inversión recuperada',
            text: 'La ganancia neta se reparte entre tus impresoras según sus horas de uso.',
          },
        ],
      },
      filament: {
        title: 'Ningún rollo vacío a mitad de un pedido.',
        lead: 'Cada impresión descuenta su filamento. El sistema avisa antes de que se acabe y arma la lista de compras.',
        specs: [
          {
            name: 'Estados',
            text: 'Nuevo, Normal, Stock bajo (300 g o menos), Crítico (150 g o menos) y Agotado.',
          },
          { name: 'Historial por rollo', text: 'Consumo y purga por separado, mermas y ajustes.' },
          { name: 'Insumos', text: 'Argollas, imanes, cajas y bolsas, con existencia mínima.' },
          {
            name: 'Compras sugeridas',
            text: 'Por proveedor, con cantidad y costo estimado. Se copian como texto para enviarlas por WhatsApp.',
          },
        ],
      },
      stock: {
        title: 'Lo que ya imprimiste también es dinero.',
        lead: 'Piezas hechas, apartadas y disponibles, sin contar a mano.',
        specs: [
          {
            name: 'Movimientos automáticos',
            text: 'Cada impresión, venta, entrega y devolución suma o resta.',
          },
          { name: 'Ajustes', text: 'Corrección con nota si el conteo físico no coincide.' },
          { name: 'Variantes', text: 'Existencia por color dentro de la misma pieza.' },
          { name: 'Sets', text: 'Cuántos se pueden armar con las piezas disponibles.' },
        ],
      },
      documents: {
        title: 'Cotiza como empresa grande.',
        lead: 'Con los datos de tu negocio, en PDF o lista para pegar en WhatsApp.',
        specs: [
          { name: 'PDF o impresión', text: 'Desde el pedido o la venta.' },
          {
            name: 'Texto para WhatsApp',
            text: 'La misma cotización, lista para pegar en el chat.',
          },
          { name: 'Datos del negocio', text: 'Se capturan una vez en Ajustes.' },
        ],
      },
      reports: {
        title: 'Ganancia real, no la de la libreta.',
        lead: 'Ventas, gastos y ganancia neta por semana, canal y producto, contra el periodo anterior.',
        specs: [
          {
            name: 'Distribución de cada $100',
            text: 'Material, máquina, luz, comisiones, gastos y ganancia neta.',
          },
          {
            name: 'Por canal y por producto',
            text: 'Las colecciones se reparten entre sus piezas.',
          },
          { name: 'Gastos', text: 'Fijos y variables; los recurrentes se prorratean por día.' },
          { name: 'Resumen', text: 'Para copiar y compartir.' },
        ],
      },
      /** Alerts (`AlertsTable`, ids of `alerts`). */
      alerts: {
        title: 'Te avisa antes de que sea problema.',
        lead: 'Inicio junta lo que requiere atención, con el botón para resolverlo.',
        caption: 'Alertas de Inicio',
        head: { alert: 'Alerta', when: 'Cuándo aparece', action: 'Acción' },
        items: {
          filamentShort: {
            name: 'Filamento insuficiente',
            when: 'Un pedido aceptado requiere más filamento del disponible',
            action: 'Agregar rollo',
          },
          criticalStock: {
            name: 'Stock crítico',
            when: 'Un filamento llega a 150 g o menos',
            action: 'Ver filamento',
          },
          dueSoon: {
            name: 'Entrega próxima',
            when: 'Fecha de entrega en 2 días o menos, o vencida',
            action: 'Abrir pedido',
          },
          balanceDue: {
            name: 'Saldo por cobrar',
            when: 'Una venta o un pedido tiene saldo',
            action: 'Registrar abono',
          },
          priceBelowMin: {
            name: 'Precio bajo el mínimo',
            when: 'Un precio de lista queda debajo del margen mínimo',
            action: 'Editar precio',
          },
          maintenance: {
            name: 'Mantenimiento',
            when: 'Una tarea está próxima o vencida',
            action: 'Ver impresora',
          },
          lowSupply: {
            name: 'Insumo bajo',
            when: 'Un insumo llega a su mínimo o se agota',
            action: 'Registrar compra',
          },
        },
      },
      /** Team (`RolesTable`, roles and areas of `roleMatrix`). */
      team: {
        title: 'Tu equipo trabaja. Tus números quedan contigo.',
        lead: 'Roles para administración, ventas y taller en el plan Negocio. Ventas no ve costos ni ganancia.',
        caption: 'Módulos que ve cada rol',
        areasHead: 'Módulos',
        /** Full name and, for narrow phones, a short one (`null` = the same). */
        roles: {
          owner: { name: 'Dueño', short: null },
          admin: { name: 'Administración', short: 'Admin.' },
          sales: { name: 'Ventas', short: null },
          shop: { name: 'Taller', short: null },
        },
        areas: {
          selling: 'Ventas, pedidos y clientes',
          workshop: 'Producción, existencias y filamento',
          money: 'Costos, ganancia y reportes',
          expenses: 'Gastos',
          account: 'Usuarios y suscripción',
        },
        yes: 'sí',
        no: 'no',
      },
      /** Data (`DataFacts`). */
      data: {
        title: 'Respaldado todos los días.',
        facts: [
          {
            name: 'Copias de seguridad',
            text: 'Automáticas, una por día. Se conservan las últimas 7 y se restaura cualquiera.',
          },
          {
            name: 'Exportación a Excel',
            text: 'Ventas, pedidos, clientes, productos y costos, filamentos, insumos y gastos, en CSV.',
          },
          {
            name: 'Información separada',
            text: 'Cada taller tiene su cuenta; ningún otro taller tiene acceso a tu información.',
          },
        ],
      },
      /** Pricing band. */
      price: {
        title: 'Paga por taller, no por impresora.',
        lead: 'Empieza gratis: el plan Gratis no vence.',
      },
      /** Questions (`Faqs`). */
      faq: {
        title: 'Preguntas',
        items: (name: string, days: number) => [
          {
            question: '¿Necesito tarjeta para la prueba?',
            answer: `No. Son ${days} días del plan Negocio sin tarjeta. Al terminar, la cuenta pasa al plan Gratis sin perder información.`,
          },
          {
            question: '¿Es compatible con mi impresora?',
            answer: `Sí, con cualquier marca. ${name} no se conecta a la impresora: los gramos y el tiempo de impresión se capturan desde tu laminador (Bambu Studio, OrcaSlicer, PrusaSlicer o Cura).`,
          },
          {
            question: '¿Emite facturas (CFDI)?',
            answer:
              'No. Genera cotizaciones y notas de venta. El CFDI se emite en tu sistema de facturación.',
          },
          {
            question: '¿Funciona sin internet?',
            answer:
              'No. La información se guarda en tu cuenta para consultarla igual en la computadora y en el celular.',
          },
          {
            question: '¿El costo incluye mi tiempo de trabajo?',
            answer:
              'No. El costo incluye material, luz, máquina, extras y reserva por fallos. El precio de venta lo defines tú.',
          },
          {
            question: '¿Puedo exportar mi información?',
            answer:
              'Sí. Copia de seguridad completa o exportación a Excel (CSV), en cualquier momento.',
          },
          { question: '¿Puedo cancelar?', answer: 'Sí, desde Ajustes, sin llamadas.' },
        ],
      },
    },

    // ── Pricing page /talleres/precios (docs/25 §7.2) ──
    pricing: {
      title: 'Precios',
      lead: 'Paga por taller, no por impresora. El plan Gratis no vence.',
      /** Monthly or yearly (`PeriodToggle`). */
      period: {
        label: 'Periodo de pago',
        monthly: 'Mensual',
        yearly: 'Anual',
        yearlyNote: '2 meses gratis',
      },
      /** Trial and founder price, two blocks under the plans. */
      terms: {
        label: 'Prueba y precio de fundador',
        trial: 'Prueba',
        trialText: (days: number) =>
          `${days} días del plan Negocio, sin tarjeta. Al terminar, la cuenta pasa a Gratis o al plan que elijas.`,
        founder: 'Precio de fundador',
        founderText: (seats: number) =>
          `Los primeros ${seats} talleres con suscripción conservan su precio mientras la suscripción siga activa.`,
      },
      /** Plan comparison (`CompareTable`, rows in `config/system.ts`). */
      compare: {
        title: 'Comparación',
        /** Caption for screen readers: the plan names, «A, B y C». */
        caption: (names: string[]) =>
          `Comparación de los planes ${names.slice(0, -1).join(', ')} y ${names[names.length - 1] ?? ''}`,
        feature: 'Función',
        included: 'Incluido',
        notIncluded: 'No incluido',
        yes: 'Sí',
        priority: 'Prioritario',
        groups: {
          limits: 'Límites',
          modules: 'Módulos',
          team: 'Equipo',
          platforms: 'Plataformas y datos',
          support: 'Soporte',
        },
        rows: {
          users: 'Usuarios',
          printers: 'Impresoras',
          orders: 'Ventas y pedidos al mes',
          cost: 'Costo por pieza y precios',
          deposits: 'Pedidos con anticipo y saldo',
          production: 'Producción e impresoras',
          materials: 'Filamento, insumos y compras',
          stock: 'Existencias',
          documents: 'Cotizaciones y notas de venta',
          reports: 'Reportes y gastos',
          roles: 'Roles: Administración, Ventas y Taller',
          salesView: 'Ventas sin acceso a costos ni ganancia',
          platforms: 'Web, Mac y Windows',
          backups: 'Copias de seguridad diarias',
          excel: 'Exportación a Excel',
          support: 'Soporte por WhatsApp',
        },
      },
      /** Payment questions (`Faqs`). */
      pay: {
        title: 'Pago',
        faqs: [
          {
            question: '¿Qué formas de pago aceptan?',
            answer: 'Tarjeta de crédito o débito. El cargo es automático cada mes o cada año.',
          },
          {
            question: '¿Puedo cambiar de plan?',
            answer: 'Sí, en cualquier momento. La diferencia se ajusta en el siguiente cargo.',
          },
          {
            question: '¿Qué pasa al terminar la prueba?',
            answer: 'La cuenta pasa a Gratis. No hay cargo porque no se pidió tarjeta.',
          },
          {
            question: '¿Qué pasa si un cargo no se completa?',
            answer:
              'Recibes un aviso por correo y se intenta de nuevo. Si no se completa, la cuenta queda en solo lectura hasta el pago; no se borra información.',
          },
          {
            question: '¿Cómo cancelo?',
            answer:
              'Desde Ajustes. El plan sigue activo hasta el final del periodo pagado y después pasa a Gratis.',
          },
        ],
      },
    },

    // ── Download page /talleres/descargar (docs/25 §7.3) ──
    download: {
      title: 'Descargar',
      lead: 'Tu taller en el Dock o en la barra de tareas. Misma cuenta y misma información que en el navegador y el celular.',
      /** Main button by the visitor's device (the server reads the `User-Agent`). */
      main: {
        mac: 'Descargar para Mac',
        windows: 'Descargar para Windows',
        browser: 'Abrir en el navegador',
      },
      /** Line under the buttons, by device; desktop ones get the requirement of the installer. */
      req: {
        mac: (minOs: string) => `${minOs}. Para Windows, más abajo.`,
        windows: (minOs: string) => `${minOs}. Para Mac, más abajo.`,
        mobile:
          'En el celular se usa desde el navegador y se puede agregar a la pantalla de inicio.',
        other: 'Funciona en cualquier navegador actual.',
      },
      /** `PlatformList`: one row per platform of `config/system.ts`. */
      platforms: {
        title: 'Plataformas',
        yours: 'Tu equipo',
        mac: {
          name: 'Mac',
          what: 'App de escritorio con ícono en el Dock.',
          button: 'Descargar para Mac (.dmg)',
        },
        windows: {
          name: 'Windows',
          what: 'App de escritorio con ícono en la barra de tareas.',
          button: 'Descargar para Windows (.exe)',
        },
        other: {
          name: 'Navegador',
          req: 'Chrome, Safari, Edge o Firefox actuales',
          what: 'Sin instalación, desde cualquier computadora.',
          button: 'Abrir en el navegador',
        },
        mobile: {
          name: 'Celular',
          req: 'iPhone o Android',
          what: 'Desde el navegador; se puede agregar a la pantalla de inicio.',
          button: 'Abrir en el celular',
        },
      },
      install: {
        title: 'Instalación',
        mac: {
          title: 'Mac',
          steps: (name: string) => [
            'Abre el archivo .dmg.',
            `Arrastra ${name} a Aplicaciones.`,
            'Abre la app e inicia sesión.',
          ],
        },
        windows: {
          title: 'Windows',
          steps: [
            'Abre el archivo .exe.',
            'Sigue los pasos del instalador.',
            'Abre la app desde el menú Inicio e inicia sesión.',
          ],
        },
      },
      /** Closing call `system` of an Aprende page (`learn/Cta.astro`, docs/21 §4.6). */
    },

    /** Labels of the system screens drawn in HTML (docs/25 §6.3), with the vocabulary of a system. */
    ui: {
      /** Shared by several screens. */
      common: {
        /** States with a dot (`UiPill`). */
        states: {
          available: 'Disponible',
          lowStock: 'Stock bajo',
          critical: 'Crítico',
          urgent: 'Urgente',
          inProduction: 'En producción',
          ready: 'Listo',
          printing: 'Imprimiendo',
          upToDate: 'Al día',
          reserved: 'Apartado',
          normal: 'Normal',
        },
        /** «De cada $100 vendidos» (keys of `demoPer100`). */
        per100: {
          expenses: 'Gastos del negocio',
          material: 'Material',
          machine: 'Máquina',
          extras: 'Extras e insumos',
          fees: 'Comisiones',
          failures: 'Reserva por fallos',
          power: 'Luz',
          net: 'Ganancia neta',
        },
        sales: 'Ventas',
        gross: 'Ganancia bruta',
        expenses: 'Gastos',
        net: 'Ganancia neta',
        receivable: 'Por cobrar',
        salesByWeek: 'Ventas por semana',
        /** «▲ 14.6 %». */
        up: (pct: string) => `▲ ${pct} %`,
        timeLeft: 'Tiempo restante',
      },

      // ── Home screen (UiSidebar, UiHome, UiFloats) ──
      home: {
        /** Description of the whole screen for screen readers (`UiFrame`). */
        label: (p: {
          name: string;
          days: number;
          total: string;
          gross: string;
          net: string;
          alerts: number;
          printing: number;
          printers: number;
        }) =>
          `Pantalla de Inicio de ${p.name}: ventas de ${p.days} días por ${p.total} con ganancia bruta de ${p.gross} y ganancia neta de ${p.net}, ${p.alerts} alertas con su acción, ${p.printing} de ${p.printers} impresoras trabajando con su tiempo restante y próximas entregas`,
        title: 'Inicio',
        /** Side bar: search box and its shortcut. */
        search: 'Buscar',
        searchKey: '⌘K',
        /** Drawn actions of the header. */
        actions: { sale: 'Registrar venta', order: 'Nuevo pedido', piece: 'Nueva pieza' },
        salesOf: (days: number) => `Ventas · últimos ${days} días`,
        /** After «▲ 14.6 %». */
        vsPrevious: (count: number) => ` contra el periodo anterior · ${count} ventas`,
        alerts: 'Alertas',
        /** Each alert: its title, its line and its action. */
        alert: {
          filament: {
            title: (order: number, customer: string) => `Pedido #${order} · ${customer}`,
            text: (filament: string, grams: number) =>
              `Filamento insuficiente: ${filament}, faltan ${grams} g`,
            action: 'Agregar rollo',
          },
          due: {
            title: (order: number, customer: string) => `Pedido #${order} · ${customer}`,
            text: (due: string) => `Fecha de entrega: mañana, ${due}`,
            action: 'Abrir pedido',
          },
          stock: {
            text: (grams: number) => `Stock crítico: ${grams} g disponibles`,
            action: 'Ver filamento',
          },
          balance: {
            title: (date: string, customer: string) => `Venta del ${date} · ${customer}`,
            text: (amount: string) => `Saldo por cobrar: ${amount}`,
            action: 'Registrar abono',
          },
          maintenance: {
            text: (part: string, hours: number) => `Mantenimiento próximo: ${part} en ${hours} h`,
            action: 'Ver impresora',
          },
        },
        printing: 'En impresión',
        printersOf: (n: number, total: number) => `${n} de ${total} impresoras`,
        job: (qty: number, piece: string, order: number) => `${qty} × ${piece} · Pedido #${order}`,
        /** After «Tiempo restante: ». */
        duration: (h: number, min: number) => `${h} h ${min} min`,
        deliveries: 'Próximas entregas',
        order: (n: number) => `Pedido #${n}`,
        /** Order state not in `common.states`. */
        accepted: 'Aceptado',
        /** Floating notices of the hero (`UiFloats`). */
        floats: {
          ready: (order: number) => `Pedido #${order} listo para entregar`,
          readyMeta: (customer: string, due: string) => `${customer} · fecha de entrega: ${due}`,
          net: (days: number) => `Ganancia neta · ${days} días`,
        },
      },

      // ── Cost of a piece and order (UiPiece, UiOrder) ──
      /** Cost of a piece (`UiPiece`). */
      piece: {
        /** Description of the whole screen for screen readers. */
        label: (system: string, piece: string, cost: string, price: string, profit: string) =>
          `Costo de una pieza en ${system}: ${piece.toLowerCase()}, costo de ${cost} desglosado en material, máquina, reserva por fallos y luz; precio de ${price}, ganancia de ${profit} y ganancia por canal`,
        /** Minutes as «2 h 30 min» (also the time left of `UiOrder`). */
        duration: (minutes: number) => {
          const h = Math.floor(minutes / 60);
          const m = Math.round(minutes % 60);
          return h > 0 ? (m > 0 ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
        },
        grams: (n: number) => `${n} g`,
        breakdown: 'Desglose del costo',
        /** Rows of the breakdown. */
        rows: {
          material: 'Material',
          machine: 'Máquina',
          failures: 'Reserva por fallos',
          power: 'Luz',
          extras: 'Extras',
        },
        /** How each row is worked out, under its name. */
        how: {
          material: (grams: number, perGram: string, factor: string) =>
            `${grams} g × ${perGram} × ${factor}`,
          machine: (hours: string, perHour: string) => `${hours} h × ${perHour}`,
          failures: (pct: number) => `${pct} %`,
          power: (hours: string, kw: string, kwhPrice: string) =>
            `${hours} h × ${kw} kW × ${kwhPrice}`,
        },
        /** «63.6 %». */
        pct: (n: string) => `${n} %`,
        cost: 'Costo',
        byValue: 'Por valor',
        byFormula: 'Por fórmula',
        listPrice: 'Precio de lista',
        profit: 'Ganancia',
        margin: 'Margen',
        times: 'Veces el costo',
        /** «4.5×». */
        timesValue: (n: string) => `${n}×`,
        floor: (price: string, pct: number) =>
          `Arriba del precio mínimo: ${price} (margen ${pct} %)`,
        byChannel: 'Ganancia por canal',
        channel: 'Canal',
        fee: 'Comisión',
      },
      /** An order (`UiOrder`). */
      order: {
        /** Description of the whole screen for screen readers. */
        label: (
          system: string,
          n: number,
          state: string,
          total: string,
          paid: string,
          balance: string,
          items: string,
        ) =>
          `Pedido #${n} en ${system}: estado ${state}, total ${total}, pagado ${paid} y saldo ${balance}; ${items} con su impresora, avance y tiempo restante, y fin estimado de producción`,
        /** Number of items in words for the description: «dos artículos». */
        itemCount: (n: number) =>
          n === 1
            ? 'un artículo'
            : `${['', '', 'dos', 'tres', 'cuatro', 'cinco'][n] || n} artículos`,
        number: (n: number) => `Pedido #${n}`,
        /** States of an order, in order (keys of `demoOrder3Detail.steps`). */
        steps: {
          quoted: 'Cotizado',
          accepted: 'Aceptado',
          production: 'En producción',
          ready: 'Listo',
          delivered: 'Entregado',
        },
        total: 'Total',
        paid: 'Pagado',
        balance: 'Saldo',
        due: 'Fecha de entrega',
        items: 'Artículos',
        pieces: (n: number) => `${n} piezas`,
        item: (qty: number, name: string) => `${qty} × ${name}`,
        fromStock: (n: number) => `Existencias: ${n}`,
        toPrint: (n: number) => `Por imprimir: ${n}`,
        /** Progress and time left of the printer: «62 % · 6 h 50 min». */
        progress: (pct: number, left: string) => `${pct} % · ${left}`,
        end: (when: string) => `Fin estimado de producción: ${when}`,
        payments: 'Pagos',
        /** Kinds of payment (keys of `demoOrder3Detail.payments`). */
        paymentKinds: { deposit: 'Anticipo', partial: 'Abono' },
        payment: (kind: string, date: string) => `${kind} · ${date}`,
        actions: {
          markReady: 'Marcar listo',
          addPayment: 'Registrar pago',
          quote: 'Cotización',
          copy: 'Copiar',
        },
      },

      // ── Printers, filaments, purchases and stock (UiPrinters, UiFilaments, UiPurchases, UiStock) ──
      /** «Impresoras» (`UiPrinters`). */
      printers: {
        label: (name: string) =>
          `Impresoras en ${name}: dos imprimiendo con su avance, tiempo restante y siguiente trabajo en cola, una disponible; horas de uso, estado de mantenimiento e inversión recuperada de cada una`,
        title: 'Impresoras',
        /** Units next to the numbers: «286 h», «62 %», «570 g». */
        hoursValue: (n: number) => `${n} h`,
        percent: (n: number) => `${n} %`,
        grams: (n: string) => `${n} g`,
        printing: (n: number, of: number) => `${n} de ${of} imprimiendo`,
        /** «3 × Letrero de taquería · Pedido #3». */
        job: (qty: number, piece: string, order: number) => `${qty} × ${piece} · Pedido #${order}`,
        timeLeft: (h: number, min: number) => `Tiempo restante: ${h} h ${min} min`,
        next: (job: string) => `Siguiente en cola: ${job}`,
        emptyQueue: 'Cola vacía',
        idle: 'Sin trabajo en curso',
        hours: 'Horas de uso',
        maintenance: 'Mantenimiento',
        /** Maintenance due: «Boquilla en 14 h». */
        due: { nozzle: (h: number) => `Boquilla en ${h} h` },
        recovered: 'Inversión recuperada',
        production: 'Producción · últimos 30 días',
        prints: 'Impresiones',
        good: 'Correctas',
        failed: 'Fallidas',
        filament: 'Filamento',
      },
      /** «Filamentos» (`UiFilaments`). */
      filaments: {
        label: (name: string) =>
          `Filamentos en ${name}: siete filamentos con su costo por gramo, gramos disponibles y estado; TPU 95A Azul en stock bajo y PLA Silk Morado en crítico`,
        title: 'Filamentos',
        summary: (filaments: number, rolls: number, kg: string) =>
          `${filaments} filamentos · ${rolls} rollos · ${kg} kg disponibles`,
        addRoll: 'Agregar rollo',
        filament: 'Filamento',
        perGram: 'Costo/g',
        available: 'Disponible',
        state: 'Estado',
        /** «2 rollos · Sunlu». */
        rolls: (n: number, brand: string) => `${n} ${n === 1 ? 'rollo' : 'rollos'} · ${brand}`,
        grams: (n: string) => `${n} g`,
      },
      /** «Compras sugeridas» (`UiPurchases`). */
      purchases: {
        label: (name: string, total: string) =>
          `Compras sugeridas en ${name}: cuatro artículos agrupados por proveedor con cantidad y costo estimado de ${total}; el rollo de PLA Negro es urgente porque un pedido requiere más de lo disponible`,
        title: 'Compras sugeridas',
        summary: (items: number, total: string) => `${items} artículos · costo estimado ${total}`,
        copy: 'Copiar pedido',
        available: (grams: string) => `Disponible: ${grams} g`,
        /** «Pedido #5 requiere 535 g · disponible: 410 g». */
        needs: (order: number, needs: string, grams: string) =>
          `Pedido #${order} requiere ${needs} g · disponible: ${grams} g`,
        stock: (stock: number, min: number) => `Existencia: ${stock} · mínimo: ${min}`,
        rolls: (n: number) => `${n} ${n === 1 ? 'rollo' : 'rollos'}`,
        pieces: (n: number) => `${n} pzas`,
        /** Estimated cost: «≈ $470». */
        about: (amount: string) => `≈ ${amount}`,
      },
      /** «Existencias» (`UiStock`). */
      stock: {
        label: (name: string) =>
          `Existencias en ${name}: piezas terminadas con existencia, apartadas para pedidos, disponibles y estado; variantes de color del dragón articulado y sets armables`,
        title: 'Existencias',
        summary: (pieces: number, reserved: number, available: number) =>
          `${pieces} piezas · ${reserved} apartadas · ${available} disponibles`,
        register: 'Registrar impresión',
        product: 'Producto',
        stock: 'Existencia',
        reserved: 'Apartadas',
        available: 'Disponibles',
        state: 'Estado',
        variants: (n: number) => `${n} variantes`,
        sets: 'Sets',
        /** «4 piezas · Falta: Figura de escritorio». */
        setInfo: (pieces: number, missing: string) => `${pieces} piezas · Falta: ${missing}`,
        buildable: 'armables',
      },

      // ── Quote and reports (UiQuote, UiReports) ──
      /** Quote sheet (`UiQuote`). */
      quote: {
        /** Description of the whole screen for screen readers. */
        label: (p: { system: string; business: string; items: number; total: string }) =>
          `Cotización de ${p.system} con los datos del negocio ${p.business}, folio, vigencia, cliente, ${
            ['un artículo', 'dos artículos', 'tres artículos', 'cuatro artículos'][p.items - 1] ??
            `${p.items} artículos`
          } y total de ${p.total}`,
        title: 'Cotización',
        /** «Impresión 3D · Guadalajara, Jal.». */
        kindCity: (kind: string, city: string) => `${kind} · ${city}`,
        /** «33 1234 5678 · hola@ejez.mx». */
        contact: (phone: string, email: string) => `${phone} · ${email}`,
        folio: (folio: string) => `Folio ${folio}`,
        date: (date: string) => `Fecha: ${date}`,
        validity: (days: number) => `Vigencia: ${days} días`,
        customer: 'Cliente',
        qty: 'Cant.',
        description: 'Descripción',
        unitPrice: 'P. unitario',
        amount: 'Importe',
        total: 'Total',
        /** Short months of the dates of the screens («13 nov 2026»). */
        months: [
          'ene',
          'feb',
          'mar',
          'abr',
          'may',
          'jun',
          'jul',
          'ago',
          'sep',
          'oct',
          'nov',
          'dic',
        ],
      },
      /** Reports (`UiReports`). */
      reports: {
        /** Description of the whole screen for screen readers. */
        label: (p: {
          system: string;
          days: number;
          sales: string;
          gross: string;
          expenses: string;
          net: string;
          netPer100: string;
        }) =>
          `Reportes de ${p.system}, últimos ${p.days} días: ventas de ${p.sales}, ganancia bruta de ${p.gross}, gastos de ${p.expenses} y ganancia neta de ${p.net}; ventas por semana, distribución de cada $100 vendidos (ganancia neta ${p.netPer100}), productos con más ganancia y ventas por canal`,
        title: 'Reportes',
        /** «15 oct – 13 nov 2026 · comparado con 15 sep – 14 oct». */
        period: (from: string, to: string, prevFrom: string, prevTo: string) =>
          `${from} – ${to} · comparado con ${prevFrom} – ${prevTo}`,
        /** An option of the period selector: «30 días», or «Todo» for the whole history. */
        range: (days: number | null) => (days === null ? 'Todo' : `${days} días`),
        copySummary: 'Copiar resumen',
        netMargin: 'Margen neto',
        /** «37.8 %». */
        percent: (n: string) => `${n} %`,
        per100: 'Distribución de cada $100 vendidos',
        costsAndExpenses: 'Costos y gastos',
        topProducts: 'Productos con más ganancia',
        sold: (n: number) => (n === 1 ? '1 vendida' : `${n} vendidas`),
        byChannel: 'Por canal',
        channel: 'Canal',
        count: 'Ventas',
        amount: 'Importe',
        fee: 'Comisión',
        profit: 'Ganancia',
        total: 'Total',
      },
    },
  },
  underConstruction: {
    title: 'En construcción',
    text: 'Q-404 está armando la página. Vuelve pronto.',
    imageAlt: 'Q-404, el robot de Quick Robot, de pie',
  },
} as const;
