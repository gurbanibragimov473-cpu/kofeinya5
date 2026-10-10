const MENU_CATEGORIES = [
  {
    "id": "hot",
    "name": "Кофе",
    "products": [
      {
        "id": "hot0",
        "name": "Американо · Бразилия",
        "sizes": [
          {
            "label": "0,2 л",
            "price": 890
          },
          {
            "label": "0,3 л",
            "price": 990
          }
        ],
        "image": "tea",
        "badge": null,
        "description": "Классический американо на зёрнах из Бразилии.",
        "isDrink": true
      },
      {
        "id": "hot1",
        "name": "Американо · Эфиопия",
        "sizes": [
          {
            "label": "0,2 л",
            "price": 1090
          },
          {
            "label": "0,3 л",
            "price": 1190
          }
        ],
        "image": "tea",
        "badge": null,
        "description": "Яркий американо на эфиопских зёрнах.",
        "isDrink": true
      },
      {
        "id": "hot2",
        "name": "Капучино",
        "sizes": [
          {
            "label": "0,2 л",
            "price": 1090
          },
          {
            "label": "0,3 л",
            "price": 1390
          }
        ],
        "image": "latte",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "hot3",
        "name": "Латте",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1390
          }
        ],
        "image": "latte",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "hot4",
        "name": "Флэт-уайт",
        "sizes": [
          {
            "label": "0,2 л",
            "price": 1090
          }
        ],
        "image": "latte",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "hot5",
        "name": "Раф",
        "sizes": [
          {
            "label": "0,3 л",
            "price": 1690
          },
          {
            "label": "0,4 л",
            "price": 2090
          }
        ],
        "image": "latte",
        "badge": null,
        "description": "Вкусы: пломбир, апельсиновый сахар, дыня, вишня, банан, ананас, нуга-шоколад, малина, булочка с корицей.",
        "isDrink": true
      },
      {
        "id": "hot6",
        "name": "Горячий шоколад",
        "sizes": [
          {
            "label": "0,3 л",
            "price": 1090
          },
          {
            "label": "0,4 л",
            "price": 1590
          }
        ],
        "image": "cocoa",
        "badge": "hit",
        "description": "",
        "isDrink": true
      },
      {
        "id": "hot7",
        "name": "Matcha latte",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1390
          }
        ],
        "image": "latte",
        "badge": null,
        "description": "",
        "isDrink": true
      }
    ]
  },
  {
    "id": "ice",
    "name": "Холодный кофе",
    "products": [
      {
        "id": "ice0",
        "name": "ICE Американо",
        "sizes": [
          {
            "label": "0,3 л",
            "price": 890
          }
        ],
        "image": "icecoffee",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "ice1",
        "name": "ICE Капучино",
        "sizes": [
          {
            "label": "0,3 л",
            "price": 1390
          }
        ],
        "image": "icecoffee",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "ice2",
        "name": "ICE Латте",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1390
          }
        ],
        "image": "icecoffee",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "ice3",
        "name": "Bumble",
        "sizes": [
          {
            "label": "0,3 л",
            "price": 1490
          }
        ],
        "image": "bumble",
        "badge": "hit",
        "description": "",
        "isDrink": true
      },
      {
        "id": "ice4",
        "name": "Эспрессо-тоник",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1990
          }
        ],
        "image": "icecoffee",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "ice5",
        "name": "ICE Какао",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1690
          }
        ],
        "image": "icecoffee",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "ice6",
        "name": "ICE Matcha latte",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1390
          }
        ],
        "image": "icecoffee",
        "badge": null,
        "description": "",
        "isDrink": true
      }
    ]
  },
  {
    "id": "cold",
    "name": "Авторские напитки",
    "products": [
      {
        "id": "cold0",
        "name": "Убе тоник вишня",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1890
          }
        ],
        "image": "bumble",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold1",
        "name": "Matcha тоник грейпфрут",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1890
          }
        ],
        "image": "bumble",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold2",
        "name": "Coconut Matcha Cloud",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 2490
          }
        ],
        "image": "icecoffee",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold3",
        "name": "Лимонад облепиховый",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold4",
        "name": "Лимонад мохито",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold5",
        "name": "Лимонад мохито клубничный",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold6",
        "name": "Лимонад малина-барбарис",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": "hit",
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold7",
        "name": "Лимонад манго-маракуя",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold8",
        "name": "Лимонад ананас-банан",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold9",
        "name": "Лимонад щавель-ананас",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold10",
        "name": "Лимонад клубника-грейпфрут",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1590
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "bumble",
        "badge": "new",
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold11",
        "name": "Молочный коктейль · классика",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1990
          }
        ],
        "image": "icecoffee",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "cold12",
        "name": "Молочный коктейль · фирменный",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 2190
          }
        ],
        "image": "icecoffee",
        "badge": null,
        "description": "Вкусы: банан, шоколад или малина.",
        "isDrink": true
      }
    ]
  },
  {
    "id": "tea",
    "name": "Чаи",
    "products": [
      {
        "id": "tea0",
        "name": "Ташкентский",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 890
          },
          {
            "label": "1 л",
            "price": 1690
          }
        ],
        "image": "tea",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea1",
        "name": "Облепиха",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 890
          },
          {
            "label": "1 л",
            "price": 1690
          }
        ],
        "image": "cherry",
        "badge": "hit",
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea2",
        "name": "Солнечный",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 890
          },
          {
            "label": "1 л",
            "price": 1690
          }
        ],
        "image": "cherry",
        "badge": "hit",
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea3",
        "name": "Смородина",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 890
          },
          {
            "label": "1 л",
            "price": 1690
          }
        ],
        "image": "cherry",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea4",
        "name": "Малина",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 890
          },
          {
            "label": "1 л",
            "price": 1690
          }
        ],
        "image": "cherry",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea5",
        "name": "Малина-барбарис",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 890
          },
          {
            "label": "1 л",
            "price": 1690
          }
        ],
        "image": "cherry",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea6",
        "name": "Глинтвейн",
        "sizes": [
          {
            "label": "0,4 л",
            "price": 1090
          },
          {
            "label": "1 л",
            "price": 1990
          }
        ],
        "image": "cherry",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea7",
        "name": "Карак чай",
        "sizes": [
          {
            "label": "0,3 л",
            "price": 1190
          },
          {
            "label": "1 л",
            "price": 2990
          }
        ],
        "image": "tea",
        "badge": null,
        "description": "",
        "isDrink": true
      },
      {
        "id": "tea8",
        "name": "Чай чёрный / зелёный",
        "sizes": [
          {
            "label": "0,3 л",
            "price": 450
          },
          {
            "label": "1 л",
            "price": 990
          }
        ],
        "image": "tea",
        "badge": null,
        "description": "",
        "isDrink": true
      }
    ]
  },
  {
    "id": "dess",
    "name": "Десерты",
    "products": [
      {
        "id": "dess0",
        "name": "Медовик",
        "sizes": [
          {
            "label": "порция",
            "price": 1690
          }
        ],
        "image": "honey",
        "badge": "hit",
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess1",
        "name": "Наполеон",
        "sizes": [
          {
            "label": "порция",
            "price": 1890
          }
        ],
        "image": "honey",
        "badge": "new",
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess2",
        "name": "Павлова",
        "sizes": [
          {
            "label": "порция",
            "price": 1590
          }
        ],
        "image": "brulee",
        "badge": "new",
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess3",
        "name": "Чизкейк классический",
        "sizes": [
          {
            "label": "порция",
            "price": 1890
          }
        ],
        "image": "berry",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess4",
        "name": "Чизкейк фисташковый",
        "sizes": [
          {
            "label": "порция",
            "price": 1890
          }
        ],
        "image": "berry",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess5",
        "name": "Чизкейк солёная карамель",
        "sizes": [
          {
            "label": "порция",
            "price": 1890
          }
        ],
        "image": "choc",
        "badge": "hit",
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess6",
        "name": "Чизкейк баскский",
        "sizes": [
          {
            "label": "порция",
            "price": 2190
          }
        ],
        "image": "choc",
        "badge": "new",
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess7",
        "name": "Макаронс",
        "sizes": [
          {
            "label": "шт",
            "price": 790
          }
        ],
        "image": "brulee",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "dess8",
        "name": "Орешки: малина / фундук / рафаэлло",
        "sizes": [
          {
            "label": "порция",
            "price": 890
          }
        ],
        "image": "berry",
        "badge": "new",
        "description": "",
        "isDrink": false
      }
    ]
  },
  {
    "id": "bake",
    "name": "Выпечка",
    "products": [
      {
        "id": "bake0",
        "name": "Круассан классический",
        "sizes": [
          {
            "label": "шт",
            "price": 590
          }
        ],
        "image": "croissant",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake1",
        "name": "Круассан миндальный",
        "sizes": [
          {
            "label": "шт",
            "price": 1090
          }
        ],
        "image": "croissant",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake2",
        "name": "Круассан нутелла-банан",
        "sizes": [
          {
            "label": "шт",
            "price": 1090
          }
        ],
        "image": "croiss2",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake3",
        "name": "Круассан со сгущёнкой",
        "sizes": [
          {
            "label": "шт",
            "price": 1090
          }
        ],
        "image": "croissant",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake4",
        "name": "Круассан синнабон",
        "sizes": [
          {
            "label": "шт",
            "price": 1190
          }
        ],
        "image": "croiss2",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake5",
        "name": "Круассан фисташковый",
        "sizes": [
          {
            "label": "шт",
            "price": 1290
          }
        ],
        "image": "croiss2",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake6",
        "name": "Круассан OREO",
        "sizes": [
          {
            "label": "шт",
            "price": 1290
          }
        ],
        "image": "croiss2",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake7",
        "name": "Круассан клубника со сливками",
        "sizes": [
          {
            "label": "шт",
            "price": 1290
          }
        ],
        "image": "croiss2",
        "badge": null,
        "description": "Комбо: 4 круассана со скидкой 10%.",
        "isDrink": false
      },
      {
        "id": "bake8",
        "name": "Булочка с маком",
        "sizes": [
          {
            "label": "шт",
            "price": 690
          }
        ],
        "image": "bun",
        "badge": "hit",
        "description": "Комбо: 3 булочки со скидкой 10%.",
        "isDrink": false
      },
      {
        "id": "bake9",
        "name": "Булочка с курицей",
        "sizes": [
          {
            "label": "шт",
            "price": 690
          }
        ],
        "image": "bun",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake10",
        "name": "Синнабон классика",
        "sizes": [
          {
            "label": "шт",
            "price": 790
          }
        ],
        "image": "bun",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "bake11",
        "name": "Синнабон карамель",
        "sizes": [
          {
            "label": "шт",
            "price": 790
          }
        ],
        "image": "bun",
        "badge": null,
        "description": "",
        "isDrink": false
      }
    ]
  },
  {
    "id": "kids",
    "name": "Детское меню",
    "products": [
      {
        "id": "kids0",
        "name": "Детский бокс",
        "sizes": [
          {
            "label": "бокс",
            "price": 2690
          }
        ],
        "image": "kids",
        "badge": "hit",
        "description": "Бургер, картошка фри, наггетсы и напиток в яркой коробке.",
        "isDrink": false
      },
      {
        "id": "kids1",
        "name": "Бургер детский куриный",
        "sizes": [
          {
            "label": "порция",
            "price": 1490
          }
        ],
        "image": "kids",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "kids2",
        "name": "Наггетсы",
        "sizes": [
          {
            "label": "порция",
            "price": 1690
          }
        ],
        "image": "kids",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "kids3",
        "name": "Пельмешки разноцветные",
        "sizes": [
          {
            "label": "порция",
            "price": 1290
          }
        ],
        "image": "kids",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "kids4",
        "name": "Куриная котлета с пюре",
        "sizes": [
          {
            "label": "порция",
            "price": 1590
          }
        ],
        "image": "kids",
        "badge": null,
        "description": "",
        "isDrink": false
      },
      {
        "id": "kids5",
        "name": "Супчик куриный",
        "sizes": [
          {
            "label": "порция",
            "price": 990
          }
        ],
        "image": "kids",
        "badge": null,
        "description": "",
        "isDrink": false
      }
    ]
  }
];
MENU_CATEGORIES.forEach((category) => {
  category.products.forEach((product) => {
    product.categoryId = category.id;
    product.categoryName = category.name;
  });
});

