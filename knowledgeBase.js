const { connectDB } = require('./db');

// Real SNU admission data (sourced from official SNU site content, Aug 2026).
const seedData = [
  // ---------- GENERAL ----------
  {
    category: 'General',
    question: 'What is Somali National University (SNU)?',
    answer_en: 'Somali National University (SNU) is Somalia\'s national public university, offering undergraduate and postgraduate programmes across faculties including Agriculture, Economics & Management, Education, Engineering, Health Sciences, Languages, Law, Medicine & Surgery, Science, Sharia & Islamic Studies, Social Science, and Veterinary Medicine.',
    answer_so: 'Jaamacadda Ummadda Soomaaliyeed (SNU) waa jaamacadda qaranka ee Soomaaliya, waxayna bixisaa barnaamijyo heerka shahaadada koowaad iyo kuwa sare oo ay ka mid yihiin Kulliyadaha Beeraha, Dhaqaalaha iyo Maamulka, Waxbarashada, Injineerinka, Cilmiga Caafimaadka, Luqadaha, Sharciga, Caafimaadka iyo Qalliinka, Sayniska, Sharciga Islaamka, Cilmiga Bulshada, iyo Caafimaadka Xoolaha.'
  },

  // ---------- UNDERGRADUATE REQUIREMENTS ----------
  {
    category: 'Admission Requirements - Undergraduate',
    question: 'What are the admission requirements for undergraduate programmes?',
    answer_en: 'Undergraduate applicants must: hold a recognized Somali Secondary School Certificate or equivalent; meet the minimum entry requirements set by the Ministry of Education and SNU; submit official academic transcripts and certificates; provide a valid national ID or passport; complete any required entrance exam or interview where applicable; and pay a non-refundable Registration & ID Card Fee of $55.',
    answer_so: 'Codsadayaasha heerka shahaadada koowaad waa inay: haystaan Shahaadada Dugsiga Sare ee la aqoonsan yahay ama mid la mid ah; buuxiyaan shuruudaha ugu yar ee ay dejiyeen Wasaaradda Waxbarashada iyo SNU; soo gudbiyaan warqadaha aqoonyahannimo iyo shahaadooyinka; bixiyaan aqoonsi qaran ama baasaboor sax ah; dhammeeystiraan imtixaan ama wareysi haddii loo baahdo; bixiyaan Lacagta Diiwaangelinta iyo Kaarka Aqoonsiga oo ah $55 (aan la celin karin).'
  },

  // ---------- POSTGRADUATE REQUIREMENTS ----------
  {
    category: 'Admission Requirements - Postgraduate',
    question: 'What are the admission requirements for postgraduate programmes?',
    answer_en: 'Postgraduate applicants must: hold a recognized Bachelor\'s degree from an accredited university; meet the minimum GPA required by the respective faculty; submit official academic transcripts; provide recommendation letters where required; submit a research proposal for research-based programmes; attend an interview if requested by the faculty; and pay a non-refundable Registration & ID Card Fee of $50.',
    answer_so: 'Codsadayaasha heerka shahaadada sare waa inay: haystaan shahaadada Bachelor-ka oo laga qaatay jaamacad la aqoonsan yahay; buuxiyaan GPA-ga ugu yar ee kulliyaddu dooneyso; soo gudbiyaan warqadaha aqoonyahannimo; bixiyaan warqadaha taageerada haddii loo baahdo; soo gudbiyaan soo jeedin cilmi-baaris haddii barnaamijku yahay mid cilmi-baaris ku salaysan; ka qaybgalaan wareysi haddii kulliyaddu dalbato; bixiyaan Lacagta Diiwaangelinta iyo Kaarka Aqoonsiga oo ah $50.'
  },

  // ---------- INTERNATIONAL APPLICANTS ----------
  {
    category: 'Admission Requirements - International',
    question: 'What do international applicants need to apply?',
    answer_en: 'International applicants are welcome and should provide: equivalent academic qualifications; certified copies of academic documents; a passport copy; proof of English language proficiency where required; document authentication; and pay a non-refundable Registration & ID Card Fee of $55.',
    answer_so: 'Codsadayaasha dibedda waa lagu soo dhaweynayaa, waxayna bixin doonaan: shahaadooyin la mid ah kuwa halkan la baahan yahay; nuqullo la xaqiijiyay oo dukumentiyada waxbarasho ah; nuqul baasaboorka; caddayn af-Ingiriisi haddii loo baahdo; xaqiijinta dukumentiyada; iyo lacagta Diiwaangelinta iyo Kaarka Aqoonsiga oo ah $55.'
  },

  // ---------- TUITION & FEES BY FACULTY ----------
  {
    category: 'Fees',
    question: 'What are the tuition fees and administrative charges per faculty?',
    answer_en: 'All undergraduate programmes at SNU are tuition-free. Students pay only an Administrative Charge specific to their faculty, plus the Registration & ID Card Fee. Duration and administrative charges by faculty: Faculty of Agriculture and Environmental Science — 4 years, $80. Faculty of Economic and Management Science — 4 years, $80. Faculty of Education — 4 years, $50. Faculty of Engineering — 4 years, $125. Faculty of Health Sciences and Tropical Medicine — 4 years, $100. Faculty of Languages — 4 years, $80. Faculty of Law — 4 years, $80. Faculty of Medicine and Surgery — 6 years, $125. Faculty of Science — 4 years, $125. Faculty of Sharia and Islamic Studies — 4 years, $50. Faculty of Social Science — 4 years, $80. Faculty of Veterinary Medicine and Animal Husbandry — 5 years, $80.',
    answer_so: 'Dhammaan barnaamijyada heerka shahaadada koowaad ee SNU waa lacag-la\'aan (tuition-free). Ardayda waxay bixiyaan kaliya Kharashka Maamulka ee kulliyaddooda gaarka ah, iyo Lacagta Diiwaangelinta. Muddada iyo kharashka maamulka ee kulliyad kasta: Beeraha iyo Deegaanka — 4 sano, $80. Dhaqaalaha iyo Maamulka — 4 sano, $80. Waxbarashada — 4 sano, $50. Injineerinka — 4 sano, $125. Caafimaadka iyo Cudurada Kuleylaha — 4 sano, $100. Luqadaha — 4 sano, $80. Sharciga — 4 sano, $80. Caafimaadka iyo Qalliinka — 6 sano, $125. Sayniska — 4 sano, $125. Sharciga Islaamka — 4 sano, $50. Cilmiga Bulshada — 4 sano, $80. Caafimaadka Xoolaha — 5 sano, $80.'
  },

  // ---------- FOUNDATION PROGRAM & EAP ----------
  {
    category: 'Foundation Programme',
    question: 'Is there a compulsory foundation programme before starting a degree?',
    answer_en: 'Yes. All undergraduate applicants must successfully complete the Foundation Programme before beginning their degree studies. This includes English for Academic Purposes (EAP), which has 5 levels and costs a total of $350. Students must complete all five EAP levels before progressing to their academic programme, unless exempted under the University\'s placement policy.',
    answer_so: 'Haa. Dhammaan codsadayaasha heerka koowaad waa inay si guul leh u dhammeeyaan Barnaamijka Aasaaska ka hor inta aysan bilaabin shahaadadooda. Tan waxaa ku jira Ingiriisiga Ujeeddooyinka Waxbarasho (EAP), oo leh 5 heer oo wadar ahaan qiimahiisu yahay $350. Ardaydu waa inay dhammeeyaan shantaba heer ee EAP ka hor inta aysan u gudbin barnaamijkooda, marka laga reebo kuwa laga saaray sida siyaasadda su\'aalaha ay jaamacaddu dejisay.'
  },

  // ---------- STUDY MODES ----------
  {
    category: 'Study Options',
    question: 'What study modes does SNU offer — full-time or part-time?',
    answer_en: 'SNU offers Full-Time Study (regular daytime classes, suited for secondary school graduates, full-time students, and scholarship recipients) and Part-Time Study (evening classes and weekend classes for selected programmes, designed for working professionals and students needing flexible schedules).',
    answer_so: 'SNU waxay bixisaa Waxbarasho Waqti-buuxa (fasallada maalinlaha ah, ku habboon kuwa ka qalin jabiyay dugsiga sare, ardayda waqtiga buuxa, iyo kuwa deeqda waxbarasho helay) iyo Waxbarasho Waqti-qeyb (fasallo fiidnimo iyo fasallo weekend ah oo loogu talagalay dadka shaqeeya ee u baahan jadwal dabacsan).'
  },

  // ---------- HOW TO APPLY ----------
  {
    category: 'Application Process',
    question: 'How do I apply to SNU, step by step?',
    answer_en: 'Step 1: Choose your preferred programme from the available faculties. Step 2: Review the admission requirements carefully. Step 3: Prepare all required documents (academic certificates, academic transcripts, passport-sized photographs, national ID or birth certificate). Step 4: Complete the online application form or submit a printed application through the Admission Office. Step 5: Pay the application fee. Step 6: Submit your application before the stated deadline. Step 7: Track your application status and wait for the admission decision.',
    answer_so: 'Tallaabo 1: Dooro barnaamijka aad doorbidayso ee kulliyadaha la heli karo. Tallaabo 2: Si taxadar leh u eeg shuruudaha gelitaanka. Tallaabo 3: Diyaari dhammaan dukumentiyada loo baahan yahay (shahaadooyin, warqadaha aqoonyahannimo, sawirro, aqoonsi qaran ama shahaadada dhalashada). Tallaabo 4: Buuxi foomka codsiga ee onlaynka ah ama gudbi foom daabacan xafiiska Diiwaangelinta. Tallaabo 5: Bixi lacagta codsiga. Tallaabo 6: Gudbi codsigaaga ka hor taariikhda kama dambaysta ah. Tallaabo 7: La soco heerka codsigaaga oo sug go\'aanka gelitaanka.'
  },

  // ---------- APPLICATION FORM ----------
  {
    category: 'Application Form',
    question: 'What information does the application form require?',
    answer_en: 'The official application form (available through the University\'s Online Admission Portal or as a printed form from the Admission Office) requires: personal information, contact details, educational background, programme selection, emergency contact information, and uploaded supporting documents. Applicants should ensure all information is accurate and complete — incomplete applications may delay processing or result in rejection.',
    answer_so: 'Foomka rasmiga ah ee codsiga (oo laga heli karo Portal-ka Onlaynka ee Diiwaangelinta ama nuqul daabacan oo laga helo Xafiiska Diiwaangelinta) wuxuu u baahan yahay: xogta shakhsiga, xiriirka, taariikhda waxbarasho, doorashada barnaamijka, xogta xiriirka xaaladaha degdegga ah, iyo dukumentiyada taageerada oo la soo geliyay. Codsadayaashu waa inay hubiyaan in xogta oo dhami sax tahay oo dhammaystiran tahay — codsiyada aan dhammaystirnayn waxay dib u dhigi karaan habaynta ama keeni karaan diidmo.'
  },

  // ---------- DEADLINES ----------
  {
    category: 'Deadlines',
    question: 'When does admission open and close, and what is the application deadline?',
    answer_en: 'Admission for the current cycle is open from August 1, 2026 to September 24, 2026. Applicants must submit their completed application, required documents, and fees before September 24, 2026 to be considered. Students are encouraged to apply early, as some faculties or programmes may fill available spots before the deadline.',
    answer_so: 'Gelitaanka xilligan wuxuu furan yahay laga bilaabo Ogosto 1, 2026 ilaa Sebtembar 24, 2026. Codsadayaashu waa inay soo gudbiyaan codsigooda oo dhammaystiran, dukumentiyada loo baahan yahay, iyo lacagaha ka hor Sebtembar 24, 2026 si loo tixgeliyo. Ardayda waxaa lagula talinayaa inay hore u codsadaan, maadaama kulliyado ama barnaamijyo qaar ay buuxin karaan boosaska ka hor taariikhda kama dambaysta ah.'
  },

  // ---------- ACADEMIC CALENDAR ----------
  {
    category: 'Academic Calendar',
    question: 'What does the Academic Calendar cover and where can I find deadlines?',
    answer_en: 'The Academic Calendar outlines important dates including: admission application periods, entrance examinations, registration dates, semester commencement, course add/drop deadlines, mid-semester examinations, final examinations, graduation ceremonies, and public holidays/academic breaks. Students are encouraged to regularly consult the Academic Calendar for exact current dates, as these change each cycle.',
    answer_so: 'Jadwalka Sannadlaha ah wuxuu soo bandhigayaa taariikhaha muhiimka ah oo ay ka mid yihiin: xilliyada codsiga gelitaanka, imtixaannada gelitaanka, taariikhaha diiwaangelinta, bilowga semester-ka, taariikhaha kama-dambaysta ah ee ku darsiga/ka-baxa koorsooyinka, imtixaannada dhexe, imtixaannada kama dambaysta ah, xafladaha qalin-jabinta, iyo fasaxyada guud. Ardayda waxaa lagu dhiirigelinayaa inay si joogto ah u eegaan Jadwalka Sannadlaha ah si ay u helaan taariikhaha saxda ah, maadaama ay isbeddelaan xilli kasta.'
  },

  // ---------- CONTACT ----------
  {
    category: 'Contact',
    question: 'How can I contact the admissions office or get more help?',
    answer_en: 'For admission-related questions, contact the SNU Admission Office directly, or reach the Somali National Artificial Intelligence Centre for questions related to this chatbot project at ai@snu.edu.so.',
    answer_so: 'Su\'aalaha la xiriira gelitaanka, la xiriir Xafiiska Diiwaangelinta ee SNU si toos ah, ama la xiriir Xarunta Sirdoonka Kaawiga ee Ummadda Soomaaliyeed (ai@snu.edu.so) su\'aalaha ku saabsan mashruucan.'
  }
];

