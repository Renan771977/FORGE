let isLoggedIn = false;
let userName = 'Renan';

// =========================================================
// 1. BANCO DE DADOS CENTRAL - 31 MÁQUINAS FORGE
// =========================================================
// =========================================================
// 1. BANCO DE DADOS CENTRAL - 31 MÁQUINAS FORGE
// =========================================================
const BANCO_DE_HARDWARE = {
  // --- LINHA OFFICE E DESENVOLVIMENTO (5) ---
  'Office Pro': {
    name: 'FORGE Office Pro', price: 'R$ 3.100', badge: 'OFFICE', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Desempenho elevado para planilhas complexas, ERPs e multitarefas pesadas.',
    specs: { cpu: 'AMD Ryzen 5 5600G (6 Cores / 12 Threads)', gpu: 'Radeon Graphics (Integrada)', motherboard: 'B450M AM4', ram: '16GB (2x8GB) DDR4 3200MHz', storage: '1TB SSD NVMe Gen3', cooler: 'AMD Wraith Stealth', psu: '500W 80 Plus Bronze', cabinet: 'MicroATX Compact Black' },
    benchmarks: { cinebench: '11.500 pts', timespy: '1.500 pts', fps: 'N/A', temp: '52°C Estável' }
  },
  'Office Pro': {
    name: 'FORGE Office Pro', price: 'R$ 3.100', badge: 'OFFICE', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco1.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Desempenho elevado para planilhas complexas, ERPs e multitarefas pesadas.',
    specs: { cpu: 'AMD Ryzen 5 5600G (6 Cores / 12 Threads)', gpu: 'Radeon Graphics (Integrada)', motherboard: 'B450M AM4', ram: '16GB (2x8GB) DDR4 3200MHz', storage: '1TB SSD NVMe Gen3', cooler: 'AMD Wraith Stealth', psu: '500W 80 Plus Bronze', cabinet: 'MicroATX Compact Black' },
    benchmarks: { cinebench: '11.500 pts', timespy: '1.500 pts', fps: 'N/A', temp: '52°C Estável' }
  },
  'Office Ultra': {
    name: 'FORGE Office Ultra', price: 'R$ 3.800', badge: 'OFFICE WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco2.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'A máquina definitiva para escritórios de alto padrão. Resposta instantânea.',
    specs: { cpu: 'Intel Core i5-12400 (6 Cores / 12 Threads)', gpu: 'Intel UHD Graphics 730', motherboard: 'B660M LGA1700', ram: '16GB (2x8GB) DDR4 3200MHz', storage: '1TB SSD NVMe Gen4 (3.500 MB/s)', cooler: 'Deepcool AG400 White', psu: '500W 80 Plus Bronze', cabinet: 'Lian Li LANCOOL 205M White' },
    benchmarks: { cinebench: '12.400 pts', timespy: '1.100 pts', fps: 'N/A', temp: '50°C Estável' }
  },
  'Dev Alpha': {
    name: 'FORGE Dev Alpha', price: 'R$ 4.500', badge: 'DEV ENTRY', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco3.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Programação fluida, VMs leves e compilação ágil para desenvolvedores.',
    specs: { cpu: 'AMD Ryzen 7 5700G (8 Cores / 16 Threads)', gpu: 'Radeon Graphics (Integrada)', motherboard: 'B550M AORUS Elite', ram: '32GB (2x16GB) DDR4 3200MHz', storage: '1TB SSD NVMe Gen4', cooler: 'Deepcool AK400 Zero Dark', psu: '600W 80 Plus Bronze', cabinet: 'Montech Air 100 Lite Black' },
    benchmarks: { cinebench: '14.800 pts', timespy: '1.800 pts', fps: 'N/A', temp: '58°C Estável' }
  },
  'Dev Beta': {
    name: 'FORGE Dev Beta', price: 'R$ 5.200', badge: 'DEV PRO', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco4.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Docker, Kubernetes e múltiplas instâncias rodando com total fluidez em 32GB.',
    specs: { cpu: 'Intel Core i5-13400 (10 Cores / 16 Threads)', gpu: 'Intel UHD Graphics 730', motherboard: 'B760M AORUS', ram: '32GB (2x16GB) DDR5 5200MHz', storage: '1TB SSD NVMe Gen4 (5.000 MB/s)', cooler: 'Water Cooler 240mm Rise Mode', psu: '650W 80 Plus Bronze', cabinet: 'NZXT H5 Flow Black' },
    benchmarks: { cinebench: '16.200 pts', timespy: '1.200 pts', fps: 'N/A', temp: '55°C Estável' }
  },

  // --- LINHA GAMING DE ENTRADA E INTERMEDIÁRIA (12) ---
  'G-1 Nexus': {
    name: 'FORGE G-1: Nexus', price: 'R$ 4.900', badge: 'GAMING ENTRY', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco5.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'A porta de entrada para o mundo gamer com excelente custo-benefício em 1080p.',
    specs: { cpu: 'Intel Core i3-12100F (4 Cores / 8 Threads)', gpu: 'AMD Radeon RX 6600 8GB GDDR6', motherboard: 'H610M LGA1700', ram: '16GB (2x8GB) DDR4 3200MHz', storage: '500GB SSD NVMe Gen3', cooler: 'Intel Stock Cooler', psu: '500W 80 Plus Bronze', cabinet: 'Pichau Apus Black' },
    benchmarks: { cinebench: '8.400 pts', timespy: '8.100 pts', fps: '160 FPS (Médio)', temp: '64°C Estável' }
  },
  'G-2 Spectre': {
    name: 'FORGE G-2: Spectre', price: 'R$ 5.400', badge: 'GAMING WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco6.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Design All-White com RTX 3060 para jogar e fazer streaming com folga.',
    specs: { cpu: 'AMD Ryzen 5 5600 (6 Cores / 12 Threads)', gpu: 'NVIDIA GeForce RTX 3060 12GB White', motherboard: 'B550M AORUS Elite', ram: '16GB (2x8GB) DDR4 3200MHz White', storage: '1TB SSD NVMe Gen3', cooler: 'Deepcool AG400 ARGB White', psu: '600W 80 Plus Bronze', cabinet: 'Montech Air 100 White' },
    benchmarks: { cinebench: '10.800 pts', timespy: '8.900 pts', fps: '180 FPS (Alto)', temp: '62°C Estável' }
  },
  'G-3 Stealth': {
    name: 'FORGE G-3: Stealth', price: 'R$ 5.900', badge: 'GAMING DLSS 3', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco7.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Poder da nova geração RTX 40. Mais quadros, menos consumo de energia.',
    specs: { cpu: 'Intel Core i5-12400F (6 Cores / 12 Threads)', gpu: 'NVIDIA GeForce RTX 4060 8GB GDDR6', motherboard: 'B660M', ram: '16GB (2x8GB) DDR4 3200MHz', storage: '1TB SSD NVMe Gen4', cooler: 'Deepcool AK400', psu: '600W 80 Plus Bronze', cabinet: 'NZXT H5 Flow Black' },
    benchmarks: { cinebench: '12.400 pts', timespy: '10.500 pts', fps: '220 FPS (Alto)', temp: '60°C Estável' }
  },
  'G-4 Lunar': {
    name: 'FORGE G-4: Lunar', price: 'R$ 6.300', badge: 'GAMING WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco8.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'O combo perfeito entre Ryzen 5 e RTX 4060 em uma montagem impecável branca.',
    specs: { cpu: 'AMD Ryzen 5 5600X (6 Cores / 12 Threads)', gpu: 'NVIDIA GeForce RTX 4060 8GB White', motherboard: 'B550M AORUS', ram: '16GB (2x8GB) DDR4 3600MHz White', storage: '1TB SSD NVMe Gen4', cooler: 'Water Cooler 240mm White', psu: '650W 80 Plus Bronze', cabinet: 'Lian Li 205M White' },
    benchmarks: { cinebench: '11.200 pts', timespy: '10.800 pts', fps: '240 FPS (Alto)', temp: '58°C Estável' }
  },
  'G-5 Eclipse': {
    name: 'FORGE G-5: Eclipse', price: 'R$ 6.800', badge: 'GAMING', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco9.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Alta taxa de quadros e suporte a PCI Express 4.0 para os jogos mais pesados.',
    specs: { cpu: 'Intel Core i5-13400F (10 Cores / 16 Threads)', gpu: 'AMD Radeon RX 7600 8GB GDDR6', motherboard: 'B760M DDR5', ram: '16GB (2x8GB) DDR5 5200MHz', storage: '1TB SSD NVMe Gen4', cooler: 'Deepcool AK400 Dark', psu: '650W 80 Plus Bronze', cabinet: 'Corsair 4000D Airflow' },
    benchmarks: { cinebench: '16.100 pts', timespy: '11.200 pts', fps: '250 FPS (Alto)', temp: '63°C Estável' }
  },
  'G-6 Phantom': {
    name: 'FORGE G-6: Phantom', price: 'R$ 7.400', badge: 'GAMING PRO', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco10.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Arquitetura AM5 e memória DDR5 garantem a longevidade do seu setup gamer.',
    specs: { cpu: 'AMD Ryzen 5 7600 (6 Cores / 12 Threads)', gpu: 'NVIDIA GeForce RTX 4060 Ti 8GB', motherboard: 'B650M AM5', ram: '32GB (2x16GB) DDR5 6000MHz', storage: '1TB SSD NVMe Gen4 (5.000 MB/s)', cooler: 'Water Cooler 240mm', psu: '650W 80 Plus Bronze', cabinet: 'NZXT H5 Flow Matte Black' },
    benchmarks: { cinebench: '14.500 pts', timespy: '13.800 pts', fps: '280 FPS (Ultra)', temp: '61°C Estável' }
  },
  'G-7 Frost': {
    name: 'FORGE G-7: Frost', price: 'R$ 7.900', badge: 'GAMING WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco11.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Nosso best-seller. All-White, silencioso e projetado para 1440p sem engasgos.',
    specs: { cpu: 'Intel Core i5-13400F (10 Cores / 16 Threads)', gpu: 'NVIDIA GeForce RTX 4060 Ti 8GB White', motherboard: 'B760M AORUS White', ram: '32GB (2x16GB) DDR5 6000MHz White', storage: '1TB SSD NVMe Gen4', cooler: 'Water Cooler 240mm Deepcool WH', psu: '750W 80 Plus Gold White', cabinet: 'Lian Li O11 Dynamic Mini Snow' },
    benchmarks: { cinebench: '16.100 pts', timespy: '13.900 pts', fps: '290 FPS (Ultra)', temp: '59°C Estável' }
  },
  'G-8 Venom': {
    name: 'FORGE G-8: Venom', price: 'R$ 8.500', badge: 'GAMING X3D', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco12.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Tecnologia 3D V-Cache para eliminar gargalos de CPU e cravar FPS competitivo.',
    specs: { cpu: 'AMD Ryzen 7 5700X3D (8 Cores / 16 Threads)', gpu: 'AMD Radeon RX 7700 XT 12GB', motherboard: 'B550M AORUS Elite V2', ram: '32GB (2x16GB) DDR4 3600MHz', storage: '1TB SSD NVMe Gen4 (7.300 MB/s)', cooler: 'Water Cooler 240mm', psu: '750W 80 Plus Gold', cabinet: 'Corsair 4000D Airflow Black' },
    benchmarks: { cinebench: '14.200 pts', timespy: '16.500 pts', fps: '350 FPS (Competitivo)', temp: '64°C Estável' }
  },
  'G-9 Aurora': {
    name: 'FORGE G-9: Aurora', price: 'R$ 9.100', badge: 'GAMING WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco13.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Desempenho colossal com RTX 4070 em uma vitrine de vidro temperado branco.',
    specs: { cpu: 'Intel Core i5-13600KF (14 Cores / 20 Threads)', gpu: 'NVIDIA GeForce RTX 4070 12GB White', motherboard: 'B760-A ASUS ROG Strix White', ram: '32GB (2x16GB) DDR5 6000MHz RGB', storage: '1TB SSD NVMe Gen4', cooler: 'Water Cooler 360mm White', psu: '850W 80 Plus Gold White', cabinet: 'NZXT H9 Flow White' },
    benchmarks: { cinebench: '23.800 pts', timespy: '17.800 pts', fps: '320 FPS (Ultra)', temp: '62°C Estável' }
  },
  'G-10 Shadow': {
    name: 'FORGE G-10: Shadow', price: 'R$ 9.600', badge: 'GAMING PRO', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco14.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Plataforma AM5 topo de linha combinada com a eficiência térmica da RTX 4070.',
    specs: { cpu: 'AMD Ryzen 5 7600X (6 Cores / 12 Threads)', gpu: 'NVIDIA GeForce RTX 4070 12GB GDDR6X', motherboard: 'B650E AORUS Master', ram: '32GB (2x16GB) DDR5 6000MHz', storage: '2TB SSD NVMe Gen4 (7.300 MB/s)', cooler: 'Water Cooler 240mm Dark', psu: '850W 80 Plus Gold Modular', cabinet: 'Lian Li Lancool 216 Black' },
    benchmarks: { cinebench: '15.200 pts', timespy: '17.900 pts', fps: '320 FPS (Ultra)', temp: '60°C Estável' }
  },
  'G-11 Nebula': {
    name: 'FORGE G-11: Nebula', price: 'R$ 10.200', badge: 'GAMING SUPER', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco15.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'A versão SUPER da RTX 4070 garante longevidade para jogar os futuros lançamentos AAA em 4K.',
    specs: { cpu: 'Intel Core i5-14600KF (14 Cores / 20 Threads)', gpu: 'NVIDIA GeForce RTX 4070 SUPER 12GB', motherboard: 'Z790M AORUS Elite', ram: '32GB (2x16GB) DDR5 6400MHz', storage: '2TB SSD NVMe Gen4', cooler: 'Water Cooler 360mm Deepcool', psu: '850W 80 Plus Gold ATX 3.0', cabinet: 'Corsair 4000D Black' },
    benchmarks: { cinebench: '24.500 pts', timespy: '20.500 pts', fps: '380 FPS (Competitivo)', temp: '65°C Estável' }
  },
  'G-12 Blizzard': {
    name: 'FORGE G-12: Blizzard', price: 'R$ 10.900', badge: 'GAMING WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco16.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Estética impecável e performance térmica absurda com a arquitetura Zen 4 da AMD.',
    specs: { cpu: 'AMD Ryzen 7 7700X (8 Cores / 16 Threads)', gpu: 'NVIDIA GeForce RTX 4070 SUPER 12GB White', motherboard: 'X670E AORUS Pro X White', ram: '32GB (2x16GB) DDR5 6000MHz White', storage: '2TB SSD NVMe Gen4', cooler: 'Water Cooler 360mm Lian Li WH', psu: '850W 80 Plus Gold White', cabinet: 'NZXT H9 Elite White' },
    benchmarks: { cinebench: '19.800 pts', timespy: '20.800 pts', fps: '390 FPS (Competitivo)', temp: '63°C Estável' }
  },

  // --- LINHA GAMING HIGH-END (5) ---
  'G-13 Vengeance': {
    name: 'FORGE G-13: Vengeance', price: 'R$ 11.600', badge: 'HIGH-END', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco17.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Força bruta pura. O melhor processador gamer do mundo aliado aos 16GB de VRAM da AMD.',
    specs: { cpu: 'AMD Ryzen 7 7800X3D (8 Cores / 16 Threads)', gpu: 'AMD Radeon RX 7800 XT 16GB GDDR6', motherboard: 'B650E ROG Strix Gaming WiFi', ram: '32GB (2x16GB) DDR5 6000MHz', storage: '2TB SSD NVMe Gen4 Kingston Renegade', cooler: 'Water Cooler 360mm Arctic', psu: '850W 80 Plus Gold ATX 3.0', cabinet: 'Lian Li O11 Dynamic EVO Black' },
    benchmarks: { cinebench: '18.200 pts', timespy: '19.500 pts', fps: '450 FPS (Competitivo)', temp: '68°C Estável' }
  },
  'G-14 Valkyrie': {
    name: 'FORGE G-14: Valkyrie', price: 'R$ 13.200', badge: 'HIGH-END WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco18.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Um monstro vestido de branco. Jogue qualquer coisa em 4K no Ultra com DLSS 3 e Ray Tracing.',
    specs: { cpu: 'Intel Core i7-14700KF (20 Cores / 28 Threads)', gpu: 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB WH', motherboard: 'Z790-A ROG Strix White', ram: '64GB (2x32GB) DDR5 6000MHz RGB WH', storage: '2TB SSD NVMe Gen4 (7.300 MB/s)', cooler: 'Water Cooler 360mm Corsair White', psu: '1000W 80 Plus Gold White', cabinet: 'Lian Li O11 Dynamic EVO White' },
    benchmarks: { cinebench: '34.500 pts', timespy: '24.800 pts', fps: '410 FPS (Ultra)', temp: '70°C Estável' }
  },
  'G-15 Obsidian': {
    name: 'FORGE G-15: Obsidian', price: 'R$ 13.900', badge: 'HIGH-END', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco19.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'O auge da eficiência e performance em jogos competitivos. O 7800X3D é imbatível.',
    specs: { cpu: 'AMD Ryzen 7 7800X3D (8 Cores / 16 Threads)', gpu: 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB', motherboard: 'X670E AORUS Master', ram: '64GB (2x32GB) DDR5 6000MHz CL30', storage: '2TB SSD NVMe Gen4 Samsung 990 Pro', cooler: 'Custom Loop Liquid Cooling 360mm', psu: '1000W 80 Plus Gold ATX 3.0', cabinet: 'NZXT H9 Flow Matte Black' },
    benchmarks: { cinebench: '18.400 pts', timespy: '25.100 pts', fps: '520 FPS (Competitivo)', temp: '64°C Estável' }
  },
  'G-16 Apex': {
    name: 'FORGE G-16: Apex', price: 'R$ 14.800', badge: 'HIGH-END', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco20.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Poder computacional agressivo com 20GB de VRAM. Ideal para resoluções Ultrawide e 4K.',
    specs: { cpu: 'AMD Ryzen 9 7900X (12 Cores / 24 Threads)', gpu: 'AMD Radeon RX 7900 XT 20GB GDDR6', motherboard: 'X670E ROG Crosshair Hero', ram: '64GB (2x32GB) DDR5 6000MHz', storage: '2TB SSD NVMe Gen4 WD Black SN850X', cooler: 'Water Cooler 360mm ROG Ryujin', psu: '1000W 80 Plus Platinum', cabinet: 'Corsair 5000D Airflow' },
    benchmarks: { cinebench: '29.100 pts', timespy: '26.500 pts', fps: '480 FPS (Ultra)', temp: '72°C Estável' }
  },
  'G-17 Supernova': {
    name: 'FORGE G-17: Supernova', price: 'R$ 16.500', badge: 'ULTRA WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco21.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Não existem limites para a RTX 4080 SUPER. Desempenho definitivo sem abrir mão do silêncio.',
    specs: { cpu: 'Intel Core i7-14700K (20 Cores / 28 Threads)', gpu: 'NVIDIA GeForce RTX 4080 SUPER 16GB White', motherboard: 'Z790 AORUS Pro X White', ram: '64GB (2x32GB) DDR5 6400MHz White', storage: '4TB (2x2TB) SSD NVMe Gen4', cooler: 'Water Cooler 360mm Lian Li Galahad WH', psu: '1000W 80 Plus Gold PCIe 5.0 WH', cabinet: 'NZXT H9 Elite Dual-Chamber WH' },
    benchmarks: { cinebench: '35.100 pts', timespy: '28.900 pts', fps: '550 FPS (Ultra)', temp: '69°C Estável' }
  },

  // --- LINHA WORKSTATION E CRIAÇÃO (5) ---
  'W-1 Creator': {
    name: 'FORGE W-1: Creator', price: 'R$ 11.500', badge: 'WORKSTATION', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco22.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Edição de vídeo em 4K, After Effects fluído e 16GB de VRAM dedicados aos seus renders.',
    specs: { cpu: 'Intel Core i7-13700K (16 Cores / 24 Threads)', gpu: 'NVIDIA GeForce RTX 4060 Ti 16GB VRAM', motherboard: 'Z790M Pro RS', ram: '64GB (2x32GB) DDR5 5600MHz', storage: '2TB SSD NVMe Gen4 + 4TB HDD WD Red', cooler: 'Water Cooler 360mm', psu: '850W 80 Plus Gold', cabinet: 'Fractal Design Meshify 2 Black' },
    benchmarks: { cinebench: '30.200 pts', timespy: '14.100 pts', fps: 'N/A', temp: '66°C Estável' }
  },
  'W-2 Studio': {
    name: 'FORGE W-2: Studio', price: 'R$ 14.500', badge: 'WORKSTATION', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco23.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Produtividade massiva com 12 núcleos físicos e aceleração via CUDA cores pesados.',
    specs: { cpu: 'AMD Ryzen 9 7900X (12 Cores / 24 Threads)', gpu: 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB', motherboard: 'X670E ProArt Creator WiFi', ram: '64GB (2x32GB) DDR5 6000MHz', storage: '2TB SSD NVMe Gen4 (7.300 MB/s)', cooler: 'Water Cooler 360mm', psu: '1000W 80 Plus Gold', cabinet: 'ASUS ProArt PA602' },
    benchmarks: { cinebench: '29.500 pts', timespy: '24.900 pts', fps: 'N/A', temp: '70°C Estável' }
  },
  'W-3 Director': {
    name: 'FORGE W-3: Director', price: 'R$ 18.500', badge: 'WORKSTATION PRO', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco24.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Cinema 4D, Blender e Unreal Engine não são desafios para esta máquina.',
    specs: { cpu: 'Intel Core i9-14900K (24 Cores / 32 Threads)', gpu: 'NVIDIA GeForce RTX 4080 SUPER 16GB', motherboard: 'Z790 ProArt Creator WiFi', ram: '64GB (2x32GB) DDR5 6400MHz', storage: '4TB SSD NVMe Gen4 Samsung 990 Pro', cooler: 'Water Cooler 360mm Push-Pull', psu: '1200W 80 Plus Platinum', cabinet: 'Fractal Design Define 7 XL' },
    benchmarks: { cinebench: '39.800 pts', timespy: '28.900 pts', fps: 'N/A', temp: '75°C Estável' }
  },
  'W-4 Visionary': {
    name: 'FORGE W-4: Visionary', price: 'R$ 19.800', badge: 'WORKSTATION WHITE', renderClass: 'chassis-silhouette white',
    img: '../img/pc-branco25.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Incríveis 96GB de RAM e poder máximo multicore em uma estrutura all-white silenciosa.',
    specs: { cpu: 'AMD Ryzen 9 7950X (16 Cores / 32 Threads)', gpu: 'AMD Radeon RX 7900 XTX 24GB White', motherboard: 'X670E AORUS Pro X White', ram: '96GB (2x48GB) DDR5 5600MHz', storage: '4TB SSD NVMe Gen4', cooler: 'Water Cooler 360mm Lian Li WH', psu: '1200W 80 Plus Platinum White', cabinet: 'Lian Li O11 Dynamic EVO XL White' },
    benchmarks: { cinebench: '38.500 pts', timespy: '29.200 pts', fps: 'N/A', temp: '72°C Estável' }
  },
  'W-5 Render': {
    name: 'FORGE W-5: Render', price: 'R$ 22.500', badge: 'WORKSTATION EXTREME', renderClass: 'chassis-silhouette black',
    img: '../img/pc-branco26.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Exportações em segundos. A RTX 4090 destrói tempos de renderização locais.',
    specs: { cpu: 'Intel Core i7-14700K (20 Cores / 28 Threads)', gpu: 'NVIDIA GeForce RTX 4090 24GB GDDR6X', motherboard: 'Z790 ROG Maximus Hero', ram: '64GB (2x32GB) DDR5 6400MHz', storage: '4TB (2x2TB) SSD NVMe Gen4', cooler: 'Custom Loop 360mm EKWB', psu: '1200W ATX 3.0 80 Plus Platinum', cabinet: 'Corsair Obsidian 1000D' },
    benchmarks: { cinebench: '35.400 pts', timespy: '36.500 pts', fps: 'N/A', temp: '68°C Estável' }
  },

  // --- LINHA TITAN EXTREME / IA (4) ---
  'Titan IA-Core': {
    name: 'FORGE Titan: IA-Core', price: 'R$ 25.000', badge: 'TITAN IA', renderClass: 'chassis-silhouette titan',
    img: '../img/pc-branco27.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Desenvolvida para treinamento de modelos de linguagem local e PyTorch.',
    specs: { cpu: 'AMD Ryzen 9 7950X3D (16 Cores / 32 Threads)', gpu: 'NVIDIA GeForce RTX 4090 24GB (Tensor Cores)', motherboard: 'X670E AORUS Master', ram: '128GB (4x32GB) DDR5 5600MHz', storage: '4TB SSD NVMe Gen5 Crucial T700', cooler: 'Water Cooler 420mm Arctic', psu: '1500W 80 Plus Titanium', cabinet: 'Phanteks Enthoo Pro 2' },
    benchmarks: { cinebench: '38.400 pts', timespy: '36.800 pts', fps: '999 FPS', temp: '69°C Sob Carga' }
  },
  'Titan DeepLearn': {
    name: 'FORGE Titan: DeepLearn', price: 'R$ 26.500', badge: 'TITAN IA WHITE', renderClass: 'chassis-silhouette titan',
    img: '../img/pc-branco28.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'Uma Workstation laboratorial limpa. Core i9 lidando com scripts pesados.',
    specs: { cpu: 'Intel Core i9-14900K (24 Cores / 32 Threads)', gpu: 'NVIDIA GeForce RTX 4090 24GB White Edition', motherboard: 'Z790 ROG Maximus Formula White', ram: '128GB (4x32GB) DDR5 5600MHz WH', storage: '4TB SSD NVMe Gen5', cooler: 'Water Cooler 360mm White', psu: '1500W 80 Plus Titanium WH', cabinet: 'Thermaltake Core P6 Snow' },
    benchmarks: { cinebench: '40.100 pts', timespy: '36.900 pts', fps: '999 FPS', temp: '76°C Sob Carga' }
  },
  'Titan Dual-GPU': {
    name: 'FORGE Titan: Dual-GPU', price: 'R$ 28.500', badge: 'TITAN DUAL', renderClass: 'chassis-silhouette titan',
    img: '../img/pc-branco29.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'O poder de duas GPUs somadas com pistas PCIe completas de um Threadripper.',
    specs: { cpu: 'AMD Ryzen Threadripper 7960X (24 Cores / 48 Threads)', gpu: '2x NVIDIA GeForce RTX 4080 SUPER 16GB (Total 32GB)', motherboard: 'TRX50 ASUS Pro WS', ram: '128GB ECC Registered DDR5', storage: '4TB SSD NVMe Gen5', cooler: 'Noctua NH-U14S TR5-SP6', psu: '1600W 80 Plus Titanium', cabinet: 'Fractal Design Meshify 2 XL' },
    benchmarks: { cinebench: '55.200 pts', timespy: 'Dual GPU Scale', fps: 'N/A', temp: '71°C Sob Carga' }
  },
  'Titan Omniverse': {
    name: 'FORGE Titan: Omniverse', price: 'R$ 30.000', badge: 'TITAN EXTREME', renderClass: 'chassis-silhouette titan',
    img: '../img/pc-branco30.png', // <-- COLOQUE A FOTO AQUI
    tagline: 'A máquina suprema do nosso catálogo. 192GB de RAM e armazenamento em Raid 0.',
    specs: { cpu: 'AMD Ryzen 9 7950X (16 Cores / 32 Threads)', gpu: 'NVIDIA GeForce RTX 4090 24GB ASUS ROG Strix', motherboard: 'X670E ROG Crosshair Extreme', ram: '192GB (4x48GB) DDR5 5200MHz', storage: '8TB (2x4TB) SSD NVMe Gen5 (Raid 0)', cooler: 'Custom Loop Dual 360mm', psu: '1600W 80 Plus Titanium ATX 3.0', cabinet: 'Cooler Master HAF 700 EVO' },
    benchmarks: { cinebench: '39.100 pts', timespy: '37.100 pts', fps: 'Sem Limites', temp: '62°C Liquid Cooled' }
  }
};

// =========================================================
// 2. INICIALIZAÇÃO DO SITE E GERAÇÃO DOS CARDS
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  showSection('hero');
  updateNav();
  carregarCards();
  montarSeletoresComparador();
  inicializarRastroMouse();
  inicializarScrollReveal();
  verificarSessaoExistente();
});

function carregarCards() {
  const container = document.getElementById('builds-container');
  if (!container) return;
  container.innerHTML = ''; // Limpa antes de injetar

  for (const [id, pc] of Object.entries(BANCO_DE_HARDWARE)) {
    // Define a Categoria para os Filtros funcionarem
    let uso = 'gaming';
    const badge = pc.badge.toLowerCase();
    if (badge.includes('office') || badge.includes('dev')) uso = 'office';
    else if (badge.includes('workstation') || badge.includes('titan') || badge.includes('ia')) uso = 'workstation';

    // Define Faixa de Preço para o Filtro
    let faixaPreco = 'mid';
    const valor = parseInt(pc.price.replace('R$', '').replace(/\./g, '').trim());
    if (valor <= 5000) faixaPreco = 'low';
    else if (valor > 12000) faixaPreco = 'high';

    const cor = pc.renderClass.includes('white') ? 'white' : 'black';

    // Abrevia as especificações (ex: "Intel Core i5-14600KF" -> "i5-14600KF")
    const shortGpu = pc.specs.gpu.split(' ').slice(0, 3).join(' ').replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '');
    const shortCpu = pc.specs.cpu.split(' ').slice(0, 3).join(' ').replace('Intel Core ', '');

    // Cria o código HTML do Card e injeta
    const card = document.createElement('div');
    card.className = 'build-card';
    card.setAttribute('data-usage', uso);
    card.setAttribute('data-color', cor);
    card.setAttribute('data-price', faixaPreco);
    card.onclick = () =>  abrirDetalhesProduto(id); 

    card.innerHTML = `
      <div class="build-card-img ${cor === 'white' ? 'white-pc' : 'black-pc'}">
        <span class="build-badge">${pc.badge}</span>
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" alt="${pc.name}">
      </div>
      <div class="build-card-body" style="display:flex; flex-direction:column; justify-content:space-between; height: 100%;">
        <div>
          <div class="build-meta-specs">${shortGpu} • ${shortCpu}</div>
          <div class="build-name">${pc.name}</div>
          <div class="build-tagline" style="margin-top: 8px;">${pc.tagline}</div>
        </div>
        <div class="build-price-row" style="margin-top: 16px;">
          <div class="build-price">${pc.price}</div>
          <button class="build-cta" onclick="solicitarVenda('${id}', event)">Comprar Agora</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  }
}


// =========================================================
// 3. PÁGINA TÉCNICA (SINGLE PAGE APPLICATION)
// =========================================================
function abrirDetalhesProduto(idMaquina) {
  const pc = BANCO_DE_HARDWARE[idMaquina];
  if (!pc) return;

  const container = document.getElementById('produto-container');
  if(!container) return;

  const mensagemWhatsapp = `Olá, gostaria de solicitar um orçamento para a build *${pc.name}* (${pc.badge}) no valor de ${pc.price}.`;
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=5531900000000&text=${encodeURIComponent(mensagemWhatsapp)}`;

  container.innerHTML = `
    <button class="btn-voltar" onclick="showSection('vendas')">← Voltar ao Catálogo</button>
    
    <div class="product-grid">
      
      <div class="blueprint-panel">
        <div class="blueprint-lines"></div>
        <img src="${pc.img}" class="pc-photo" style="width: 85%; height: 85%; object-fit: contain; z-index: 2; animation: float 4s ease-in-out infinite;" alt="${pc.name}">
        <div class="machine-badge">${pc.badge}</div>
      </div>
      
      <div class="specs-panel">
        <div>
          <h2 class="machine-title">${pc.name}</h2>
          <p class="machine-tagline">${pc.tagline}</p>
        </div>
        
        <div>
          <div class="section-subtitle">Especificações de Hardware</div>
          <div class="hardware-list">
            <div class="hardware-item"><div class="hardware-label">PROCESSADOR</div><div class="hardware-value">${pc.specs.cpu}</div></div>
            <div class="hardware-item"><div class="hardware-label">PLACA DE VÍDEO</div><div class="hardware-value">${pc.specs.gpu}</div></div>
            <div class="hardware-item"><div class="hardware-label">PLACA MÃE</div><div class="hardware-value">${pc.specs.motherboard}</div></div>
            <div class="hardware-item"><div class="hardware-label">MEMÓRIA RAM</div><div class="hardware-value">${pc.specs.ram}</div></div>
            <div class="hardware-item"><div class="hardware-label">ARMAZENAMENTO</div><div class="hardware-value">${pc.specs.storage}</div></div>
            <div class="hardware-item"><div class="hardware-label">REFRIGERAÇÃO</div><div class="hardware-value">${pc.specs.cooler}</div></div>
            <div class="hardware-item"><div class="hardware-label">FONTE</div><div class="hardware-value">${pc.specs.psu}</div></div>
            <div class="hardware-item"><div class="hardware-label">GABINETE</div><div class="hardware-value">${pc.specs.cabinet}</div></div>
          </div>
        </div>
        
        <div>
          <div class="section-subtitle">Telemetria de Benchmarks</div>
          <div class="telemetria-container">
            <div class="telemetria-card"><span class="telemetria-label">CINEBENCH R23</span><div class="telemetria-value">${pc.benchmarks.cinebench}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">3DMARK SPY</span><div class="telemetria-value">${pc.benchmarks.timespy}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">CS2 / GAME FPS</span><div class="telemetria-value">${pc.benchmarks.fps}</div></div>
            <div class="telemetria-card"><span class="telemetria-label">ESTABILIDADE</span><div class="telemetria-value">${pc.benchmarks.temp}</div></div>
          </div>
        </div>
        
        <div class="buy-action-panel">
          <div>
            <span class="price-label">Investimento Estimado</span>
            <div class="price-value">${pc.price}</div>
          </div>
          <a href="${linkWhatsApp}" target="_blank" class="btn-solicitar">Solicitar via WhatsApp</a>
        </div>

      </div>
    </div>
  `;

  showSection('produto-detalhes');
}

function showSection(id) {
  document.querySelectorAll('section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  const target = document.getElementById(id);
  if (target) { target.classList.add('active'); target.style.display = 'block'; window.scrollTo(0, 0); }
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navItem = document.getElementById('nav-' + id);
  if (navItem) navItem.classList.add('active');
}

function filtrarBuilds() {
  const uso = document.getElementById('filter-usage').value;
  const cor = document.getElementById('filter-color').value;
  const preco = document.getElementById('filter-price').value;
  const cards = document.querySelectorAll('.build-card');

  cards.forEach(card => {
    const cardUso = card.getAttribute('data-usage');
    const cardCor = card.getAttribute('data-color');
    const cardPreco = card.getAttribute('data-price');

    const matchUso = (uso === 'all' || cardUso === uso);
    const matchCor = (cor === 'all' || cardCor === cor);
    const matchPreco = (preco === 'all' || cardPreco === preco);

    if (matchUso && matchCor && matchPreco) {
      card.style.removeProperty('display');
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  });
}

function solicitarVenda(nomePC, event) {
  if (event) event.stopPropagation();
  const pc = BANCO_DE_HARDWARE[nomePC];
  if (pc) openBuildModal(pc.name, pc.price);
  else openBuildModal(nomePC, 'Sob Consulta');
}

function openBuildModal(name, price) {
  const modalName = document.getElementById('modal-build-name');
  const modalPrice = document.getElementById('modal-build-price');
  if (modalName) modalName.textContent = name;
  if (modalPrice) modalPrice.textContent = price;
  document.getElementById('build-modal').classList.add('open');
}

function closeModal() { document.getElementById('build-modal').classList.remove('open'); }

function submitBuildRequest() {
  alert('Solicitação recebida! Entraremos em contato via WhatsApp/E-mail nas próximas horas.');
  closeModal();
}

// =========================================================
// 5. CONTROLE DE INTERFACE DE NAVEGAÇÃO E SESSÃO
// =========================================================

function updateNav() {
  const navUser = document.getElementById('nav-user-area');
  const navCta = document.getElementById('nav-cta-btn');
  
  if (!navUser || !navCta) return;

  // Se o usuário estiver logado de fato
  if (isLoggedIn) {
    navCta.style.display = 'none'; // Esconde o botão "Minha Conta"
    navUser.style.display = 'flex'; // Mostra a bolinha de perfil
    
    // Recupera os dados salvos para garantir o nome correto na barra
    const usuarioSalvo = localStorage.getItem('forge_user');
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      document.getElementById('client-name-display').textContent = usuario.nome.split(" ")[0];
      // Injeta as duas primeiras letras do nome no avatar
      document.getElementById('nav-avatar-initials').textContent = usuario.nome.substring(0, 2).toUpperCase();
    }
  } else {
    navCta.style.display = 'block'; // Mostra o botão "Minha Conta"
    navUser.style.display = 'none';  // Esconde a bolinha de perfil
  }
}

// Abre/Fecha o mini menu de sair da conta
function toggleMenuUsuario() {
  const dropdown = document.getElementById('avatar-dropdown-menu');
  if(dropdown) dropdown.classList.toggle('show');
}

// Destrói a sessão e limpa os tokens do navegador (Logout real)
function ejecutarLogout() {
  isLoggedIn = false;
  localStorage.removeItem('forge_token');
  localStorage.removeItem('forge_user');
  updateNav();
  showSection('hero'); // Devolve o usuário deslogado pra Home
}

// FUNÇÃO CRUCIAL: Roda toda vez que o site abre para ver se já havia um login ativo
function verificarSessaoExistente() {
  const token = localStorage.getItem('forge_token');
  const usuarioSalvo = localStorage.getItem('forge_user');

  if (token && usuarioSalvo) {
    isLoggedIn = true;
    const usuario = JSON.parse(usuarioSalvo);
    
    // Se ele já estava logado, reconecta o dashboard dele em background
    if(usuario.id) carregarDashboardDoCliente(usuario.id);
  }
  
  // Atualiza os botões do menu com base no resultado acima
  updateNav();
}

// =========================================================
// 5. LOGIN E AUTENTICAÇÃO VIA API REST
// =========================================================
async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-pass").value.trim();
  
  if(!email || !senha) { 
    alert("Preencha e-mail e senha."); 
    return; 
  }

  // 1. Muda o texto do botão para dar feedback visual
  const btnSubmit = document.querySelector('#form-login .auth-submit');
  const textoOriginal = btnSubmit.textContent;
  btnSubmit.textContent = "Autenticando...";
  btnSubmit.style.opacity = "0.7";

  try {
    // 2. Dispara requisição POST para o seu Back-end (server.js -> auth.js)
    const resposta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      isLoggedIn = true;
      
      // Salva o Token e os Dados do Usuário no navegador
      localStorage.setItem('forge_token', dados.token);
      localStorage.setItem('forge_user', JSON.stringify(dados.usuario));

      // Atualiza o nome no Header
      const primeiroNome = dados.usuario.nome.split(" ")[0];
      const display = document.getElementById("client-name-display");
      if(display) display.textContent = primeiroNome;
      
      updateNav();

      // Mostra o Modal de Sucesso
      const modal = document.getElementById("login-success");
      if(modal) {
        modal.classList.add("show");
        setTimeout(() => { 
          modal.classList.remove("show"); 
          
          carregarDashboardDoCliente(dados.usuario.id);
          showSection("cliente"); 
        }, 1500);
      }
    } else {
      alert(dados.message || "Credenciais inválidas.");
    }
  } catch (erro) {
    console.error("Erro na comunicação com a API:", erro);
    alert("Erro de conexão com o servidor FORGE. Tente novamente.");
  } finally {
    btnSubmit.textContent = textoOriginal;
    btnSubmit.style.opacity = "1";
  }
}