const ALL_PRODUCTS = MENU_CATEGORIES.flatMap((category) => category.products);
const SYRUPS = [
  "Карамель",
  "Солёная карамель",
  "Шоколад",
  "Кокос",
  "Ваниль",
  "Лесной орех",
  "Айриш",
  "Амаретто"
];
const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const CHAIN_PHONE = { tel: '+77054934183', label: '+7 705 493 41 83' };
const everyDay = (hours) => DAY_NAMES.map(() => hours);

const LOCATIONS = [
  {
    title: 'ул. Торайгырова, 36',
    note: '1 этаж',
    address: 'Павлодар, ул. Торайгырова, 36 (1 этаж)',
    landmark: '',
    hours: 'Пн — Вс · 08:00–23:00',
    week: everyDay('08:00 – 23:00'),
    phone: { tel: '+77475767985', label: '+7 (747) 576-79-85' },
    image: 'in1',
    coords: null,
    mapUrl: 'https://2gis.kz/pavlodar/search/' + encodeURIComponent('Торайгырова 36 Кофейня N5')
  },
  {
    title: 'ул. Сатпаева, 21',
    note: '',
    address: 'Павлодар, ул. Сатпаева, 21',
    landmark: '',
    hours: 'Ежедневно · 08:00–21:00',
    week: everyDay('08:00 – 21:00'),
    image: 'loc_satp21',
    mapUrl: 'https://2gis.kz/pavlodar/search/' + encodeURIComponent('Пекарня N5 Сатпаева 21')
  },
  {
    title: 'ул. Назарбаева, 52',
    note: '',
    address: 'Павлодар, ул. Назарбаева, 52',
    landmark: '',
    hours: 'Ежедневно · 08:00–21:00',
    week: everyDay('08:00 – 21:00'),
    image: 'loc_nazar',
    mapUrl: 'https://2gis.kz/pavlodar/search/' + encodeURIComponent('Пекарня N5 Назарбаева 52')
  },
  {
    title: 'Батыр Молл',
    geoQuery: 'Батыр Молл, Павлодар',
    note: 'ул. Торайгырова, 58',
    address: 'Павлодар, ул. Торайгырова, 58',
    landmark: 'ТРЦ «Батыр Молл»',
    hours: 'Ежедневно · 10:00–22:00',
    week: everyDay('10:00 – 22:00'),
    image: 'loc_batyr',
    mapUrl: 'https://2gis.kz/pavlodar/search/' + encodeURIComponent('Батыр Молл Торайгырова 58')
  },
  {
    title: 'Павильон на набережной',
    geoQuery: 'улица Астана 100/4, Павлодар',
    note: 'ул. Астана, 100/4, киоск',
    address: 'Павлодар, ул. Астана, 100/4 (киоск)',
    landmark: 'Набережная, отдельный павильон',
    hours: 'Пн–Чт 09:00–22:00 · Пт–Вс 09:00–00:00',
    week: ['09:00 – 22:00', '09:00 – 22:00', '09:00 – 22:00', '09:00 – 22:00', '09:00 – 00:00', '09:00 – 00:00', '09:00 – 00:00'],
    image: 'loc_astana',
    mapUrl: 'https://2gis.kz/pavlodar/geo/70030076544816078'
  }
];