async function seed() {
  const db = await connectDB();
  const col = db.collection('admissionInfo');
  await col.deleteMany({}); // always reseed with the latest data on restart
  await col.insertMany(seedData);
  console.log(`Seeded ${seedData.length} knowledge base entries.`);
}

async function getAllEntries() {
  const db = await connectDB();
  return db.collection('admissionInfo').find({}).toArray();
}

async function buildContextBlock() {
  const entries = await getAllEntries();
  return entries
    .map(
      (e) =>
        `Category: ${e.category}\nQ: ${e.question}\nA (English): ${e.answer_en}\nA (Somali): ${e.answer_so || 'N/A'}`
    )
    .join('\n\n');
}

// Common filler words to ignore when scoring matches (English + a few Somali equivalents)
const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'what', 'when', 'where', 'how', 'can', 'i',
  'to', 'for', 'of', 'in', 'on', 'and', 'or', 'my', 'me', 'you', 'your', 'it', 'be', 'will',
  'ma', 'waa', 'iyo', 'ku', 'ah', 'oo', 'ee', 'la', 'iyagoo', 'sida', 'miyaa'
]);

function tokenize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Simple keyword-overlap search against the knowledge base — no AI call needed.
// Used as a fallback when OpenRouter is rate-limited or unreachable.
async function searchLocal(query, lang = 'en') {
  const entries = await getAllEntries();
  const queryWords = tokenize(query);
  if (queryWords.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const entry of entries) {
    const haystack = tokenize(
      `${entry.category} ${entry.question} ${entry.answer_en} ${entry.answer_so || ''}`
    );
    const haystackSet = new Set(haystack);
    let score = 0;
    for (const w of queryWords) {
      if (haystackSet.has(w)) score++;
      // extra weight if the word appears in the question itself (closer match)
      if (tokenize(entry.question).includes(w)) score += 1.5;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // Require at least a modest match — avoids returning an unrelated entry for a totally off-topic question
  if (!best || bestScore < 1.5) return null;

  const answer = lang === 'so' ? best.answer_so || best.answer_en : best.answer_en;
  return { category: best.category, question: best.question, answer };
}

module.exports = { seed, getAllEntries, buildContextBlock, searchLocal };