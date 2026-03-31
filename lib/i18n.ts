export type Locale = 'ca' | 'es'

export const translations = {
  ca: {
    hero: {
      badge: 'Servei professional garantit',
      title: 'Neteja i Fumigació',
      titleAccent: 'Especialitzada',
      subtitle: 'Maquinària agrícola i industrial, naus ramaderes, hípiques i centres canins. Reserva online en menys de 2 minuts.',
      cta: 'Reservar Ara',
      ctaSecondary: 'Veure Serveis',
    },
    services: {
      title: 'Els Nostres Serveis',
      subtitle: 'Solucions de neteja professional adaptades a cada tipus d\'espai',
      items: [
        {
          titulo: 'Neteja Màquines Agrícoles',
          descripcion: 'Neteja professional de tota la maquinària agrícola amb productes especialitzats i tècniques d\'alta pressió.',
          features: ['Desgreixat profund', 'Neteja de cabines', 'Sistemes hidràulics'],
        },
        {
          titulo: 'Neteja Maquinària Industrial',
          descripcion: 'Manteniment i neteja de maquinària industrial amb protocols de seguretat certificats.',
          features: ['Maquinària pesant', 'Sistemes de producció', 'Manteniment preventiu'],
        },
        {
          titulo: 'Neteja Naus i Piscines',
          descripcion: 'Neteja integral de naus industrials i piscines amb equips d\'alta capacitat.',
          features: ['Naus completes', 'Piscines industrials', 'Zones d\'emmagatzematge'],
        },
        {
          titulo: 'Neteja Naus Ramaderes',
          descripcion: 'Higienització completa d\'instal·lacions ramaderes amb productes segurs per als animals.',
          features: ['Estables i corrals', 'Desinfecció sanitària', 'Control d\'olors'],
        },
        {
          titulo: 'Fumigació Hípiques',
          descripcion: 'Tractaments de fumigació especialitzats per a centres hípics, segurs per als cavalls.',
          features: ['Control de plagues', 'Desinfecció boxes', 'Tractaments preventius'],
        },
        {
          titulo: 'Fumigació Centres Canins',
          descripcion: 'Fumigació pet-safe per a residències canines, gosseres i centres d\'adiestrament.',
          features: ['Productes pet-safe', 'Control de paràsits', 'Desodorització'],
        },
      ],
    },
    why: {
      label: 'Per què triar-nos?',
      title: 'Professionalitat i qualitat en cada servei',
      subtitle: 'Som especialistes en neteja industrial i fumigació amb més d\'una dècada d\'experiència. El nostre equip està format per professionals qualificats compromesos amb l\'excel·lència.',
      items: [
        { titulo: 'Més de 10 anys d\'experiència', desc: 'Especialistes en neteja industrial i fumigació' },
        { titulo: 'Productes certificats', desc: 'Fem servir només productes homologats i segurs' },
        { titulo: 'Equip professional', desc: 'Personal qualificat i amb formació contínua' },
        { titulo: 'Resposta ràpida', desc: 'Disponibilitat en 24-48 hores per a urgències' },
      ],
      contact: {
        title: 'Contacte directe',
        phone: 'Telèfon',
        email: 'Correu electrònic',
        zone: 'Zona de servei',
        zoneValue: 'Catalunya i voltants',
      },
    },
    cta: {
      badge: 'Reserva online en 2 minuts',
      title: 'Preparat per començar?',
      subtitle: 'Sol·licita el teu pressupost sense compromís. Et contactarem en menys de 24 hores per confirmar tots els detalls.',
      button: 'Sol·licitar Pressupost',
      note: 'Sense compromís · Resposta en 24h · Servei professional',
    },
    footer: {
      rights: 'Neteja Industrial. Tots els drets reservats.',
      admin: 'Accés Admin',
    },
  },
  es: {
    hero: {
      badge: 'Servicio profesional garantizado',
      title: 'Limpieza y Fumigación',
      titleAccent: 'Especializada',
      subtitle: 'Maquinaria agrícola e industrial, naves ganaderas, hípicas y centros caninos. Reserva online en menos de 2 minutos.',
      cta: 'Reservar Ahora',
      ctaSecondary: 'Ver Servicios',
    },
    services: {
      title: 'Nuestros Servicios',
      subtitle: 'Soluciones de limpieza profesional adaptadas a cada tipo de espacio',
      items: [
        {
          titulo: 'Limpieza Máquinas Agrícolas',
          descripcion: 'Limpieza profesional de toda la maquinaria agrícola con productos especializados y técnicas de alta presión.',
          features: ['Desengrase profundo', 'Limpieza de cabinas', 'Sistemas hidráulicos'],
        },
        {
          titulo: 'Limpieza Maquinaria Industrial',
          descripcion: 'Mantenimiento y limpieza de maquinaria industrial con protocolos de seguridad certificados.',
          features: ['Maquinaria pesada', 'Sistemas de producción', 'Mantenimiento preventivo'],
        },
        {
          titulo: 'Limpieza Naves y Piscinas',
          descripcion: 'Limpieza integral de naves industriales y piscinas con equipos de alta capacidad.',
          features: ['Naves completas', 'Piscinas industriales', 'Zonas de almacenaje'],
        },
        {
          titulo: 'Limpieza Naves Ganaderas',
          descripcion: 'Higienización completa de instalaciones ganaderas con productos seguros para animales.',
          features: ['Establos y corrales', 'Desinfección sanitaria', 'Control de olores'],
        },
        {
          titulo: 'Fumigación Hípicas',
          descripcion: 'Tratamientos de fumigación especializados para centros hípicos, seguros para caballos.',
          features: ['Control de plagas', 'Desinfección boxes', 'Tratamientos preventivos'],
        },
        {
          titulo: 'Fumigación Centros Caninos',
          descripcion: 'Fumigación pet-safe para residencias caninas, perreras y centros de adiestramiento.',
          features: ['Productos pet-safe', 'Control de parásitos', 'Desodorización'],
        },
      ],
    },
    why: {
      label: '¿Por qué elegirnos?',
      title: 'Profesionalidad y calidad en cada servicio',
      subtitle: 'Somos especialistas en limpieza industrial y fumigación con más de una década de experiencia. Nuestro equipo está formado por profesionales cualificados comprometidos con la excelencia.',
      items: [
        { titulo: 'Más de 10 años de experiencia', desc: 'Especialistas en limpieza industrial y fumigación' },
        { titulo: 'Productos certificados', desc: 'Utilizamos solo productos homologados y seguros' },
        { titulo: 'Equipo profesional', desc: 'Personal cualificado y con formación continua' },
        { titulo: 'Respuesta rápida', desc: 'Disponibilidad en 24-48 horas para urgencias' },
      ],
      contact: {
        title: 'Contacto directo',
        phone: 'Teléfono',
        email: 'Email',
        zone: 'Zona de servicio',
        zoneValue: 'Cataluña y alrededores',
      },
    },
    cta: {
      badge: 'Reserva online en 2 minutos',
      title: '¿Listo para empezar?',
      subtitle: 'Solicita tu presupuesto sin compromiso. Te contactaremos en menos de 24 horas para confirmar todos los detalles.',
      button: 'Solicitar Presupuesto',
      note: 'Sin compromiso · Respuesta en 24h · Servicio profesional',
    },
    footer: {
      rights: 'Limpieza Industrial. Todos los derechos reservados.',
      admin: 'Acceso Admin',
    },
  },
}

export function getT(locale: string) {
  return translations[(locale as Locale) in translations ? (locale as Locale) : 'ca']
}