async function carregarDashboardDoCliente(usuarioId) {
  try {
    const resposta = await fetch(`/api/cliente/${usuarioId}/dashboard`);
    const dados = await resposta.json();

    if (resposta.ok) {
      document.querySelector('.build-info-name').textContent = dados.build.nome;
      document.querySelector('.build-info-id').textContent = dados.build.id;
      
      const statusFormatado = dados.build.status.replace(/_/g, ' ');
      document.querySelector('.build-status').innerHTML = `<span class="status-dot"></span>${statusFormatado}`;

      const painelBench = document.querySelector('.bench-bars-list');
      if (painelBench && dados.benchmark) {
        painelBench.innerHTML = `
          <div class="bench-bar-row"><span class="bench-bar-label">Cinebench R23</span><div class="bench-bar-track"><div class="bench-bar-fill" style="width:${dados.benchmark.cinebenchR23.percentual}%"></div></div><span class="bench-bar-score">${dados.benchmark.cinebenchR23.score}</span></div>
          <div class="bench-bar-row"><span class="bench-bar-label">3DMark</span><div class="bench-bar-track"><div class="bench-bar-fill" style="width:${dados.benchmark.tmeSpy.percentual}%"></div></div><span class="bench-bar-score">${dados.benchmark.tmeSpy.score}</span></div>
          <div class="bench-bar-row"><span class="bench-bar-label">Blender BMW</span><div class="bench-bar-track"><div class="bench-bar-fill" style="width:${dados.benchmark.blenderBmw.percentual}%"></div></div><span class="bench-bar-score">${dados.benchmark.blenderBmw.score}</span></div>
          <div class="bench-bar-row"><span class="bench-bar-label">Temp. CPU máx.</span><div class="bench-bar-track"><div class="bench-bar-fill" style="width:${dados.benchmark.tempMaxCpu.percentual}%"></div></div><span class="bench-bar-score">${dados.benchmark.tempMaxCpu.score}</span></div>
        `;
        // Ativa a animação das barras
        setTimeout(() => {
          document.querySelectorAll('.bench-bar-fill').forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = width; }, 100);
          });
        }, 300);
      }
    }
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
  }
}

