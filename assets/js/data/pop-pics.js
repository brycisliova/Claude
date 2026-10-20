// Picture questions for the Pride pop quiz. Every photograph is credited in pop-photos.json and on the credits page.
// People are asked as "Who is this?" with three names from the same field, picked fresh each time the page loads.
const POOLS = {
  men: ["Elton John", "Freddie Mercury", "George Michael", "David Bowie", "Boy George", "Sam Smith", "Troye Sivan", "Lil Nas X", "Olly Alexander", "Harry Styles", "Adam Lambert", "Ricky Martin"],
  women: ["Gloria Gaynor", "Chappell Roan", "Cher", "Madonna", "Lady Gaga", "Kylie Minogue", "Diana Ross", "Janelle Monáe", "Kim Petras", "Dolly Parton", "Donna Summer", "Tina Turner"],
  eurovision: ["Conchita Wurst", "Dana International", "Nemo", "Netta", "Loreen", "Måns Zelmerlöw", "Duncan Laurence", "Lordi"],
  screen: ["RuPaul", "Laverne Cox", "Billy Porter", "Ellen DeGeneres", "Elliot Page", "Hunter Schafer", "Neil Patrick Harris", "Ian McKellen", "Wanda Sykes", "Jonathan Van Ness", "Karamo Brown", "Trixie Mattel"],
  icons: ["James Baldwin", "Audre Lorde", "Bayard Rustin", "Harvey Milk", "Tim Cook", "Pete Buttigieg", "Leo Varadkar", "Alan Turing", "Oscar Wilde", "Barney Frank", "Sally Ride", "Marsha P. Johnson"],
  sport: ["Gareth Thomas", "Greg Louganis", "Martina Navratilova", "Megan Rapinoe", "Billie Jean King", "Tom Daley", "Carl Nassib", "Jake Daniels", "Adam Rippon", "Gus Kenworthy", "Sue Bird", "Nicola Adams"],
  india: ["Laxmi Narayan Tripathi", "Manvendra Singh Gohil", "Alok Vaid-Menon", "Vikram Seth", "Gauri Sawant", "Dutee Chand", "Ashok Row Kavi", "Kalki Subramaniam", "Sushant Divgikar", "Hansal Mehta", "Ruth Vanita", "Saleem Kidwai"]
};
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const person = (cat, pool, img, name, e, q = "Who is this?") => ({ cat, t: "pic", img, q, e, o: [name, ...shuf(POOLS[pool].filter((n) => n !== name)).slice(0, 3)] });
const place = (cat, img, q, o, e) => ({ cat, t: "place", img, q, e, o });

