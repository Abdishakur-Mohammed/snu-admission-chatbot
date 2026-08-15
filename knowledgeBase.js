const { connectDB } = require('./db');

// Real SNU admission data (sourced from official SNU site content, Aug 2026).
const seedData = [
  // ---------- GENERAL ----------
  {
    category: 'General',
    keywords: ['university', 'jaamacad', 'about', 'ku saabsan', 'somali national university', 'what is snu'],
    question: 'What is Somali National University (SNU)?',
    answer_en: 'Somali National University (SNU) is Somalia\'s national public university, offering undergraduate and postgraduate programmes across faculties including Agriculture, Economics & Management, Education, Engineering, Health Sciences, Languages, Law, Medicine & Surgery, Science, Sharia & Islamic Studies, Social Science, and Veterinary Medicine.',
    answer_so: 'Jaamacadda Ummadda Soomaaliyeed (SNU) waa jaamacadda qaranka ee Soomaaliya, waxayna bixisaa barnaamijyo heerka shahaadada koowaad iyo kuwa sare oo ay ka mid yihiin Kulliyadaha Beeraha, Dhaqaalaha iyo Maamulka, Waxbarashada, Injineerinka, Cilmiga Caafimaadka, Luqadaha, Sharciga, Caafimaadka iyo Qalliinka, Sayniska, Sharciga Islaamka, Cilmiga Bulshada, iyo Caafimaadka Xoolaha.'
  },

  // ---------- UNDERGRADUATE REQUIREMENTS ----------
  {
    category: 'Admission Requirements - Undergraduate',
    keywords: ['requirements', 'shuruudo', 'shuruudaha', 'undergraduate', 'eligibility', 'qualify', 'u qalma', 'heerka koowaad', 'bachelor'],
    question: 'What are the admission requirements for undergraduate programmes?',
    answer_en: 'Undergraduate applicants must:\n- Hold a recognized Somali Secondary School Certificate or equivalent\n- Meet the minimum entry requirements set by the Ministry of Education and SNU\n- Submit official academic transcripts and certificates\n- Provide a valid national ID or passport\n- Complete any required entrance exam or interview where applicable\n- Pay a non-refundable Registration & ID Card Fee of $55',
    answer_so: '**Shuruudaha Gelitaanka Heerka Shahaadada Koowaad (Undergraduate):**\n- Haystaan Shahaadada Dugsiga Sare ee la aqoonsan yahay ama mid la mid ah\n- Buuxiyaan shuruudaha ugu yar ee ay dejiyeen Wasaaradda Waxbarashada iyo SNU\n- Soo gudbiyaan warqadaha aqoonyahannimo iyo shahaadooyinka\n- Bixiyaan aqoonsi qaran ama baasaboor sax ah\n- Dhammeeystiraan imtixaan ama wareysi haddii loo baahdo\n- Bixiyaan Lacagta Diiwaangelinta iyo Kaarka Aqoonsiga oo ah $55 (aan la celin karin)'
  },

  // ---------- POSTGRADUATE REQUIREMENTS ----------
  {
    category: 'Admission Requirements - Postgraduate',
    keywords: ['postgraduate', 'masters', 'master', 'shahaadada sare', 'heerka sare', 'gpa', 'research proposal'],
    question: 'What are the admission requirements for postgraduate programmes?',
    answer_en: 'Postgraduate applicants must:\n- Hold a recognized Bachelor\'s degree from an accredited university\n- Meet the minimum GPA required by the respective faculty\n- Submit official academic transcripts\n- Provide recommendation letters where required\n- Submit a research proposal for research-based programmes\n- Attend an interview if requested by the faculty\n- Pay a non-refundable Registration & ID Card Fee of $50',
    answer_so: '**Shuruudaha Gelitaanka Heerka Shahaadada Sare (Postgraduate):**\n- Haystaan shahaadada Bachelor-ka oo laga qaatay jaamacad la aqoonsan yahay\n- Buuxiyaan GPA-ga ugu yar ee kulliyaddu dooneyso\n- Soo gudbiyaan warqadaha aqoonyahannimo\n- Bixiyaan warqadaha taageerada haddii loo baahdo\n- Soo gudbiyaan soo jeedin cilmi-baaris haddii barnaamijku yahay mid cilmi-baaris ku salaysan\n- Ka qaybgalaan wareysi haddii kulliyaddu dalbato\n- Bixiyaan Lacagta Diiwaangelinta iyo Kaarka Aqoonsiga oo ah $50'
  },

  // ---------- INTERNATIONAL APPLICANTS ----------
  {
    category: 'Admission Requirements - International',
    keywords: ['international', 'foreign', 'dibedda', 'abroad', 'ajnabi'],
    question: 'What do international applicants need to apply?',
    answer_en: 'International applicants are welcome and should provide:\n- Equivalent academic qualifications\n- Certified copies of academic documents\n- A passport copy\n- Proof of English language proficiency where required\n- Document authentication\n- A non-refundable Registration & ID Card Fee of $55',
    answer_so: '**Shuruudaha Codsadayaasha Dibedda (International):**\n- Shahaadooyin la mid ah kuwa halkan la baahan yahay\n- Nuqullo la xaqiijiyay oo dukumentiyada waxbarasho ah\n- Nuqul baasaboorka\n- Caddayn af-Ingiriisi haddii loo baahdo\n- Xaqiijinta dukumentiyada\n- Lacagta Diiwaangelinta iyo Kaarka Aqoonsiga oo ah $55'
  },

  // ---------- REGISTRATION / APPLICATION FEE ----------
  {
    category: 'Registration Fee',
    keywords: ['registration fee', 'registration and id', 'id card fee', 'application fee', 'before applying', 'fee before applying', 'pay before applying', 'is there a fee', 'do i have to pay', 'fee to apply', 'lacagta diiwaangelinta', 'lacagta codsiga', 'lacag ka hor codsiga'],
    question: 'Is there a fee I need to pay before or when applying?',
    answer_en: 'Yes. All applicants pay a non-refundable Registration & ID Card Fee as part of the application itself — a one-time payment, separate from the faculty Administrative Charge (which is billed every semester, only after being accepted):\n- Undergraduate applicants: $55\n- Postgraduate applicants: $50\n- International applicants: $55\n\nThis fee is paid during Step 5 of the application process ("Pay the application fee") and is required before your application can be considered complete.',
    answer_so: '**Lacagta Diiwaangelinta ee Codsiga:**\nHaa. Dhammaan codsadayaashu waa inay bixiyaan Lacagta Diiwaangelinta iyo Kaarka Aqoonsiga oo aan la celin karin — hal mar oo dhan, oo ka duwan Kharashka Maamulka ee kulliyadda (kaas oo la bixiyo semester kasta, kaliya ka dib markii la aqbalo):\n- Codsadayaasha heerka koowaad (Undergraduate): $55\n- Codsadayaasha heerka sare (Postgraduate): $50\n- Codsadayaasha dibedda (International): $55\n\nLacagtan waxaa la bixiyaa Tallaabada 5-aad ee codsiga ("Bixi lacagta codsiga"), waana shuruud ka hor inta codsigaagu dhammaystirmi karin.'
  },

  // ---------- TUITION & FEES BY FACULTY ----------
  {
    category: 'Fees',
    keywords: ['tuition', 'tuition fee', 'tuition fees', 'administrative charge', 'administrative fee', 'faculty fees', 'per faculty', 'lacagaha waxbarashada', 'kharashka', 'qiimaha', 'cost of studying', 'how much does it cost', 'semester fee', 'yearly fee'],
    question: 'What are the tuition fees and administrative charges per faculty?',
    answer_en: 'All undergraduate programmes at SNU are tuition-free. Students pay only an Administrative Charge specific to their faculty — billed **per semester**, not as a one-time total — plus the Registration & ID Card Fee (paid once, at application).\n\n**Duration and per-semester administrative charges by faculty:**\n- Faculty of Agriculture and Environmental Science — 4 years, $80/semester\n- Faculty of Economic and Management Science — 4 years, $80/semester\n- Faculty of Education — 4 years, $50/semester\n- Faculty of Engineering — 4 years, $125/semester\n- Faculty of Health Sciences and Tropical Medicine — 4 years, $100/semester\n- Faculty of Languages — 4 years, $80/semester\n- Faculty of Law — 4 years, $80/semester\n- Faculty of Medicine and Surgery — 6 years, $125/semester\n- Faculty of Science — 4 years, $125/semester\n- Faculty of Sharia and Islamic Studies — 4 years, $50/semester\n- Faculty of Social Science — 4 years, $80/semester\n- Faculty of Veterinary Medicine and Animal Husbandry — 5 years, $80/semester',
    answer_so: 'Dhammaan barnaamijyada heerka shahaadada koowaad ee SNU waa lacag-la\'aan (tuition-free). Ardayda waxay bixiyaan kaliya Kharashka Maamulka ee kulliyaddooda gaarka ah — oo la bixiyo **semester kasta**, ee aan ahayn hal mar oo dhan — iyo Lacagta Diiwaangelinta (oo hal mar la bixiyo, marka la codsanayo).\n\n**Muddada iyo kharashka maamulka ee semesterka kulliyad kasta:**\n- Beeraha iyo Deegaanka — 4 sano, $80/semester\n- Dhaqaalaha iyo Maamulka — 4 sano, $80/semester\n- Waxbarashada — 4 sano, $50/semester\n- Injineerinka — 4 sano, $125/semester\n- Caafimaadka iyo Cudurada Kuleylaha — 4 sano, $100/semester\n- Luqadaha — 4 sano, $80/semester\n- Sharciga — 4 sano, $80/semester\n- Caafimaadka iyo Qalliinka — 6 sano, $125/semester\n- Sayniska — 4 sano, $125/semester\n- Sharciga Islaamka — 4 sano, $50/semester\n- Cilmiga Bulshada — 4 sano, $80/semester\n- Caafimaadka Xoolaha — 5 sano, $80/semester'
  },

  // ---------- FOUNDATION PROGRAM & EAP ----------
  {
    category: 'Foundation Programme',
    keywords: ['foundation', 'aasaas', 'eap', 'english for academic purposes', 'ingiriisiga'],
    question: 'Is there a compulsory foundation programme before starting a degree?',
    answer_en: 'Yes. All undergraduate applicants must successfully complete the Foundation Programme before beginning their degree studies. This includes English for Academic Purposes (EAP), which has 5 levels and costs a total of $350. Students must complete all five EAP levels before progressing to their academic programme, unless exempted under the University\'s placement policy.',
    answer_so: 'Haa. Dhammaan codsadayaasha heerka koowaad waa inay si guul leh u dhammeeyaan Barnaamijka Aasaaska ka hor inta aysan bilaabin shahaadadooda. Tan waxaa ku jira Ingiriisiga Ujeeddooyinka Waxbarasho (EAP), oo leh 5 heer oo wadar ahaan qiimahiisu yahay $350. Ardaydu waa inay dhammeeyaan shantaba heer ee EAP ka hor inta aysan u gudbin barnaamijkooda, marka laga reebo kuwa laga saaray sida siyaasadda su\'aalaha ay jaamacaddu dejisay.'
  },

  // ---------- STUDY MODES ----------
  {
    category: 'Study Options',
    keywords: ['full-time', 'part-time', 'evening', 'weekend', 'waqti-buuxa', 'waqti-qeyb', 'schedule', 'jadwal'],
    question: 'What study modes does SNU offer — full-time or part-time?',
    answer_en: 'SNU offers Full-Time Study (regular daytime classes, suited for secondary school graduates, full-time students, and scholarship recipients) and Part-Time Study (evening classes and weekend classes for selected programmes, designed for working professionals and students needing flexible schedules).',
    answer_so: 'SNU waxay bixisaa Waxbarasho Waqti-buuxa (fasallada maalinlaha ah, ku habboon kuwa ka qalin jabiyay dugsiga sare, ardayda waqtiga buuxa, iyo kuwa deeqda waxbarasho helay) iyo Waxbarasho Waqti-qeyb (fasallo fiidnimo iyo fasallo weekend ah oo loogu talagalay dadka shaqeeya ee u baahan jadwal dabacsan).'
  },

  // ---------- HOW TO APPLY ----------
  {
    category: 'Application Process',
    keywords: ['apply', 'how to apply', 'application process', 'sida loo codsado', 'codsiga', 'steps', 'tallaabooyin', 'how do i apply'],
    question: 'How do I apply to SNU, step by step?',
    answer_en: '1. Choose your preferred programme from the available faculties\n2. Review the admission requirements carefully\n3. Prepare all required documents (academic certificates, academic transcripts, passport-sized photographs, national ID or birth certificate)\n4. Complete the online application form or submit a printed application through the Admission Office\n5. Pay the application fee\n6. Submit your application before the stated deadline\n7. Track your application status and wait for the admission decision',
    answer_so: '1. Dooro barnaamijka aad doorbidayso ee kulliyadaha la heli karo\n2. Si taxadar leh u eeg shuruudaha gelitaanka\n3. Diyaari dhammaan dukumentiyada loo baahan yahay (shahaadooyin, warqadaha aqoonyahannimo, sawirro, aqoonsi qaran ama shahaadada dhalashada)\n4. Buuxi foomka codsiga ee onlaynka ah ama gudbi foom daabacan xafiiska Diiwaangelinta\n5. Bixi lacagta codsiga\n6. Gudbi codsigaaga ka hor taariikhda kama dambaysta ah\n7. La soco heerka codsigaaga oo sug go\'aanka gelitaanka'
  },

  // ---------- APPLICATION FORM ----------
  {
    category: 'Application Form',
    keywords: ['application form', 'foomka codsiga', 'form', 'foom'],
    question: 'What information does the application form require?',
    answer_en: 'The official application form (available through the University\'s Online Admission Portal or as a printed form from the Admission Office) requires:\n- Personal information\n- Contact details\n- Educational background\n- Programme selection\n- Emergency contact information\n- Uploaded supporting documents\n\nApplicants should ensure all information is accurate and complete — incomplete applications may delay processing or result in rejection.',
    answer_so: 'Foomka rasmiga ah ee codsiga (oo laga heli karo Portal-ka Onlaynka ee Diiwaangelinta ama nuqul daabacan oo laga helo Xafiiska Diiwaangelinta) wuxuu u baahan yahay:\n- Xogta shakhsiga\n- Xiriirka\n- Taariikhda waxbarasho\n- Doorashada barnaamijka\n- Xogta xiriirka xaaladaha degdegga ah\n- Dukumentiyada taageerada oo la soo geliyay\n\nCodsadayaashu waa inay hubiyaan in xogta oo dhami sax tahay oo dhammaystiran tahay — codsiyada aan dhammaystirnayn waxay dib u dhigi karaan habaynta ama keeni karaan diidmo.'
  },

  // ---------- DEADLINES ----------
  {
    category: 'Deadlines',
    keywords: ['deadline', 'deadlines', 'taariikhaha', 'taariikhda', 'when does', 'goorma', 'close', 'open', 'furan', 'xiran'],
    question: 'When does admission open and close, and what is the application deadline?',
    answer_en: 'Admission for the current cycle is open from August 1, 2026 to September 24, 2026. Applicants must submit their completed application, required documents, and fees before September 24, 2026 to be considered. Students are encouraged to apply early, as some faculties or programmes may fill available spots before the deadline.',
    answer_so: 'Gelitaanka xilligan wuxuu furan yahay laga bilaabo Ogosto 1, 2026 ilaa Sebtembar 24, 2026. Codsadayaashu waa inay soo gudbiyaan codsigooda oo dhammaystiran, dukumentiyada loo baahan yahay, iyo lacagaha ka hor Sebtembar 24, 2026 si loo tixgeliyo. Ardayda waxaa lagula talinayaa inay hore u codsadaan, maadaama kulliyado ama barnaamijyo qaar ay buuxin karaan boosaska ka hor taariikhda kama dambaysta ah.'
  },

  // ---------- ACADEMIC CALENDAR ----------
  {
    category: 'Academic Calendar',
    keywords: ['calendar', 'jadwalka', 'academic calendar', 'sannadlaha', 'semester', 'exam dates'],
    question: 'What does the Academic Calendar cover and where can I find deadlines?',
    answer_en: 'The Academic Calendar outlines important dates including:\n- Admission application periods\n- Entrance examinations\n- Registration dates\n- Semester commencement\n- Course add/drop deadlines\n- Mid-semester examinations\n- Final examinations\n- Graduation ceremonies\n- Public holidays and academic breaks\n\nStudents are encouraged to regularly consult the Academic Calendar for exact current dates, as these change each cycle.',
    answer_so: 'Jadwalka Sannadlaha ah wuxuu soo bandhigayaa taariikhaha muhiimka ah oo ay ka mid yihiin:\n- Xilliyada codsiga gelitaanka\n- Imtixaannada gelitaanka\n- Taariikhaha diiwaangelinta\n- Bilowga semester-ka\n- Taariikhaha kama-dambaysta ah ee ku darsiga/ka-baxa koorsooyinka\n- Imtixaannada dhexe\n- Imtixaannada kama dambaysta ah\n- Xafladaha qalin-jabinta\n- Fasaxyada guud\n\nArdayda waxaa lagu dhiirigelinayaa inay si joogto ah u eegaan Jadwalka Sannadlaha ah si ay u helaan taariikhaha saxda ah, maadaama ay isbeddelaan xilli kasta.'
  },

  // ---------- CONTACT ----------
  {
    category: 'Contact',
    keywords: ['contact', 'xiriir', 'la xiriir', 'email', 'phone', 'help', 'caawimo'],
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
// Curated `keywords` on each entry (bilingual, includes chip/card labels) are the
// PRIMARY signal — they're deliberately chosen to match common phrasings in either
// language. Generic word overlap (shared vocabulary between the query and an entry's
// full text) is only a small tiebreaker, not a competing score — otherwise entries
// that happen to share boilerplate words (e.g. two entries both mentioning "SNU" or
// "undergraduate") can outrank the entry a keyword was deliberately written to match.
async function searchLocal(query, lang = 'en') {
  const entries = await getAllEntries();
  const queryWords = tokenize(query);
  if (queryWords.length === 0) return null;

  const rawQuery = query.toLowerCase();
  let best = null;
  let bestKeywordScore = -1;
  let bestOverlapScore = -1;

  for (const entry of entries) {
    const generalHaystack = tokenize(
      `${entry.category} ${entry.question} ${entry.answer_en} ${entry.answer_so || ''}`
    );
    const haystackSet = new Set(generalHaystack);
    const keywordList = entry.keywords || [];

    let keywordScore = 0;
    for (const kw of keywordList) {
      if (rawQuery.includes(kw.toLowerCase())) keywordScore += 1;
    }

    let overlapScore = 0;
    for (const w of queryWords) {
      if (haystackSet.has(w)) overlapScore += 1;
      if (tokenize(entry.question).includes(w)) overlapScore += 1.5;
    }

    // Rank primarily by keyword hits; only use overlap to break a tie between
    // entries with the same keyword score (including zero keyword hits).
    const better =
      keywordScore > bestKeywordScore ||
      (keywordScore === bestKeywordScore && overlapScore > bestOverlapScore);

    if (better) {
      bestKeywordScore = keywordScore;
      bestOverlapScore = overlapScore;
      best = entry;
    }
  }

  // Require a real signal — at least one deliberate keyword hit, or a reasonably
  // strong generic overlap if no entry had any keyword match at all.
  const confident = bestKeywordScore >= 1 || bestOverlapScore >= 3;
  if (!best || !confident) return null;

  // Combined score reported back to the caller (used against STRONG_MATCH_THRESHOLD
  // in server.js) — keyword hits weighted heavily, overlap as a smaller addition.
  const combinedScore = bestKeywordScore * 4 + Math.min(bestOverlapScore, 3) * 0.5;

  const answer = lang === 'so' ? best.answer_so || best.answer_en : best.answer_en;
  return { category: best.category, question: best.question, answer, score: combinedScore };
}

module.exports = { seed, getAllEntries, buildContextBlock, searchLocal };