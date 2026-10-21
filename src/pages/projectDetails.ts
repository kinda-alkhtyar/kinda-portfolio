type ProjectDetail = { slug: string; title: string; images: string[]; liveUrl?: string; stack?: string[] }

export const projectDetails: ProjectDetail[] = [
  { slug: 'aqarati', title: 'Aqarati Syria', images: ['01-hero.png', '03-properties.png', '04-property-details.png', '05-hidmat.png'], liveUrl: 'https://aqarati-syria.netlify.app/' },
  { slug: 'taaniqi-iman', title: 'Taaniqi with Iman', images: ['taanagi.home.jpeg', 'taanagi.propatsi.jpeg'], liveUrl: 'https://taaniqi-iman.vercel.app/', stack: ['React'] },
  { slug: 'yumna-portfolio', title: 'Yumna Al-Muallem Portfolio', images: ['home.frui.jpeg', 'home2.frui.jpeg', 'work.frui.jpeg', 'contacr.frui.jpeg'], liveUrl: 'https://yumnaalmuallem-portfolio.netlify.app/' },
  { slug: 'fruit-milk', title: 'FruitMilk', images: ['home.milk.jpeg', 'abaut.milk.jpeg', 'products.milk.jpeg', 'contact.milk.jpeg'] },
  { slug: 'personal-portfolio', title: 'Personal Developer Portfolio', images: ['portfolio-preview.png'], stack: ['HTML', 'CSS', 'JavaScript', 'React', 'Three.js', 'GSAP', 'Vite'] },
]