function doRegister() {
    const nome = document.querySelector('#form-register input[type="text"]').value.trim();
    const email = document.querySelector('#form-register input[type="email"]').value.trim();
    if (!nome || !email) { alert("Preencha todos os campos."); return; }
    isLoggedIn = true;
    const display = document.getElementById("client-name-display");
    if (display) display.textContent = nome;
    updateNav();
    alert("Conta criada com sucesso!");
    showSection("configurador");
}

function doLogout() {
  isLoggedIn = false;
  updateNav();
  showSection('hero');
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  if(tab === 'login') {
    document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
    document.getElementById('form-login').classList.add('active');
  } else {
    document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
    document.getElementById('form-register').classList.add('active');
  }
}

// =========================================================
// 6. FUNÇÕES DO CONFIGURADOR (QUIZ)
// =========================================================
let qSelections = [null, null, null, null];

function selectOption(step, idx, val) {
  qSelections[step] = val;
  const opts = document.querySelectorAll('#qstep' + step + ' .quiz-option');
  opts.forEach((o, i) => o.classList.toggle('selected', i === idx));
  const btn = document.getElementById('qnext' + step);
  if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
}

function nextStep(to) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('qstep' + to).classList.add('active');
  document.getElementById('qd' + to).classList.add('done');
}

function prevStep(to) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('qstep' + to).classList.add('active');
}

