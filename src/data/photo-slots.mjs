// Every photograph slot on the site. A slot renders a real, credited photograph when src/data/photos.json
// has an entry for its id, and a designed colour field with a constellation motif until then.
// `brief` and `queries` describe what belongs in the slot, for whoever sources the picture.
//   ratio: width / height of the slot, c: fallback colour (CSS variable name)

const S = (id, ratio, c, brief, queries) => ({ id, ratio, c, brief, queries });

export const PHOTO_SLOTS = [
  // home hero panels
  S("hero-choice", 0.62, "pink", "Open sky at dawn or a rainbow over a landscape. Hope, horizon, nothing forced.", ["rainbow sky dawn landscape", "sunrise horizon sky"]),
  S("hero-illness", 0.62, "yellow", "Hands held in care or support. Warmth, not medical imagery.", ["holding hands support", "hands together comfort"]),
  S("hero-who", 0.62, "blue", "Queer pride march in India, crowd with flags, daylight.", ["pride march India", "Mumbai Queer Azaadi Mumbai pride", "Delhi queer pride parade"]),
  // page heroes (wide band under the title)
  S("hero-learn", 2.4, "pink", "Rainbow and progress flags in the wind against sky.", ["pride flag wind sky", "progress pride flag"]),
  S("hero-science", 2.4, "orange", "Microscope, laboratory or cell imagery. Research without cliché.", ["microscope laboratory research", "cell culture fluorescence microscopy"]),
  S("hero-library", 2.4, "yellow", "Old library shelves, open books, reading light.", ["library reading room books", "bookshelves library"]),
  S("hero-timeline", 2.4, "green", "Khajuraho temple sculpture, India, warm stone.", ["Khajuraho temple sculpture", "Khajuraho Western group of temples"]),
  S("hero-myths", 2.4, "r", "People in conversation at a table, listening.", ["friends talking table", "conversation cafe people"]),
  S("hero-stories", 2.4, "green", "Person at a window, soft light, reflective.", ["person window light", "silhouette window morning"]),
  S("hero-voices", 2.4, "blue", "Microphone, stage or recording, speaker at a podium.", ["microphone stage talk", "podcast microphone studio"]),
  S("hero-watch", 2.4, "violet", "Cinema seats or projector beam.", ["cinema projector beam", "empty cinema seats"]),
  S("hero-india", 2.4, "blue", "Supreme Court of India building, or a pride march outside it.", ["Supreme Court of India building", "Section 377 verdict celebration India"]),
  S("hero-help", 2.4, "blue", "Two hands and a cup of tea, a quiet conversation. Safe, not clinical.", ["two people tea conversation hands", "support conversation sofa"]),
  S("hero-therapies", 2.4, "pink", "Person meditating outdoors or walking through woods.", ["meditation nature morning", "forest path walk"]),
  S("hero-sound", 2.4, "sky", "Rain on a window, or headphones.", ["rain window drops", "headphones listening music"]),
  S("hero-games", 2.4, "green", "Lanterns or kites in the sky at dusk.", ["sky lanterns dusk", "kites sky India"]),
  S("hero-about", 2.4, "violet", "Night sky with the Milky Way over a quiet landscape.", ["milky way night sky", "starry sky landscape night"]),
  S("hero-connect", 2.4, "orange", "Handwritten letter, postbox or hands on a keyboard at night.", ["handwritten letter desk", "postbox letter"]),
  S("hero-privacy", 2.4, "sky", "Closed door, curtain or keyhole. Privacy and safety.", ["window curtain light", "closed door light"]),
  S("hero-sources", 2.4, "yellow", "Stack of papers or open journals.", ["stack of papers journals", "reading research papers"]),
  // full-bleed interludes between sections
  S("interlude-1", 2.2, "violet", "Crowd at an Indian pride march, joyful, wide shot.", ["pride parade India crowd"]),
  S("interlude-2", 2.2, "orange", "Friends laughing together outdoors, warm light.", ["friends laughing outdoors"]),
  S("interlude-3", 2.2, "green", "Rain falling on leaves, calm and green.", ["rain leaves green"]),
  S("interlude-4", 2.2, "blue", "Sunrise over water.", ["sunrise over water"]),
  // home picture strip
  S("strip-1", 0.78, "pink", "Two people in conversation, warm daylight.", ["friends talking"]),
  S("strip-2", 1.0, "green", "A person meditating or walking by the sea.", ["meditation sea"]),
  S("strip-3", 0.78, "yellow", "Friends laughing together.", ["friends laughing"]),
  // portraits for the Stories page (public figures; use their freely licensed portrait only)
  S("portrait-ashok-row-kavi", 0.8, "orange", "Portrait of Ashok Row Kavi.", ["Ashok Row Kavi"]),
  S("portrait-laxmi-narayan-tripathi", 0.8, "r", "Portrait of Laxmi Narayan Tripathi.", ["Laxmi Narayan Tripathi"]),
  S("portrait-manvendra-singh-gohil", 0.8, "yellow", "Portrait of Manvendra Singh Gohil.", ["Manvendra Singh Gohil"]),
  S("portrait-navtej-singh-johar", 0.8, "green", "Portrait of Navtej Singh Johar.", ["Navtej Singh Johar"]),
  S("portrait-keshav-suri", 0.8, "blue", "Portrait of Keshav Suri.", ["Keshav Suri"]),
  S("portrait-ritu-dalmia", 0.8, "violet", "Portrait of Ritu Dalmia.", ["Ritu Dalmia"]),
  S("portrait-dutee-chand", 0.8, "pink", "Portrait of Dutee Chand.", ["Dutee Chand"]),
  S("portrait-grace-banu", 0.8, "sky", "Portrait of Grace Banu.", ["Grace Banu"]),
  S("portrait-anjali-gopalan", 0.8, "orange", "Portrait of Anjali Gopalan.", ["Anjali Gopalan"]),
  S("portrait-saurabh-kirpal", 0.8, "green", "Portrait of Saurabh Kirpal.", ["Saurabh Kirpal"]),
  S("portrait-joyita-mondal", 0.8, "r", "Portrait of Joyita Mondal.", ["Joyita Mondal"]),
  S("portrait-padmini-prakash", 0.8, "violet", "Portrait of Padmini Prakash.", ["Padmini Prakash"])
];

export const SLOT = Object.fromEntries(PHOTO_SLOTS.map((s) => [s.id, s]));