const PROMOTIONS = [
  {
    "id": "p1",
    "accent": "#e4b055",
    "badge": "−10%",
    "title": "Комбо 3 булочки",
    "subtitle": "любые 3 булочки с витрины",
    "image": "bun",
    "details": "Выбирайте любые 3 булочки с витрины и получайте скидку 10%.",
    "actionLabel": "Выбрать булочки",
    "route": "/menu/bake"
  },
  {
    "id": "p2",
    "accent": "#2fd29a",
    "badge": "−10%",
    "title": "Комбо 4 круассана",
    "subtitle": "от 4 штук",
    "image": "croiss2",
    "details": "Все виды круассанов с витрины со скидкой 10% при покупке от 4 штук.",
    "actionLabel": "Выбрать круассаны",
    "route": "/menu/bake"
  },
  {
    "id": "p3",
    "accent": "#ff8a3d",
    "badge": "−30%",
    "title": "Выпечка после 20:00",
    "subtitle": "ежедневно",
    "image": "croissant",
    "details": "Скидка 30% на всю свежую выпечку ежедневно после 20:00.",
    "actionLabel": "Смотреть выпечку",
    "route": "/menu/bake"
  },
  {
    "id": "p4",
    "accent": "#7ab7ff",
    "badge": "BOX",
    "title": "Детский бокс",
    "subtitle": "фри, бургер, наггетсы",
    "image": "kids",
    "details": "Вкусный сет для детей: хрустящая картошка фри, сочный бургер и наггетсы.",
    "actionLabel": "Заказать бокс",
    "route": "/product/kids0"
  }
];

const HOME_VIDEOS = [
  { source: 'video-main', title: 'Наша кофейня' },
  { source: 'video-menu', title: 'Напитки и десерты' },
  { source: 'video-qr', title: 'Как мы работаем' }
];