// O BOTÃO DE REFAZER AGORA FUNCIONA 100%
function resetQuiz() {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('qstep0').classList.add('active');
  document.querySelectorAll('.quiz-dot').forEach((dot, index) => {
    if(index === 0) dot.classList.add('done'); else dot.classList.remove('done');
  });
  document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelectorAll('[id^="qnext"]').forEach(btn => { btn.style.opacity = '0.3'; btn.style.pointerEvents = 'none'; });
  qSelections = [null, null, null, null];
  document.getElementById('configurador').scrollIntoView({ behavior: 'smooth' });
}

// =========================================================
// O CÉREBRO DO CONFIGURADOR: ALGORITMO DE SCORING
// =========================================================
function finalizarQuizComModelos() {
  document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
  const qresult = document.getElementById('qresult');
  if (qresult) qresult.classList.add('active');

  const uso = qSelections[0] || 'game';
  const budget = qSelections[1] || 'mid';
  const priority = qSelections[2] || 'balanced';

  // 1. Definir Range de Orçamento (Teto e Piso) com margem para Upsell
  let minPrice = 0, maxPrice = 999999;
  if (budget === 'low') { maxPrice = 8500; }
  else if (budget === 'mid') { minPrice = 7000; maxPrice = 16000; }
  else if (budget === 'high') { minPrice = 14000; maxPrice = 28000; }
  else if (budget === 'ultra') { minPrice = 24000; }

  let recomendacoes = [];

  // 2. Avaliar cada máquina do Banco de Hardware
  for (const [id, pc] of Object.entries(BANCO_DE_HARDWARE)) {
    const precoNum = parseInt(pc.price.replace('R$', '').replace(/\./g, '').trim());
    
    // Se a máquina estiver completamente fora da faixa de orçamento do cliente, ignora.
    if (precoNum < minPrice || precoNum > maxPrice) continue; 

    let score = 0;
    const badge = pc.badge.toLowerCase();
    const cpu = pc.specs.cpu.toLowerCase();
    const gpu = pc.specs.gpu.toLowerCase();
    const ram = pc.specs.ram.toLowerCase();

    // A. Pontuação de USO PRINCIPAL (Peso 50)
    if (uso === 'game' && badge.includes('gaming')) score += 50;
    if (uso === 'ia' && (badge.includes('titan') || badge.includes('workstation'))) score += 50;
    if (uso === '3d' && (badge.includes('workstation') || badge.includes('high-end'))) score += 50;
    if (uso === 'dev' && (badge.includes('dev') || badge.includes('office') || badge.includes('workstation'))) score += 50;

    // B. Pontuação de PRIORIDADE DE HARDWARE (Peso 30)
    if (priority === 'gpu' && (gpu.includes('4070') || gpu.includes('4080') || gpu.includes('4090') || gpu.includes('7900') || gpu.includes('7800'))) score += 30;
    if (priority === 'cpu' && (cpu.includes('i9') || cpu.includes('i7') || cpu.includes('ryzen 9') || cpu.includes('7800x3d'))) score += 30;
    if (priority === 'ram' && (ram.includes('64gb') || ram.includes('128gb') || ram.includes('192gb') || ram.includes('96gb'))) score += 30;
    if (priority === 'balanced') score += 15; // Bônus genérico de equilíbrio

    // Se fez algum sentido para o cliente, entra na lista de recomendações
    if (score > 0) {
        recomendacoes.push({ id, pc, score, precoNum });
    }
  }

  // 3. Ordenar as máquinas: Maior Score primeiro. Se der empate, sugere a mais barata dentro da faixa.
  recomendacoes.sort((a, b) => b.score - a.score || a.precoNum - b.precoNum);

  const topRecomendacao = recomendacoes[0];

  // 4. Injetar resultados reais na Interface
  const resultName = document.getElementById('result-name');
  const resultSub = document.getElementById('result-sub');
  const resultSpecs = document.getElementById('result-specs');
  const resultScores = document.getElementById('result-scores');
  const container = document.getElementById('quiz-builds-container');
  container.innerHTML = '';

  if (topRecomendacao) {
      const mainPc = topRecomendacao.pc;
      
      // Atualiza o painel principal com os dados do Top 1
      resultName.textContent = mainPc.name;
      
      const prioridadeTexto = priority === 'gpu' ? 'Máxima Performance Gráfica' : priority === 'cpu' ? 'Alto Poder de Processamento' : priority === 'ram' ? 'Alta Capacidade de Memória' : 'Equilíbrio Total';
      resultSub.textContent = `A máquina perfeita para o seu orçamento, focada em ${prioridadeTexto}.`;

      // Encurta nomes de CPU e GPU para ficar elegante no design
      const shortCpu = mainPc.specs.cpu.split(' ').slice(0, 4).join(' ');
      const shortGpu = mainPc.specs.gpu.split(' ').slice(0, 4).join(' ');

      resultSpecs.innerHTML = `
        <div class="spec-list-item"><strong>Processador</strong> <span>${shortCpu}</span></div>
        <div class="spec-list-item"><strong>Vídeo (GPU)</strong> <span>${shortGpu}</span></div>
        <div class="spec-list-item"><strong>Memória RAM</strong> <span>${mainPc.specs.ram.split(' ')[0]} DDR4/DDR5</span></div>
      `;
      
      resultScores.innerHTML = `
        <div class="score-item"><span class="score-val">${mainPc.benchmarks.cinebench.split(' ')[0]}</span><span class="score-lbl">Cinebench</span></div>
        <div class="score-item"><span class="score-val">${mainPc.benchmarks.temp.split(' ')[0]}</span><span class="score-lbl">Temp. Máx</span></div>
      `;

      // Muda a ação do botão principal para abrir O DASHBOARD DA MÁQUINA VENCEDORA
      const btnPrimary = document.querySelector('.result-actions .btn-primary');
      btnPrimary.setAttribute('onclick', `abrirDetalhesProduto('${topRecomendacao.id}')`);
      btnPrimary.textContent = 'VER DETALHES DESTA BUILD →';

      // Mostra as top 3 máquinas no carrossel de "Modelos Prontos Correspondentes"
      const top3 = recomendacoes.slice(0, 3);
      top3.forEach(item => {
          const p = item.pc;
          const isWhite = p.renderClass.includes('white') ? 'white-pc' : 'black-pc';
          const sGpu = p.specs.gpu.split(' ').slice(0, 3).join(' ').replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '');
          const sCpu = p.specs.cpu.split(' ').slice(0, 3).join(' ').replace('Intel Core ', '');

          const cardHTML = `
            <div class="build-card reveal-element is-visible" onclick="abrirDetalhesProduto('${item.id}')" style="display:flex; flex-direction:column; height: 100%;">
              <div class="build-card-img ${isWhite}" style="height:250px;">
                <span class="build-badge">${p.badge}</span>
                <div class="blueprint-lines"></div>
                <img src="${p.img}" class="pc-photo" alt="${p.name}">
              </div>
              <div class="build-card-body" style="flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div class="build-meta-specs">${sGpu} • ${sCpu}</div>
                  <div class="build-name" style="font-size: 18px; margin: 4px 0;">${p.name}</div>
                </div>
                <div class="build-price-row" style="margin-top: 15px;">
                  <div class="build-price" style="font-size: 18px; color: var(--color-blue);">${p.price}</div>
                  <span style="font-size: 11px; font-family: var(--font-mono); color: var(--color-gray); text-transform:uppercase;">Ver Detalhes →</span>
                </div>
              </div>
            </div>
          `;
          container.innerHTML += cardHTML;
      });
  } else {
      // Se não encontrou nenhuma máquina que bata (cenário muito específico de orçamento vs exigência)
      resultName.textContent = "Projeto Sob Medida";
      resultSub.textContent = "Seu perfil de uso e investimento exigem a análise dedicada de um engenheiro Forge.";
      resultSpecs.innerHTML = `<p style="color:var(--color-gray);font-size:14px; margin-top: 10px;">Não localizamos um modelo de prateleira exato, mas nossa especialidade é montar soluções exclusivas para você.</p>`;
      resultScores.innerHTML = '';
      container.innerHTML = `<p style="color: var(--color-gray); font-size: 14px; grid-column: 1/-1;">Recomendamos utilizar o botão abaixo para falar com um especialista e desenhar seu projeto.</p>`;
      document.querySelector('.result-actions .btn-primary').setAttribute('onclick', `showSection('consultoria')`);
      document.querySelector('.result-actions .btn-primary').textContent = 'FALAR COM ESPECIALISTA';
  }
}
// =========================================================
// 7. CONTROLE DO COMPARADOR DE WORKSTATIONS (FORGE LAB)
// =========================================================
function montarSeletoresComparador() {
  const selectA = document.getElementById('compare-pc-a');
  const selectB = document.getElementById('compare-pc-b');
  if (!selectA || !selectB) return;

  selectA.innerHTML = '';
  selectB.innerHTML = '';

  // Cria a lista dinamicamente baseada em todas as máquinas cadastradas no Banco de Hardware
  Object.keys(BANCO_DE_HARDWARE).forEach((key, index) => {
    const optA = document.createElement('option');
    optA.value = key;
    optA.textContent = BANCO_DE_HARDWARE[key].name;
    // Pré-seleciona o primeiro item da lista na Caixa A
    if(index === 0) optA.selected = true; 
    selectA.appendChild(optA);

    const optB = document.createElement('option');
    optB.value = key;
    optB.textContent = BANCO_DE_HARDWARE[key].name;
    // Pré-seleciona a última máquina (geralmente a mais parruda) na Caixa B para dar impacto visual inicial
    if(index === Object.keys(BANCO_DE_HARDWARE).length - 1) optB.selected = true;
    selectB.appendChild(optB);
  });

  // Executa a primeira comparação logo no carregamento para a página não abrir zerada
  executarComparacao();
}

