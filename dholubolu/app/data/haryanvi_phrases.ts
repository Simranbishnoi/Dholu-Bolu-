export interface HaryanviPhrasesType {
  welcome: string[];
  before_recording: string[];
  high_score: string[];
  medium_score: string[];
  low_score: string[];
  streaks: {
    "3_days": string;
    "7_days": string;
    "30_days": string;
  };
  achievement_unlock: string[];
  funny_reactions: string[];
  signature_phrases: string[];
}

export const haryanviPhrases: {
  latin: HaryanviPhrasesType;
  devanagari: HaryanviPhrasesType;
} = {
  latin: {
    welcome: [
      "Ram Ram Bhai! Aaj jeebh ki kasrat karange.",
      "Chal pher, shuru kariye aaj ka twister!",
      "Oh ho! Aaj to maja aavega.",
      "Taiyar sae ke? Jeebh nacha de!",
      "Dekhoon kitni saaf bol sake sae tu."
    ],
    before_recording: [
      "Ghabraiye mat, aaram te bolo.",
      "Ekdam badhiya, ab record dabao.",
      "Dhyan te boliye, jaldi ki jaroorat na sae.",
      "Chal bhai, dikha de talent.",
      "Jeebh phisalni na chahiye aaj."
    ],
    high_score: [
      "Wah bhai wah! Kamaal kar diya.",
      "Ek number! Bilkul saaf bola.",
      "Aaj to tu chha gaya.",
      "Ke baat sae! Professional lag raha sae.",
      "Badhiya! Aise hi chaaloo rakh."
    ],
    medium_score: [
      "Achha tha, thoda aur dam laga.",
      "Bas thoda sa aur abhyas chahiye.",
      "Kaam to badhiya kar raha sae.",
      "Agli baar aur badhiya hoga.",
      "Thodi si mehnat aur, phir tu top pe."
    ],
    low_score: [
      "Koi na bhai, pehli baar mein kaun master banta sae.",
      "Pher koshish kar, ho jayega.",
      "Ghabrane ki jaroorat na sae.",
      "Abhyas kar, sab set ho jayega.",
      "Jeebh thodi ulajh gayi thi, pher kar le."
    ],
    streaks: {
      "3_days": "Teen din lagataar! Badhiya chaal sae.",
      "7_days": "Saat din ho gaye bhai, maja aa gaya.",
      "30_days": "Oh teri! Poora maheena lagataar."
    },
    achievement_unlock: [
      "Nayi upalabdhi khul gayi bhai!",
      "Badhai ho! Ek aur badge mil gaya.",
      "Aaj to record tod diya.",
      "Maja aa gaya! Tu to expert ban raha sae."
    ],
    funny_reactions: [
      "Are bhai, jeebh sae ya rassi?",
      "Itni ulajhi kaise jeebh?",
      "Main bhi confuse ho gaya.",
      "Ek baar aur kar, is baar jamke."
    ],
    signature_phrases: [
      "Ram Ram! Bol saaf, ban laajawab.",
      "Ghabrana koni, abhyas kar aur chamak ja."
    ]
  },
  devanagari: {
    welcome: [
      "राम राम भाई! आज जीभ की कसरत करांगे।",
      "चल फेर, शुरू करिये आज का ट्विस्टर!",
      "ओ हो! आज तो मजा आवेगा।",
      "तैयार सै के? जीभ नचा दे!",
      "देखूं कितनी साफ बोल सके सै तू।"
    ],
    before_recording: [
      "घबराइए मत, आराम ते बोलो।",
      "एकदम बढ़िया, अब रिकॉर्ड दबाओ।",
      "ध्यान ते बोलिए, जल्दी की जरूरत ना सै।",
      "चल भाई, दिखा दे टैलेंट।",
      "जीभ फिसलनी ना चाहिए आज।"
    ],
    high_score: [
      "वाह भाई वाह! कमाल कर दिया।",
      "एक नंबर! बिल्कुल साफ बोला।",
      "आज तो तू छा गया।",
      "के बात सै! प्रोफेशनल लग रहा सै।",
      "बढ़िया! ऐसे ही चालू रख।"
    ],
    medium_score: [
      "अच्छा था, थोड़ा और दम लगा।",
      "बस थोड़ा सा और अभ्यास चाहिए।",
      "काम तो बढ़िया कर रहा सै।",
      "अगली बार और बढ़िया होगा।",
      "थोड़ी सी मेहनत और, फिर तू टॉप पे।"
    ],
    low_score: [
      "कोई ना भाई, पहली बार में कौन मास्टर बनता सै।",
      "फेर कोशिश कर, हो जाएगा।",
      "घबराने की जरूरत ना सै।",
      "अभ्यास कर, सब सेट हो जाएगा।",
      "जीभ थोड़ी उलझ गई थी, फेर कर ले।"
    ],
    streaks: {
      "3_days": "तीन दिन लगातार! बढ़िया चाल सै।",
      "7_days": "सात दिन हो गए भाई, मजा आ गया।",
      "30_days": "ओ तेरी! पूरा महीना लगातार।"
    },
    achievement_unlock: [
      "नई उपलब्धि खुल गई भाई!",
      "बधाई हो! एक और बैज मिल गया।",
      "आज तो रिकॉर्ड तोड़ दिया।",
      "मजा आ गया! तू तो एक्सपर्ट बन रहा सै।"
    ],
    funny_reactions: [
      "अरे भाई, जीभ सै या रस्सी?",
      "इतनी उलझी कैसे जीभ?",
      "मैं भी कन्फ्यूज हो गया।",
      "एक बार और कर, इस बार जमके।"
    ],
    signature_phrases: [
      "राम राम! बोल साफ, बन लाजवाब।",
      "घबराना कोनी, अभ्यास कर और चमक जा।"
    ]
  }
};