export const PICS = [
  person("music", "eurovision", "conchita-wurst", "Conchita Wurst", "Conchita Wurst won Eurovision 2014 for Austria with 'Rise Like a Phoenix'."),
  person("music", "women", "dolly-parton", "Dolly Parton", "Dolly Parton wrote 'Jolene' and 'I Will Always Love You', and has long been a loud ally of LGBTQ people."),
  person("music", "men", "elton-john", "Elton John", "Sir Elton John founded the Elton John AIDS Foundation in 1992."),
  person("music", "women", "gloria-gaynor", "Gloria Gaynor", "Gloria Gaynor recorded 'I Will Survive' in 1978."),
  person("music", "men", "lil-nas-x", "Lil Nas X", "Lil Nas X's 'Old Town Road' spent a record 19 weeks at number one in 2019."),
  person("music", "men", "troye-sivan", "Troye Sivan", "Troye Sivan is an Australian singer and actor, known for 'Youth' and 'Rush'."),
  person("music", "men", "olly-alexander", "Olly Alexander", "Olly Alexander fronts Years & Years and starred in the TV drama It's a Sin."),
  person("music", "women", "chappell-roan", "Chappell Roan", "Chappell Roan won Best New Artist at the 2025 Grammys."),
  person("screen", "screen", "rupaul", "RuPaul", "RuPaul hosts RuPaul's Drag Race, which began in 2009."),
  person("screen", "screen", "laverne-cox", "Laverne Cox", "Laverne Cox played Sophia Burset in Orange Is the New Black."),
  person("screen", "screen", "ellen-degeneres", "Ellen DeGeneres", "Ellen DeGeneres came out on the cover of Time in 1997, the same year her sitcom character did."),
  person("screen", "screen", "elliot-page", "Elliot Page", "Elliot Page, known for Juno and The Umbrella Academy, came out as trans in December 2020."),
  person("screen", "screen", "hunter-schafer", "Hunter Schafer", "Hunter Schafer plays Jules in Euphoria, and is also a model."),
  person("screen", "screen", "neil-patrick-harris", "Neil Patrick Harris", "Neil Patrick Harris came out in 2006 and played Barney Stinson on How I Met Your Mother."),
  person("icons", "icons", "james-baldwin", "James Baldwin", "James Baldwin wrote Giovanni's Room in 1956 and The Fire Next Time in 1963."),
  person("icons", "icons", "tim-cook", "Tim Cook", "Tim Cook came out publicly in 2014 and is the CEO of Apple."),
  person("icons", "icons", "pete-buttigieg", "Pete Buttigieg", "Pete Buttigieg became the first openly gay person confirmed to a US cabinet post, in 2021."),
  person("icons", "icons", "leo-varadkar", "Leo Varadkar", "Leo Varadkar became Ireland's first openly gay Taoiseach in 2017, and his father is from Mumbai."),
  person("arts", "sport", "gareth-thomas", "Gareth Thomas", "Gareth Thomas captained Wales at rugby and came out in 2009."),
  person("arts", "sport", "greg-louganis", "Greg Louganis", "Greg Louganis won four Olympic diving gold medals, two each in 1984 and 1988."),
  person("arts", "sport", "martina-navratilova", "Martina Navratilova", "Martina Navratilova won nine Wimbledon singles titles."),
  person("arts", "sport", "megan-rapinoe", "Megan Rapinoe", "Megan Rapinoe won the Golden Ball and Golden Boot at the 2019 Women's World Cup."),
  person("arts", "india", "vikram-seth", "Vikram Seth", "Vikram Seth is the author of A Suitable Boy, published in 1993.", "Who is this author of 'A Suitable Boy'?"),
  person("india", "india", "laxmi-narayan-tripathi", "Laxmi Narayan Tripathi", "Laxmi Narayan Tripathi is a hijra activist and the author of 'Me Hijra, Me Laxmi'.", "Who is this activist and author?"),
  person("india", "india", "manvendra-singh-gohil", "Manvendra Singh Gohil", "Manvendra Singh Gohil of Rajpipla came out publicly in 2006. This is a painting of him.", "Whose portrait is this?"),
  person("india", "india", "alok-vaid-menon", "Alok Vaid-Menon", "Alok Vaid-Menon is an author and performance artist who uses they/them pronouns.", "Who is this author and performance artist?"),
  person("icons", "icons", "marsha-p-johnson", "Marsha P. Johnson", "Marsha P. Johnson co-founded STAR and was a beloved fixture of New York's Christopher Street.", "Who is honoured in this street art?"),
  place("icons", "freddie-mercury", "Whose statue looks out over Lake Geneva in Montreux?", ["Freddie Mercury", "Elton John", "David Bowie", "George Michael"], "The statue of Freddie Mercury in Montreux, Switzerland, was unveiled in 1996."),
  place("india", "khajuraho", "Which World Heritage temple complex in Madhya Pradesh is this?", ["Khajuraho", "Konark", "Hampi", "Ellora"], "The Khajuraho temples date from roughly the 10th and 11th centuries and are famous for their sculpture of love and intimacy."),
  place("india", "delhi-pride", "Which Indian city's Queer Pride march is this?", ["Delhi", "Mumbai", "Kolkata", "Chennai"], "Delhi held its first Queer Pride march in 2008."),
  place("icons", "progress-flag", "Which flag is this?", ["The Progress Pride flag", "The original rainbow flag", "The trans Pride flag", "The bisexual Pride flag"], "Daniel Quasar designed the Progress Pride flag in 2018."),
  place("icons", "gilbert-baker", "This plaque in Paris honours the American artist who created which flag?", ["The rainbow Pride flag", "The Progress Pride flag", "The trans Pride flag", "The bisexual Pride flag"], "Gilbert Baker made the first rainbow flag in 1978."),
  place("icons", "harvey-milk-plaza", "Which landmark cinema in San Francisco's Castro district is this?", ["The Castro Theatre", "The Fillmore", "The Orpheum", "The Stud"], "The Castro Theatre opened in 1922 and hosts the city's LGBTQ film festival."),
  place("icons", "stonewall-inn", "This 'raided premises' police sign recalls which 1969 uprising in New York?", ["The Stonewall uprising", "The Compton's Cafeteria riot", "The White Night riots", "The Cooper Do-nuts riot"], "The Stonewall uprising began on 28 June 1969.")
];