function executarComparacao() {
  const idA = document.getElementById('compare-pc-a').value;
  const idB = document.getElementById('compare-pc-b').value;
  
  const pcA = BANCO_DE_HARDWARE[idA];
  const pcB = BANCO_DE_HARDWARE[idB];
  if (!pcA || !pcB) return;

  // Atualiza os nomes nos rótulos das barras de renderização
  document.getElementById('bar-name-a-cine').textContent = pcA.name;
  document.getElementById('bar-name-b-cine').textContent = pcB.name;
  document.getElementById('bar-name-a-3dm').textContent = pcA.name;
  document.getElementById('bar-name-b-3dm').textContent = pcB.name;
  document.getElementById('bar-name-a-fps').textContent = pcA.name;
  document.getElementById('bar-name-b-fps').textContent = pcB.name;

  // Extrai apenas os números das strings do banco de dados para calcular as proporções das barras
  // (Trata os cenários de 'N/A' transformando-os em zero para não quebrar o layout)
  const numA_cine = parseInt(pcA.benchmarks.cinebench.replace(/\D/g, '')) || 0;
  const numB_cine = parseInt(pcB.benchmarks.cinebench.replace(/\D/g, '')) || 0;
  const numA_3dm = parseInt(pcA.benchmarks.timespy.replace(/\D/g, '')) || 0;
  const numB_3dm = parseInt(pcB.benchmarks.timespy.replace(/\D/g, '')) || 0;
  const numA_fps = parseInt(pcA.benchmarks.fps.replace(/\D/g, '')) || 0;
  const numB_fps = parseInt(pcB.benchmarks.fps.replace(/\D/g, '')) || 0;

  // Exibe os valores textuais brutos nas pontas das barras
  document.getElementById('bar-val-a-cine').textContent = pcA.benchmarks.cinebench;
  document.getElementById('bar-val-b-cine').textContent = pcB.benchmarks.cinebench;
  document.getElementById('bar-val-a-3dm').textContent = pcA.benchmarks.timespy;
  document.getElementById('bar-val-b-3dm').textContent = pcB.benchmarks.timespy;
  document.getElementById('bar-val-a-fps').textContent = pcA.benchmarks.fps;
  document.getElementById('bar-val-b-fps').textContent = pcB.benchmarks.timespy === 'N/A' || pcB.benchmarks.fps === 'N/A' ? 'N/A' : pcB.benchmarks.fps;

  // Define a escala proporcional das larguras das barras baseando-se no maior valor do par selecionado
  const maxCine = Math.max(numA_cine, numB_cine, 1);
  const max3dm = Math.max(numA_3dm, numB_3dm, 1);
  const maxFps = Math.max(numA_fps, numB_fps, 1);

  document.getElementById('bar-fill-a-cine').style.width = ((numA_cine / maxCine) * 100) + '%';
  document.getElementById('bar-fill-b-cine').style.width = ((numB_cine / maxCine) * 100) + '%';
  document.getElementById('bar-fill-a-3dm').style.width = ((numA_3dm / max3dm) * 100) + '%';
  document.getElementById('bar-fill-b-3dm').style.width = ((numB_3dm / max3dm) * 100) + '%';
  
  document.getElementById('bar-fill-a-fps').style.width = numA_fps === 0 ? '0%' : ((numA_fps / maxFps) * 100) + '%';
  document.getElementById('bar-fill-b-fps').style.width = numB_fps === 0 ? '0%' : ((numB_fps / maxFps) * 100) + '%';

  // Lógica Inteligente do Veredito (Comunicação de Consultoria / Honestidade da marca)
  const txtVerdict = document.getElementById('verdict-text-display');
  if(idA === idB) {
    txtVerdict.innerHTML = `Você está comparando a mesma máquina. Escolha modelos diferentes para avaliar o ganho real de desempenho por workload técnico.`;
  } else {
    // Calcula qual máquina rende mais no teste multicore (Workstation / Render)
    const vencedorCine = numA_cine > numB_cine ? pcA : pcB;
    const perdedorCine = numA_cine > numB_cine ? pcB : pcA;
    const diferenca = Math.abs(numA_cine - numB_cine);
    const ganhoPercentual = Math.round((diferenca / (Math.min(numA_cine, numB_cine) || 1)) * 100);

    let vereditoHTML = `A configuração <strong>${vencedorCine.name}</strong> apresenta um rendimento bruto de processamento computacional superior à <strong>${perdedorCine.name}</strong>. `;
    
    if(ganhoPercentual > 0) {
      vereditoHTML += `Isso resulta em uma aceleração estimada de até <strong>${ganhoPercentual}% mais velocidade</strong> em tarefas pesadas de renderização multicore local (como Blender e Cinema 4D). `;
    }

    // Se uma delas for uma Workstation pesada (como as Titan) e a outra for de Office, dá um conselho honesto contra desperdício
    if(vencedorCine.badge.includes('TITAN') && perdedorCine.badge.includes('OFFICE')) {
      vereditoHTML += `<br><br>✦ <em>Nota Técnica Forge:</em> Lembre-se do nosso pilar de precisão. Se o seu fluxo de trabalho envolve apenas tarefas administrativas, planilhas pesadas ou desenvolvimento leve, o investimento na linha Titan é superdimensionado e desnecessário. A linha Office atenderá sua demanda perfeitamente, sem desperdício de capital técnico.`;
    } else {
      vereditoHTML += `<br><br>✦ Avalie qual dessas opções se adequa melhor ao teto de investimento do seu projeto ou empresa. Se precisar de uma simulação personalizada de ganho em softwares de engenharia (CAD/BIM) ou Data Science, agende um horário na aba Consultoria.`;
    }
    
    txtVerdict.innerHTML = vereditoHTML;
  }
}

