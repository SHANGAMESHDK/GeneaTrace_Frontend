import { useState } from 'react';

// Languages for the public pages, where shoppers and pharmacy customers verify a product.
const STRINGS = {
  en: {
    verifyTitle: 'Verify a product',
    verifyHint: 'Point your camera at the GeneaTrace QR on the pack.',
    typeId: 'Or type the passport ID',
    verify: 'Verify',
    locationNote: 'Your approximate location (if you allow it) helps detect cloned labels. No personal data is stored.',
    scanAnother: 'Scan another',
    checking: 'Verifying against the ledger…',
    result: 'Verification result',
    report: 'Report a problem',
    whatToDo: 'What to do',
    todo1: 'Do not consume, use or resell this item.',
    todo2: 'Keep the packaging and the receipt; report it below so regulators can trace the source.',
    todo3: 'Buy only from sellers whose products verify on GeneaTrace.',
    nfcOk: 'The NFC chip on this pack is genuine.',
    sealNote: 'Also check that the seal on the pack is unbroken. A genuine code on an opened pack is not proof the contents are genuine.',
    verdict: {},
  },
  hi: {
    verifyTitle: 'उत्पाद की जाँच करें',
    verifyHint: 'अपना कैमरा पैक पर बने GeneaTrace QR की ओर करें।',
    typeId: 'या पासपोर्ट आईडी टाइप करें',
    verify: 'जाँचें',
    locationNote: 'आपका अनुमानित स्थान (यदि आप अनुमति दें) नकली लेबल पकड़ने में मदद करता है। कोई व्यक्तिगत जानकारी संग्रहीत नहीं की जाती।',
    scanAnother: 'दूसरा स्कैन करें',
    checking: 'लेजर से जाँच हो रही है…',
    result: 'जाँच का परिणाम',
    report: 'समस्या की रिपोर्ट करें',
    whatToDo: 'क्या करें',
    todo1: 'इस वस्तु का सेवन, उपयोग या पुनर्विक्रय न करें।',
    todo2: 'पैकेजिंग और रसीद संभालकर रखें; नीचे रिपोर्ट करें ताकि नियामक स्रोत का पता लगा सकें।',
    todo3: 'केवल उन्हीं विक्रेताओं से खरीदें जिनके उत्पाद GeneaTrace पर सत्यापित होते हैं।',
    nfcOk: 'इस पैक की NFC चिप असली है।',
    sealNote: 'यह भी देखें कि पैक की सील टूटी न हो। खुले पैक पर असली कोड होना इस बात का प्रमाण नहीं कि अंदर का सामान असली है।',
    verdict: {
      GENUINE: 'असली उत्पाद', COUNTERFEIT: 'नकली लेबल', TAMPERED: 'रिकॉर्ड से छेड़छाड़ हुई है', SUSPECTED_CLONE: 'संभावित नकली लेबल',
      RECALLED: 'वापस मँगाया गया – उपयोग न करें', LOCKED: 'डिवाइस लॉक है – गैर-असली पुर्जा', EXPIRED: 'समाप्त हो चुका है', SUSPICIOUS: 'संदिग्ध उत्पाद',
    },
  },
  ta: {
    verifyTitle: 'பொருளைச் சரிபார்க்கவும்',
    verifyHint: 'பொட்டலத்தில் உள்ள GeneaTrace QR குறியீட்டை நோக்கி கேமராவைக் காட்டவும்.',
    typeId: 'அல்லது பாஸ்போர்ட் ஐடியைத் தட்டச்சு செய்யவும்',
    verify: 'சரிபார்',
    locationNote: 'உங்கள் தோராயமான இருப்பிடம் (நீங்கள் அனுமதித்தால்) போலி லேபிள்களைக் கண்டறிய உதவுகிறது. தனிப்பட்ட தகவல்கள் எதுவும் சேமிக்கப்படுவதில்லை.',
    scanAnother: 'மற்றொன்றை ஸ்கேன் செய்',
    checking: 'பேரேட்டில் சரிபார்க்கப்படுகிறது…',
    result: 'சரிபார்ப்பு முடிவு',
    report: 'சிக்கலைப் புகாரளிக்கவும்',
    whatToDo: 'என்ன செய்ய வேண்டும்',
    todo1: 'இந்தப் பொருளை உட்கொள்ளவோ, பயன்படுத்தவோ, மறுவிற்பனை செய்யவோ வேண்டாம்.',
    todo2: 'பொட்டலத்தையும் ரசீதையும் பாதுகாத்து வைக்கவும்; ஒழுங்குமுறை அதிகாரிகள் மூலத்தைக் கண்டறிய கீழே புகாரளிக்கவும்.',
    todo3: 'GeneaTrace-இல் சரிபார்க்கப்படும் பொருட்களை விற்பவர்களிடம் மட்டுமே வாங்கவும்.',
    nfcOk: 'இந்தப் பொட்டலத்தில் உள்ள NFC சிப் உண்மையானது.',
    sealNote: 'பொட்டலத்தின் முத்திரை உடையாமல் உள்ளதா என்றும் பார்க்கவும். திறந்த பொட்டலத்தில் உண்மையான குறியீடு இருப்பது உள்ளே இருப்பது உண்மையானது என்பதற்கான சான்று அல்ல.',
    verdict: {
      GENUINE: 'உண்மையான பொருள்', COUNTERFEIT: 'போலி லேபிள்', TAMPERED: 'பதிவுகள் மாற்றப்பட்டுள்ளன', SUSPECTED_CLONE: 'போலி லேபிளாக இருக்கலாம்',
      RECALLED: 'திரும்பப் பெறப்பட்டது – பயன்படுத்த வேண்டாம்', LOCKED: 'சாதனம் பூட்டப்பட்டது – உண்மையற்ற பாகம்', EXPIRED: 'காலாவதியானது', SUSPICIOUS: 'சந்தேகத்திற்குரிய பொருள்',
    },
  },
};

const KEY = 'gt_lang';
const LANGS = [['en', 'English'], ['hi', 'हिन्दी'], ['ta', 'தமிழ்']];

function saved() {
  try {
    const l = localStorage.getItem(KEY);
    if (STRINGS[l]) return l;
  } catch {
    /* storage unavailable */
  }
  const browser = (navigator.language || 'en').slice(0, 2);
  return STRINGS[browser] ? browser : 'en';
}

export function useLang() {
  const [lang, setLang] = useState(saved);
  const choose = (l) => {
    setLang(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* storage unavailable */
    }
  };
  return { lang, choose, t: STRINGS[lang] };
}

export function LangPicker({ lang, choose, className }) {
  return (
    <select aria-label="Language" className={className} value={lang} onChange={(e) => choose(e.target.value)}>
      {LANGS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select>
  );
}