// =========================================================
// 8. EFEITOS INTERATIVOS GLOBAIS (RASTRO DO MOUSE)
// =========================================================
function inicializarRastroMouse() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// =========================================================
// 9. EFEITO DE REVEAL NO SCROLL (INTERSECTION OBSERVER)
// =========================================================
function inicializarScrollReveal() {
  // Configura o "Olheiro" do navegador
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      // Se o elemento entrou na tela...
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target); // Para de observar para a animação rodar só 1 vez
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px', // Dispara a animação um pouquinho antes de aparecer totalmente
    threshold: 0.1 
  });

  // Lista mágica: Seleciona todos os blocos importantes do site automaticamente
  const seletoresParaAnimar = [
    '.sec-header', 
    '.build-card', 
    '.consul-card', 
    '.client-card', 
    '.compare-metric-card', 
    '.telemetria-card', 
    '.auth-wrap', 
    '.schedule-form',
    '.bench-table'
  ];

  // Aplica a classe invisível e manda o Olheiro vigiar cada um deles
  const elementos = document.querySelectorAll(seletoresParaAnimar.join(', '));
  elementos.forEach((el, index) => {
    el.classList.add('reveal-element');
    
    // Cria um efeito "cascata" (delay) se houver vários elementos juntos (como na grade de PCs)
    // Isso faz eles subirem um após o outro, como uma onda!
    el.style.animationDelay = `${(index % 4) * 0.1}s`; 
    
    observer.observe(el);
  });
}