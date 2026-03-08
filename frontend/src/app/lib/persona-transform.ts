import type { AgentPersona, ChatMessage } from './types';

// ---------------------------------------------------------------------------
// Tone modifier phrases (multilingual)
// ---------------------------------------------------------------------------

const WARM_OPENERS: Record<string, readonly string[]> = {
  en: ['Love that question!', 'Great question!', 'Happy to help with that!', 'Glad you asked!', 'Oh, good one!'],
  es: ['¡Me encanta esa pregunta!', '¡Buena pregunta!', '¡Con gusto te ayudo!', '¡Me alegra que preguntes!'],
  fr: ['J\'adore cette question !', 'Bonne question !', 'Ravi de vous aider !', 'Content que vous demandiez !'],
  pt: ['Adoro essa pergunta!', 'Boa pergunta!', 'Feliz em ajudar!', 'Que bom que perguntou!'],
  de: ['Tolle Frage!', 'Gute Frage!', 'Gerne helfe ich!', 'Schön, dass du fragst!'],
  zh: ['好问题！', '很高兴能帮到你！', '很棒的问题！', '问得好！'],
  ko: ['좋은 질문이에요!', '기꺼이 도와드릴게요!', '물어봐 주셔서 좋아요!'],
  ja: ['いい質問ですね！', 'お手伝いできて嬉しいです！', 'いい質問です！'],
  vi: ['Câu hỏi hay lắm!', 'Rất vui được giúp bạn!', 'Hay quá!', 'Cảm ơn bạn đã hỏi!'],
  th: ['คำถามดีมากเลย!', 'ยินดีช่วยเลยค่ะ!', 'ถามดีมาก!', 'ดีใจที่ถามเลย!'],
  hi: ['बहुत अच्छा सवाल!', 'खुशी से मदद करूँगा!', 'अच्छा सवाल!', 'पूछने के लिए शुक्रिया!'],
  tl: ['Magandang tanong!', 'Masaya akong makatulong!', 'Tama \'yan!', 'Salamat sa pagtatanong!'],
};

const HIGH_ENERGY_TAGS: Record<string, readonly string[]> = {
  en: ["Let's go!", "You're going to love this!", "This is the fun part!", "Here's the exciting bit!"],
  es: ['¡Vamos!', '¡Te va a encantar!', '¡Esta es la parte emocionante!'],
  fr: ["C'est parti !", 'Vous allez adorer !', "C'est la partie fun !"],
  pt: ['Vamos lá!', 'Você vai adorar!', 'Essa é a parte emocionante!'],
  de: ["Los geht's!", 'Das wird dir gefallen!', 'Jetzt wird es spannend!'],
  zh: ['开始吧！', '你会喜欢的！', '这是最精彩的部分！'],
  ko: ['가볼까요!', '마음에 드실 거예요!', '재미있는 부분이에요!'],
  ja: ['さあ始めましょう！', 'きっと気に入りますよ！', 'ここが楽しい部分です！'],
  vi: ['Bắt đầu thôi!', 'Bạn sẽ thích lắm đấy!', 'Đây là phần thú vị nhất!'],
  th: ['ไปกันเลย!', 'คุณจะชอบมาก!', 'นี่คือส่วนที่สนุก!'],
  hi: ['चलो शुरू करते हैं!', 'आपको बहुत पसंद आएगा!', 'यही तो मज़ेदार हिस्सा है!'],
  tl: ['Tara na!', 'Magugustuhan mo \'to!', 'Ito ang exciting part!'],
};

const HUMOR_ASIDES: Record<string, readonly string[]> = {
  en: ['(No pressure, just results.)', '(We promise, it is easier than you think.)', '(Zero judgment, maximum glow.)', '(We keep it real.)', '(Spoiler: it is worth it.)'],
  es: ['(Sin presión, solo resultados.)', '(Prometido, es más fácil de lo que piensas.)', '(Cero juicios, máximo brillo.)'],
  fr: ['(Pas de pression, juste des résultats.)', '(Promis, personne ne juge.)', '(Zéro jugement, résultats max.)'],
  pt: ['(Sem pressão, só resultados.)', '(Prometemos, é mais fácil do que parece.)', '(Zero julgamento, máximo brilho.)'],
  de: ['(Kein Druck, nur Ergebnisse.)', '(Versprochen, einfacher als gedacht.)', '(Null Bewertung, maximaler Glow.)'],
  zh: ['（没有压力，只有效果。）', '（放心，比你想的简单多了。）', '（零压力，最大光彩。）'],
  ko: ['(부담 없이, 결과만 있어요.)', '(진짜 생각보다 쉬워요.)', '(부담 제로, 효과 최대.)'],
  ja: ['（プレッシャーゼロ、結果だけ。）', '（思ったより簡単ですよ。）', '（正直にいきます。）'],
  vi: ['(Không áp lực, chỉ có kết quả.)', '(Hứa luôn, dễ hơn bạn nghĩ nhiều.)', '(Không áp lực, hiệu quả tối đa.)'],
  th: ['(ไม่กดดัน มีแต่ผลลัพธ์ค่ะ.)', '(สัญญา ง่ายกว่าที่คิด.)', '(ไม่กดดัน ได้ผลเต็มที่.)'],
  hi: ['(कोई pressure नहीं, बस results.)', '(वादा, सोचने से ज़्यादा आसान है.)', '(ज़ीरो pressure, maximum glow.)'],
  tl: ['(Walang pressure, results lang.)', '(Promise, mas madali kaysa iniisip mo.)', '(Zero judgment, max glow.)'],
};

// ---------------------------------------------------------------------------
// English-only formality replacements
// ---------------------------------------------------------------------------

const FORMAL_REPLACEMENTS: [RegExp, string][] = [
  [/\bI would\b/g, 'I would recommend'],
  [/\bYou got it\b/g, 'Absolutely'],
  [/\bgot you covered\b/g, 'have you covered'],
  [/\bsuper\b/gi, 'excellent'],
];

const CASUAL_REPLACEMENTS: [RegExp, string][] = [
  [/\bAbsolutely\b/g, 'Totally'],
  [/\bI would recommend\b/g, "I'd say"],
  [/\bdo not\b/g, "don't"],
  [/\bwill not\b/g, "won't"],
  [/\bcannot\b/g, "can't"],
  [/\bis not\b/g, "isn't"],
  [/\bare not\b/g, "aren't"],
];

const EMOJI_MAP: Record<string, string> = {
  pricing: '\uD83D\uDCB0',
  services: '\u2728',
  hours: '\u23F0',
  consultation: '\uD83D\uDCCB',
  'first-visit': '\u2705',
  treatments: '\u2728',
  injectables: '\uD83D\uDC89',
  offer: '\uD83C\uDF9F\uFE0F',
  recommendation: '\u2B50',
  compare: '\uD83D\uDD0D',
  location: '\uD83D\uDCCD',
  greeting: '\uD83D\uDC4B',
  thanks: '\uD83D\uDE4F',
  provider: '\uD83D\uDC69\u200D\u2695\uFE0F',
  complimentary: '\uD83C\uDF81',
  essential: '\u2728',
  premium: '\uD83D\uDC8E',
  luxury: '\uD83D\uDC51',
};

// ---------------------------------------------------------------------------
// Full response translations by intent
// ---------------------------------------------------------------------------

const FULL_TRANSLATIONS: Record<string, Record<string, string>> = {
  services: {
    es: 'Para empezar, te recomiendo probar nuestros tratamientos faciales - son ideales para conocer la experiencia NakedMD. Microagujas y peelings químicos son excelentes opciones para después, cuando ya conozcas tu plan de tratamiento personalizado.',
    fr: 'Pour commencer, je te recommande nos soins du visage - c\'est idéal pour découvrir l\'expérience NakedMD. Le microneedling et les peelings chimiques sont d\'excellentes options pour la suite.',
    pt: 'Para começar, recomendo nossos tratamentos faciais - são ideais para conhecer a experiência NakedMD. Microagulhamento e peelings químicos são ótimas opções para depois.',
    de: 'Zum Einstieg empfehle ich unsere Gesichtsbehandlungen - ideal um die NakedMD-Erfahrung kennenzulernen. Microneedling und chemische Peelings sind tolle Optionen danach.',
    zh: '我建议你先从我们的面部护理开始——非常适合体验NakedMD。等你熟悉之后，可以再试试微针和化学焕肤。',
    ko: '먼저 저희 페이셜 트리트먼트를 추천드려요 — NakedMD 경험을 알기에 딱 맞아요. 익숙해지면 마이크로니들링과 화학 필링도 해보세요.',
    ja: 'まずフェイシャルトリートメントから始めるのがおすすめです。NakedMDの体験を知るのに最適です。慣れたらマイクロニードリングとケミカルピーリングも試してみてください。',
    vi: 'Mình khuyên bạn nên bắt đầu với các liệu trình chăm sóc da mặt — rất phù hợp để trải nghiệm NakedMD. Khi đã quen rồi, bạn có thể thử thêm vi kim và peel da hóa học.',
    th: 'แนะนำให้เริ่มจากทรีทเมนต์ดูแลผิวหน้าเลยค่ะ — เหมาะสำหรับทำความรู้จักประสบการณ์ NakedMD พอคุ้นแล้วลองไมโครนีดลิงกับเคมิคัลพีลได้เลย',
    hi: 'मैं सुझाव दूँगा कि हमारे फेशियल ट्रीटमेंट से शुरू करें — NakedMD अनुभव जानने के लिए बिल्कुल सही है। जब सहज हो जाएँ, तो माइक्रोनीडलिंग और केमिकल पील भी ट्राई करें।',
    tl: 'Ang rekomendasyon ko, mag-start ka sa facial treatments namin — perfect ito para makilala ang NakedMD experience. Pag sanay ka na, i-try mo rin ang microneedling at chemical peels.',
  },
  pricing: {
    es: 'Te lo resumo: Essential desde $150/sesión incluye faciales, peelings y dermaplaneo. Premium desde $250/sesión es el mejor valor con neurotoxinas y microagujas. Luxury desde $450/sesión es el paquete completo con rellenos e inyectables avanzados.',
    fr: 'En résumé : Essential à partir de 150$/séance pour les soins de base, Premium à 250$/séance c\'est le meilleur rapport qualité-prix avec neurotoxines et microneedling, et Luxury à 450$/séance c\'est le package complet avec fillers.',
    pt: 'Resumindo: Essential a partir de $150/sessão para cuidados básicos, Premium a partir de $250/sessão é o melhor custo-benefício com neurotoxinas e microagulhamento, e Luxury a partir de $450/sessão é o pacote completo com preenchimentos.',
    de: 'Kurz zusammengefasst: Essential ab $150/Sitzung für Basispflege, Premium ab $250/Sitzung bietet das beste Preis-Leistungs-Verhältnis mit Neurotoxinen und Microneedling, und Luxury ab $450/Sitzung ist das Komplettpaket mit Fillern.',
    zh: '简单说一下：Essential每次$150起，包括面部护理和焕肤。Premium每次$250起，性价比最高，包含肉毒素和微针。Luxury每次$450起，是完整的填充和高级注射套餐。',
    ko: '간단히 정리하면: Essential은 $150/회부터 기본 스킨케어, Premium은 $250/회부터 뉴로톡신과 마이크로니들링 포함, Luxury는 $450/회부터 필러와 고급 시술이 포함된 풀 패키지예요.',
    ja: '簡単にまとめると：Essentialは1回$150からのベーシックケア、Premiumは1回$250からのニューロトキシンとマイクロニードリング付きベストバリュー、Luxuryは1回$450からのフィラー付きフルパッケージです。',
    vi: 'Tóm tắt nhanh: Essential từ $150/buổi cho chăm sóc cơ bản, Premium từ $250/buổi là lựa chọn đáng giá nhất với botox và vi kim, còn Luxury từ $450/buổi là gói hoàn chỉnh có filler và tiêm nâng cao.',
    th: 'สรุปสั้นๆ ค่ะ: Essential $150/ครั้ง สำหรับการดูแลพื้นฐาน, Premium $250/ครั้ง คุ้มค่าที่สุดพร้อมนิวโรท็อกซินและไมโครนีดลิง, Luxury $450/ครั้ง คือแพ็คเกจครบจบพร้อมฟิลเลอร์',
    hi: 'संक्षेप में: Essential $150/सेशन से बेसिक स्किनकेयर के लिए, Premium $250/सेशन से न्यूरोटॉक्सिन और माइक्रोनीडलिंग के साथ सबसे अच्छा वैल्यू, और Luxury $450/सेशन से फिलर्स के साथ पूरा पैकेज है।',
    tl: 'Ito ang breakdown: Essential ay $150/session para sa basic skincare, Premium sa $250/session ang pinakasulit na may neurotoxins at microneedling, at Luxury sa $450/session ang complete package na may fillers.',
  },
  compare: {
    es: 'Así se comparan: Essential te da los cuidados esenciales de la piel a buen precio, Premium es donde la mayoría termina porque incluye neurotoxinas y microagujas, y Luxury es para quien quiere rellenos y paquetes personalizados.',
    fr: 'Voici la comparaison : Essential couvre les soins de base, Premium c\'est là où la plupart des clients atterrissent car les neurotoxines font la différence, et Luxury c\'est pour ceux qui veulent des fillers et des packages sur mesure.',
    pt: 'A comparação: Essential te dá os cuidados essenciais, Premium é onde a maioria acaba porque o valor com neurotoxinas é real, e Luxury é para quem quer preenchimentos e pacotes personalizados.',
    de: 'Der Vergleich: Essential deckt die Basispflege günstig ab, Premium ist wo die meisten landen weil Neurotoxine den Unterschied machen, und Luxury ist für Filler und maßgeschneiderte Pakete.',
    zh: '对比一下：Essential价格实惠提供基础护肤，Premium是大多数客户的选择因为肉毒素和微针确实值得，Luxury适合想要填充和定制方案的人。',
    ko: '비교해보면: Essential은 합리적인 가격으로 기본 스킨케어, Premium은 뉴로톡신과 마이크로니들링으로 가성비가 확실해서 대부분 여기로 가요, Luxury는 필러와 커스텀 패키지를 원하는 분들을 위한 거예요.',
    ja: '比較するとこうです：Essentialはお手頃価格で基本ケア、Premiumはニューロトキシンの価値が大きいので多くの方がここに落ち着きます、Luxuryはフィラーとカスタムパッケージが欲しい方向けです。',
    vi: 'So sánh nhanh: Essential cho bạn chăm sóc cơ bản với giá hợp lý, Premium là nơi hầu hết khách hàng chọn vì botox và vi kim thực sự xứng đáng, và Luxury dành cho ai muốn filler và gói tùy chỉnh.',
    th: 'เปรียบเทียบดูค่ะ: Essential ให้การดูแลพื้นฐานในราคาดี, Premium คือตัวเลือกยอดนิยมเพราะนิวโรท็อกซินคุ้มค่าจริงๆ, Luxury สำหรับคนที่ต้องการฟิลเลอร์และแพ็คเกจพิเศษ',
    hi: 'तुलना इस तरह है: Essential बजट-फ्रेंडली बेसिक स्किनकेयर देता है, Premium वहाँ है जहाँ ज़्यादातर क्लाइंट जाते हैं क्योंकि न्यूरोटॉक्सिन और माइक्रोनीडलिंग सच में वैल्यू है, और Luxury फिलर्स और कस्टम पैकेज चाहने वालों के लिए है।',
    tl: 'Ganito ang comparison: Essential ang mga basic skincare sa magandang presyo, Premium ang pinipili ng karamihan dahil sulit talaga ang neurotoxins, at Luxury para sa mga gusto ng fillers at custom packages.',
  },
  recommendation: {
    es: 'Para tus objetivos estéticos, te recomiendo una consulta personalizada. Tu proveedor creará el plan perfecto con la mejor combinación de tratamientos y flexibilidad. Es lo que le diría a una amiga.',
    fr: 'Pour vos objectifs esthétiques, je recommande une consultation personnalisée. Votre prestataire créera le plan parfait avec la meilleure combinaison de traitements. C\'est ce que je dirais à une amie.',
    pt: 'Para seus objetivos estéticos, recomendo uma consulta personalizada. Seu provedor criará o plano perfeito com a melhor combinação de tratamentos. É o que eu diria a uma amiga.',
    de: 'Für Ihre ästhetischen Ziele empfehle ich eine persönliche Beratung. Ihr Anbieter erstellt den perfekten Plan mit der besten Behandlungskombination. Das würde ich auch einer Freundin empfehlen.',
    zh: '对于你的美容目标，我推荐个性化咨询。你的医师会为你制定最佳治疗方案。这也是我会推荐给朋友的。',
    ko: '미용 목표를 위해 개인 맞춤 상담을 추천해요. 담당 의료진이 최고의 치료 조합으로 완벽한 플랜을 만들어 드릴 거예요. 친구에게도 이걸 추천할 거예요.',
    ja: '美容目標には、パーソナライズされたカウンセリングをおすすめします。担当者が最適な治療の組み合わせでプランを作成します。友達にも同じことを勧めます。',
    vi: 'Cho mục tiêu thẩm mỹ của bạn, mình khuyên tư vấn cá nhân. Bác sĩ sẽ tạo kế hoạch hoàn hảo với sự kết hợp tốt nhất các liệu trình. Mình cũng sẽ khuyên bạn bè như vậy.',
    th: 'สำหรับเป้าหมายความงามของคุณ แนะนำให้ปรึกษาส่วนตัวเลยค่ะ ผู้ให้บริการจะออกแบบแผนที่ดีที่สุดให้ เพื่อนมาถามก็แนะนำเหมือนกัน',
    hi: 'आपके सौंदर्य लक्ष्यों के लिए, मेरी सिफ़ारिश व्यक्तिगत परामर्श है। आपके प्रोवाइडर सबसे अच्छे ट्रीटमेंट कॉम्बिनेशन से परफेक्ट प्लान बनाएंगे। यही मैं अपनी दोस्त को भी बताऊँगा।',
    tl: 'Para sa aesthetic goals mo, personalized consultation ang recommendation ko. Gagawa ang provider mo ng perfect plan na may pinakamabuting combination ng treatments. Ito rin ang sasabihin ko sa kaibigan ko.',
  },
  'first-visit': {
    es: 'No le des muchas vueltas: llega al estudio, menciona tu oferta en la recepción y tu proveedor te guiará. Puedes empezar con una consulta o preguntar por las opciones de tratamiento.',
    fr: 'Ne te complique pas : arrive au studio, mentionne ton offre à l\'accueil et ton prestataire te guidera. Tu peux commencer par une consultation ou demander les options de traitement.',
    pt: 'Não complica: chegue ao estúdio, mencione sua oferta na recepção e seu provedor te guiará. Pode começar com uma consulta ou perguntar sobre as opções de tratamento.',
    de: 'Mach dir keinen Stress: komm zum Studio, erwähne dein Angebot am Empfang und dein Anbieter wird dich führen. Du kannst mit einer Beratung beginnen oder nach Behandlungsoptionen fragen.',
    zh: '别想太多——到达工作室，在前台提一下你的优惠，你的医师会引导你完成一切。可以先做咨询或了解治疗方案。',
    ko: '너무 복잡하게 생각하지 마세요 — 스튜디오에 도착해서 프런트에서 오퍼를 말씀하시면 담당 의료진이 안내해 드려요. 상담부터 시작하거나 치료 옵션을 물어볼 수 있어요.',
    ja: '難しく考えないでください。スタジオに到着したら、フロントでオファーのことを伝えるだけです。担当者がすべてガイドします。カウンセリングから始めることも、治療オプションについて質問することもできます。',
    vi: 'Đừng nghĩ nhiều quá — đến studio, nhắc về ưu đãi ở quầy lễ tân và bác sĩ sẽ hướng dẫn bạn. Bạn có thể bắt đầu với tư vấn hoặc hỏi về các lựa chọn điều trị.',
    th: 'อย่าคิดมากค่ะ — มาถึงสตูดิโอ บอกเรื่องข้อเสนอที่เคาน์เตอร์ แล้วผู้ให้บริการจะดูแลทุกอย่าง จะเริ่มจากปรึกษาหรือถามเรื่องตัวเลือกทรีทเมนต์ก็ได้',
    hi: 'ज़्यादा सोचिए मत — स्टूडियो पहुँचें, फ्रंट डेस्क पर ऑफर का ज़िक्र करें और प्रोवाइडर सब गाइड करेंगे। कंसल्टेशन से शुरू कर सकते हैं या ट्रीटमेंट ऑप्शन पूछ सकते हैं।',
    tl: 'Huwag mo masyadong isipin — pumunta sa studio, sabihin mo ang offer mo sa front desk, at gagabayan ka ng provider mo. Pwede kang mag-start sa consultation o magtanong tungkol sa treatment options.',
  },
  hours: {
    es: 'El estudio está abierto de lunes a viernes de 9am a 7pm, y sábados de 9am a 5pm. Recomendamos hacer cita, pero las consultas sin cita son bienvenidas durante el horario de atención.',
    fr: 'Le studio est ouvert du lundi au vendredi de 9h à 19h, et le samedi de 9h à 17h. Nous recommandons de prendre rendez-vous, mais les consultations sans rendez-vous sont bienvenues.',
    pt: 'O estúdio funciona de segunda a sexta das 9h às 19h, e sábados das 9h às 17h. Recomendamos agendamento, mas consultas sem hora são bem-vindas durante o horário comercial.',
    de: 'Das Studio ist Montag bis Freitag von 9 bis 19 Uhr und Samstag von 9 bis 17 Uhr geöffnet. Wir empfehlen Termine, aber Walk-in-Beratungen sind willkommen.',
    zh: '工作室周一到周五上午9点到晚上7点开放，周六上午9点到下午5点。建议预约，但营业时间内也欢迎直接来咨询。',
    ko: '스튜디오는 평일 오전 9시~오후 7시, 토요일 오전 9시~오후 5시에 운영해요. 예약을 권장하지만 영업 시간 중 워크인 상담도 환영해요.',
    ja: 'スタジオは平日9時〜19時、土曜9時〜17時に営業しています。予約をお勧めしますが、営業時間中のウォークイン相談も歓迎です。',
    vi: 'Studio mở cửa thứ Hai đến thứ Sáu từ 9 giờ sáng đến 7 giờ tối, thứ Bảy từ 9 giờ sáng đến 5 giờ chiều. Chúng tôi khuyên đặt lịch trước, nhưng tư vấn walk-in cũng được chào đón.',
    th: 'สตูดิโอเปิดจันทร์-ศุกร์ 9 โมงเช้า ถึง 1 ทุ่ม, เสาร์ 9 โมงเช้า ถึง 5 โมงเย็นค่ะ แนะนำให้จองล่วงหน้า แต่ walk-in ปรึกษาก็ยินดีต้อนรับ',
    hi: 'स्टूडियो सोमवार से शुक्रवार सुबह 9 बजे से शाम 7 बजे तक, और शनिवार सुबह 9 से शाम 5 बजे तक खुला है। अपॉइंटमेंट बुक करने की सलाह है, लेकिन बिजनेस ऑवर्स में वॉक-इन कंसल्टेशन भी स्वागत है।',
    tl: 'Bukas ang studio Monday to Friday 9am-7pm, at Saturday 9am-5pm. Mas maganda mag-book ng appointment, pero welcome din ang walk-in consultations.',
  },
  consultation: {
    es: '¡Sí, las consultas son gratuitas y sin compromiso! Solo ven durante el horario de atención. Recomendamos reservar con anticipación para que te emparejen con el proveedor adecuado.',
    fr: 'Oui, les consultations sont gratuites et sans engagement ! Viens pendant les heures d\'ouverture. Nous recommandons de réserver pour être jumelé avec le bon prestataire.',
    pt: 'Sim, as consultas são gratuitas e sem compromisso! Venha durante o horário comercial. Recomendamos agendar para ser atendido pelo provedor certo.',
    de: 'Ja, Beratungen sind kostenlos und unverbindlich! Komm einfach während der Öffnungszeiten. Wir empfehlen eine Reservierung für den richtigen Anbieter.',
    zh: '是的，咨询完全免费，没有任何义务！直接在营业时间来就行。我们建议提前预约，这样可以为你匹配最合适的医师。',
    ko: '네, 상담은 무료이고 의무가 없어요! 영업 시간에 오시면 돼요. 적합한 의료진과 매칭하려면 미리 예약하시는 걸 추천해요.',
    ja: 'はい、カウンセリングは無料で義務はありません！営業時間中にお越しください。適切な担当者とマッチングするため、予約をお勧めします。',
    vi: 'Được luôn, tư vấn hoàn toàn miễn phí và không cam kết! Cứ đến trong giờ làm việc. Chúng tôi khuyên đặt lịch trước để được ghép với bác sĩ phù hợp nhất.',
    th: 'ได้เลยค่ะ ปรึกษาฟรีไม่มีข้อผูกมัด! แค่มาในเวลาทำการ แนะนำให้จองล่วงหน้าเพื่อจับคู่กับผู้ให้บริการที่เหมาะสม',
    hi: 'हाँ, कंसल्टेशन मुफ़्त है और कोई बाध्यता नहीं! बिजनेस ऑवर्स में आ जाइए। सही प्रोवाइडर से मिलने के लिए पहले से बुक करना अच्छा रहेगा।',
    tl: 'Oo, libre ang consultation at walang commitment! Pumunta ka lang sa business hours. Best mag-book para ma-match ka sa tamang provider.',
  },
  'complimentary': {
    es: 'Tu consulta gratuita te da una evaluación completa con un proveedor licenciado — no es una versión limitada. Solo ven al estudio y menciona tu oferta en recepción.',
    fr: 'Ta consultation gratuite te donne une évaluation complète avec un prestataire agréé — pas de version limitée. Viens au studio et mentionne ton offre à l\'accueil.',
    pt: 'Sua consulta gratuita dá direito a uma avaliação completa com um provedor licenciado — não é versão limitada. Venha ao estúdio e mencione sua oferta na recepção.',
    de: 'Deine kostenlose Beratung gibt dir eine vollständige Bewertung mit einem lizenzierten Anbieter — keine abgespeckte Version. Komm ins Studio und erwähne dein Angebot am Empfang.',
    zh: '你的免费咨询包含持证医师的完整评估——不是什么缩水版本。来工作室，在前台提一下你的优惠就好了。',
    ko: '무료 상담으로 면허 보유 의료진의 전체 평가를 받을 수 있어요 — 축소 버전이 아니에요. 스튜디오에 와서 프런트에서 오퍼를 말씀하시면 돼요.',
    ja: '無料カウンセリングでは資格を持つ担当者による完全な評価を受けられます。制限版ではありません。スタジオにお越しになりフロントでオファーをお伝えください。',
    vi: 'Tư vấn miễn phí của bạn bao gồm đánh giá đầy đủ với bác sĩ có giấy phép — không phải bản rút gọn đâu. Chỉ cần đến studio và nhắc về ưu đãi ở quầy lễ tân.',
    th: 'ปรึกษาฟรีของคุณได้รับการประเมินเต็มรูปแบบจากผู้ให้บริการที่มีใบอนุญาตค่ะ — ไม่ใช่เวอร์ชันจำกัด แค่มาที่สตูดิโอแล้วบอกเรื่องข้อเสนอที่เคาน์เตอร์',
    hi: 'आपकी मुफ़्त कंसल्टेशन में लाइसेंस्ड प्रोवाइडर से पूरा असेसमेंट मिलता है — यह कोई लिमिटेड वर्ज़न नहीं है। बस स्टूडियो आइए और फ्रंट डेस्क पर ऑफर का ज़िक्र करें।',
    tl: 'Ang free consultation mo ay full assessment sa licensed provider — hindi \'to limited version. Pumunta lang sa studio at sabihin ang offer mo sa front desk.',
  },
  treatments: {
    es: 'Ofrecemos una gama completa de tratamientos estéticos: faciales, dermaplaneo, neurotoxinas como Botox y Dysport, microagujas, rellenos labiales e inyectables avanzados. Cada tratamiento comienza con una consulta personalizada.',
    fr: 'Nous offrons une gamme complète de soins esthétiques : soins du visage, dermaplaning, neurotoxines comme le Botox et Dysport, microneedling, fillers lèvres et injectables avancés. Chaque traitement commence par une consultation personnalisée.',
    pt: 'Oferecemos uma gama completa de tratamentos estéticos: faciais, dermaplanagem, neurotoxinas como Botox e Dysport, microagulhamento, preenchimento labial e injetáveis avançados. Todo tratamento começa com consulta personalizada.',
    de: 'Wir bieten eine volle Palette ästhetischer Behandlungen: Gesichtsbehandlungen, Dermaplaning, Neurotoxine wie Botox und Dysport, Microneedling, Lippenfilller und fortgeschrittene Injektionen. Jede Behandlung beginnt mit einer persönlichen Beratung.',
    zh: '我们提供全系列美容治疗：面部护理、磨皮、肉毒素（如Botox和Dysport）、微针、唇部填充和高级注射。每项治疗都从个性化咨询开始。',
    ko: '저희는 전체 미용 치료를 제공해요: 페이셜, 더마플레이닝, 보톡스와 디스포트 같은 뉴로톡신, 마이크로니들링, 입술 필러, 고급 주사. 모든 치료는 개인 맞춤 상담으로 시작해요.',
    ja: 'フルレンジの美容治療を提供しています：フェイシャル、ダーマプレーニング、ボトックス・ディスポートなどのニューロトキシン、マイクロニードリング、リップフィラー、高度注入治療。すべてパーソナライズされたカウンセリングから始まります。',
    vi: 'Chúng tôi cung cấp đầy đủ các liệu trình thẩm mỹ: chăm sóc da mặt, dermaplaning, botox và Dysport, vi kim, filler môi và tiêm nâng cao. Mỗi liệu trình đều bắt đầu với tư vấn cá nhân.',
    th: 'เรามีทรีทเมนต์ความงามครบค่ะ: ดูแลผิวหน้า, เดอร์มาเพลนนิ่ง, นิวโรท็อกซินอย่างโบท็อกซ์และดิสพอร์ต, ไมโครนีดลิง, ฟิลเลอร์ปาก และการฉีดขั้นสูง ทุกทรีทเมนต์เริ่มจากการปรึกษาส่วนตัว',
    hi: 'हम पूरी रेंज के सौंदर्य उपचार देते हैं: फेशियल, डर्माप्लेनिंग, बोटॉक्स और डिस्पोर्ट जैसे न्यूरोटॉक्सिन, माइक्रोनीडलिंग, लिप फिलर और एडवांस्ड इंजेक्टेबल। हर ट्रीटमेंट पर्सनलाइज़्ड कंसल्टेशन से शुरू होता है।',
    tl: 'Nag-offer kami ng buong range ng aesthetic treatments: facials, dermaplaning, neurotoxins tulad ng Botox at Dysport, microneedling, lip fillers, at advanced injectables. Lahat ng treatment nagsisimula sa personalized consultation.',
  },
  greeting: {
    es: '¡Hola! Tu consulta está confirmada. Mientras el equipo prepara tu visita, puedo ayudarte a entender qué tratamientos son ideales para ti, qué esperar y cómo aprovechar al máximo tu tiempo con nosotros.',
    fr: 'Salut ! Ta consultation est confirmée. En attendant que l\'équipe prépare ta visite, je peux t\'aider à comprendre quels traitements te conviennent, à quoi t\'attendre et comment profiter au maximum de ton temps chez nous.',
    pt: 'Olá! Sua consulta está confirmada. Enquanto a equipe prepara sua visita, posso te ajudar a entender quais tratamentos são ideais, o que esperar e como aproveitar ao máximo seu tempo conosco.',
    de: 'Hallo! Deine Beratung ist bestätigt. Während das Team deinen Besuch vorbereitet, kann ich dir helfen zu verstehen welche Behandlungen ideal sind, was dich erwartet und wie du das Beste aus deiner Zeit bei uns machst.',
    zh: '你好！你的咨询已确认。在团队准备你的访问期间，我可以帮你了解哪些治疗最适合你、预期什么以及如何充分利用你的时间。',
    ko: '안녕하세요! 상담이 확인되었어요. 팀이 방문을 준비하는 동안, 어떤 치료가 맞는지, 무엇을 기대할지, 시간을 최대한 활용하는 방법을 도와드릴게요.',
    ja: 'こんにちは！カウンセリングが確認されました。チームが訪問の準備をしている間、最適な治療、期待できること、時間の最大活用法をお手伝いします。',
    vi: 'Xin chào! Lịch tư vấn của bạn đã được xác nhận. Trong khi đội ngũ chuẩn bị cho buổi hẹn, mình có thể giúp bạn hiểu liệu trình nào phù hợp, cần chuẩn bị gì và cách tận dụng thời gian tốt nhất.',
    th: 'สวัสดีค่ะ! การปรึกษายืนยันแล้ว ระหว่างที่ทีมเตรียมการเข้าพบ เราช่วยคุณเข้าใจว่าทรีทเมนต์ไหนเหมาะ คาดหวังอะไรได้ และใช้เวลาให้คุ้มที่สุดค่ะ',
    hi: 'नमस्ते! आपकी कंसल्टेशन कन्फ़र्म हो गई है। जब तक टीम आपकी विज़िट तैयार करती है, मैं आपको सही ट्रीटमेंट, क्या उम्मीद करें और समय का बेहतरीन उपयोग करने में मदद कर सकता हूँ।',
    tl: 'Kumusta! Confirmed na ang consultation mo. Habang inaayos ng team ang visit mo, pwede kitang tulungan malaman kung anong treatments ang tama, ano ang i-expect, at paano i-maximize ang oras mo sa amin.',
  },
  location: {
    es: 'Tu estudio es una excelente opción. Y si alguna vez quieres visitar otro NakedMD, tenemos 40 ubicaciones en todo el país y tu historial de tratamiento te sigue.',
    fr: 'Ton studio est un excellent choix. Et si tu veux un jour visiter un autre NakedMD, nous avons 40 emplacements et ton historique de traitement te suit.',
    pt: 'Seu estúdio é uma ótima escolha. E se quiser visitar outro NakedMD, temos 40 unidades pelo país e seu histórico de tratamento te acompanha.',
    de: 'Dein Studio ist eine tolle Wahl. Und wenn du mal ein anderes NakedMD besuchen willst, haben wir 40 Standorte und deine Behandlungshistorie folgt dir.',
    zh: '你选的工作室是个很好的选择。如果想体验其他NakedMD，我们在全国有40家门店，你的治疗记录会跟着你。',
    ko: '선택하신 스튜디오는 좋은 선택이에요. 다른 NakedMD를 방문하고 싶으시면, 전국 40개 지점이 있고 치료 기록이 따라가요.',
    ja: '選ばれたスタジオは素晴らしい選択です。他のNakedMDを訪れたい時は、全国40か所の店舗があり、治療履歴も引き継がれます。',
    vi: 'Studio bạn chọn là một lựa chọn tuyệt vời. Và nếu muốn ghé NakedMD khác, chúng tôi có 40 cơ sở trên toàn quốc và lịch sử điều trị sẽ theo bạn.',
    th: 'สตูดิโอที่คุณเลือกเป็นตัวเลือกที่ดีมากค่ะ และถ้าอยากลองสาขาอื่น เรามี 40 สาขาทั่วประเทศและประวัติการรักษาจะตามคุณไป',
    hi: 'आपने जो स्टूडियो चुना है वो बहुत अच्छा है। और अगर कभी दूसरा NakedMD ट्राई करना चाहें, हमारे देश भर में 40 लोकेशन हैं और आपका ट्रीटमेंट हिस्ट्री साथ चलती है।',
    tl: 'Magandang choice ang napili mong studio. At kung gusto mo i-try ang ibang NakedMD, may 40 locations kami sa buong bansa at ang treatment history mo ay kasama mo.',
  },
  handoff: {
    es: 'Entendido — el equipo ya tiene tu información y se pondrán en contacto contigo. Mientras tanto, puedo ayudarte a preparar las preguntas correctas sobre tus opciones de tratamiento.',
    fr: 'Compris — l\'équipe a déjà tes infos et va te contacter. En attendant, je peux t\'aider à préparer les bonnes questions sur tes options de traitement.',
    pt: 'Entendido — a equipe já tem suas informações e vai entrar em contato. Enquanto isso, posso te ajudar a preparar as perguntas certas sobre suas opções de tratamento.',
    de: 'Verstanden — das Team hat deine Infos und wird sich melden. In der Zwischenzeit kann ich dir helfen die richtigen Fragen zu deinen Behandlungsoptionen vorzubereiten.',
    zh: '收到——团队已经有你的信息了，会很快联系你。在此期间，我可以帮你准备好关于治疗方案的正确问题。',
    ko: '알겠어요 — 팀에서 이미 정보를 가지고 있고 연락드릴 거예요. 그동안 치료 옵션에 대한 좋은 질문을 준비할 수 있도록 도와드릴게요.',
    ja: '承知しました。チームが既に情報を持っており、連絡いたします。その間、治療オプションについての良い質問を準備するお手伝いができます。',
    vi: 'Đã nhận — đội ngũ đã có thông tin của bạn và sẽ liên hệ sớm. Trong thời gian chờ, mình có thể giúp bạn chuẩn bị các câu hỏi phù hợp về lựa chọn điều trị.',
    th: 'รับทราบค่ะ — ทีมมีข้อมูลของคุณแล้วและจะติดต่อเร็วๆ นี้ ระหว่างนี้เราช่วยเตรียมคำถามเกี่ยวกับตัวเลือกทรีทเมนต์ได้',
    hi: 'समझ गया — टीम के पास आपकी जानकारी है और वे जल्द संपर्क करेंगे। तब तक, मैं आपको ट्रीटमेंट ऑप्शन के बारे में सही सवाल तैयार करने में मदद कर सकता हूँ।',
    tl: 'Got it — may info na ang team at makikipag-ugnayan sila sa\'yo. Samantala, pwede kitang tulungan mag-prepare ng tamang mga tanong tungkol sa treatment options mo.',
  },
  unsupported: {
    es: 'Eso está fuera de mi área — temas de facturación y cuentas necesitan al equipo del estudio. Pero soy muy bueno con tratamientos, precios, consultas y horarios. ¿Quieres probar algo de eso?',
    fr: 'Ça sort de mon domaine — la facturation et les comptes doivent passer par l\'équipe du studio. Mais je suis bon pour les traitements, prix, consultations et horaires. On essaie ?',
    pt: 'Isso foge da minha área — cobrança e conta precisam do time do estúdio. Mas sou ótimo com tratamentos, preços, consultas e horários. Quer tentar algo disso?',
    de: 'Das liegt außerhalb meines Bereichs — Abrechnung und Kontofragen brauchen das Studio-Team. Aber bei Behandlungen, Preisen, Beratungen und Öffnungszeiten bin ich stark.',
    zh: '这个超出了我的范围——账单和账户问题需要直接联系工作室团队。不过关于治疗、价格、咨询和营业时间，我很在行。',
    ko: '그건 제 영역 밖이에요 — 결제와 계정 문제는 스튜디오 팀에 직접 문의하셔야 해요. 하지만 치료, 가격, 상담, 운영시간에 대해서는 잘 도와드릴 수 있어요.',
    ja: 'それは私の範囲外です。請求やアカウントの問題はスタジオチームに直接お問い合わせください。ただ、治療、価格、カウンセリング、営業時間については得意です。',
    vi: 'Vấn đề đó nằm ngoài phạm vi của mình — thanh toán và tài khoản cần liên hệ trực tiếp đội ngũ studio. Nhưng mình rất giỏi về liệu trình, giá cả, tư vấn và giờ hoạt động.',
    th: 'เรื่องนั้นอยู่นอกเหนือขอบเขตของเราค่ะ — เรื่องบิลและบัญชีต้องติดต่อทีมสตูดิโอโดยตรง แต่เรื่องทรีทเมนต์ ราคา ปรึกษา และเวลาเปิด เราช่วยได้ดีเลย',
    hi: 'वो मेरे दायरे से बाहर है — बिलिंग और अकाउंट के लिए सीधे स्टूडियो टीम से संपर्क करें। लेकिन ट्रीटमेंट, प्राइसिंग, कंसल्टेशन और टाइमिंग में मैं अच्छे से मदद कर सकता हूँ।',
    tl: 'Hindi ko sakop \'yan — billing at account concerns kailangan ng direct na studio team. Pero magaling ako sa treatments, pricing, consultations, at hours. Gusto mo i-try?',
  },
  thanks: {
    es: '¡De nada! Sigo aquí si necesitas algo más — ya sea comparar tratamientos, entender precios o averiguar el mejor momento para venir.',
    fr: 'De rien ! Je suis toujours là si tu as besoin — que ce soit comparer les traitements, comprendre les prix ou trouver le meilleur moment pour venir.',
    pt: 'De nada! Continuo aqui se precisar de mais alguma coisa — seja comparar tratamentos, entender preços ou descobrir o melhor horário para vir.',
    de: 'Gern geschehen! Ich bin weiterhin hier — ob du Behandlungen vergleichen, Preise verstehen oder die beste Zeit zum Kommen finden willst.',
    zh: '不客气！我还在这里，如果你需要任何帮助——不管是比较治疗、了解价格还是找最佳到访时间。',
    ko: '천만에요! 더 필요한 게 있으면 여기 있을게요 — 치료 비교, 가격 이해, 최적의 방문 시간 알아보기 등 뭐든요.',
    ja: 'どういたしまして！まだここにいますので、何かあればお気軽に。治療の比較、価格の理解、最適な訪問時間など、何でもどうぞ。',
    vi: 'Không có gì! Mình vẫn ở đây nếu bạn cần thêm — dù là so sánh liệu trình, tìm hiểu giá hay tìm thời gian đến tốt nhất.',
    th: 'ยินดีค่ะ! ยังอยู่ตรงนี้ถ้าต้องการอะไรเพิ่ม — ไม่ว่าจะเปรียบเทียบทรีทเมนต์ เข้าใจราคา หรือหาเวลาที่ดีที่สุดในการมา',
    hi: 'कोई बात नहीं! मैं यहाँ हूँ अगर कुछ और चाहिए — चाहे ट्रीटमेंट तुलना करनी हो, प्राइसिंग समझनी हो या सबसे अच्छा टाइम जानना हो।',
    tl: 'Walang anuman! Nandito lang ako kung may kailangan ka pa — mag-compare ng treatments, maintindihan ang pricing, o malaman ang best time pumunta.',
  },
  fallback: {
    es: 'Puede que no haya captado eso, pero soy muy bueno ayudándote a elegir el tratamiento correcto, preparar tu consulta, comparar servicios y darte toda la información del estudio. ¿Qué te interesa?',
    fr: 'J\'ai peut-être raté ça, mais je suis très bon pour t\'aider à choisir le bon traitement, préparer ta consultation, comparer les services et te donner toutes les infos du studio.',
    pt: 'Pode ser que eu não tenha entendido, mas sou ótimo em ajudar a escolher o tratamento certo, preparar a consulta, comparar serviços e dar informações sobre o estúdio.',
    de: 'Das hab ich vielleicht nicht verstanden, aber ich bin gut darin die richtige Behandlung zu finden, deine Beratung vorzubereiten, Services zu vergleichen und dir alle Studio-Infos zu geben.',
    zh: '我可能没理解你的问题，但我很擅长帮你选择合适的治疗、准备咨询、比较服务和提供工作室信息。你对哪个感兴趣？',
    ko: '제가 놓쳤을 수도 있지만, 적합한 치료 선택, 상담 준비, 서비스 비교, 스튜디오 정보 안내에 자신 있어요. 어떤 것에 관심 있으세요?',
    ja: '聞き取れなかったかもしれませんが、治療選び、カウンセリングの準備、サービス比較、スタジオ情報のご案内が得意です。何に興味がありますか？',
    vi: 'Có thể mình chưa hiểu câu hỏi, nhưng mình rất giỏi trong việc giúp chọn liệu trình phù hợp, chuẩn bị cho buổi tư vấn, so sánh dịch vụ và cung cấp thông tin studio. Bạn quan tâm điều gì?',
    th: 'อาจจะไม่เข้าใจคำถามนั้นค่ะ แต่เราช่วยเรื่องเลือกทรีทเมนต์ เตรียมตัวปรึกษา เปรียบเทียบบริการ และข้อมูลสตูดิโอได้ดี สนใจเรื่องไหนคะ?',
    hi: 'शायद मैंने सही से नहीं समझा, लेकिन सही ट्रीटमेंट चुनना, कंसल्टेशन की तैयारी, सर्विस तुलना और स्टूडियो की जानकारी में मैं अच्छे से मदद कर सकता हूँ। आपकी किसमें दिलचस्पी है?',
    tl: 'Baka hindi ko na-gets \'yan, pero magaling ako sa pagtulong pumili ng tamang treatment, mag-prepare para sa consultation, mag-compare ng services, at magbigay ng studio info. Ano ang interest mo?',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Tone transform functions
// ---------------------------------------------------------------------------

function applyWarmth(text: string, level: number, lang: string): string {
  if (level < 45) return text;
  const openers = WARM_OPENERS[lang] ?? WARM_OPENERS['en'];
  if (openers.some((w) => text.startsWith(w))) return text;
  const opener = pick(openers);
  return `${opener} ${text}`;
}

function applyEnergy(text: string, level: number, lang: string): string {
  if (level < 35) return text;
  if (level > 75) {
    const tags = HIGH_ENERGY_TAGS[lang] ?? HIGH_ENERGY_TAGS['en'];
    return `${text} ${pick(tags)}`;
  }
  // Moderate energy: replace first sentence-ending period with !
  return text.replace(/(?<=[a-zA-Z\u0900-\u097f\u0e00-\u0e7f\u3000-\u9fff\uac00-\ud7af\u3040-\u309f\u30a0-\u30ff])\.(?=\s|$)/, '!');
}

function applyHumor(text: string, level: number, lang: string): string {
  if (level < 45) return text;
  const asides = HUMOR_ASIDES[lang] ?? HUMOR_ASIDES['en'];
  return `${text} ${pick(asides)}`;
}

function applyFormality(text: string, level: number): string {
  if (level > 55) {
    for (const [pattern, replacement] of FORMAL_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
  } else if (level < 45) {
    for (const [pattern, replacement] of CASUAL_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
  }
  return text;
}

function applyEmoji(text: string, intent?: string): string {
  const emoji = (intent && EMOJI_MAP[intent]) || '\u2728';
  return `${emoji} ${text}`;
}

function applyName(text: string, defaultName: string, customName: string): string {
  if (!customName || customName === defaultName) return text;
  return text.replace(
    new RegExp(`\\b${escapeRegex(defaultName)}\\b`, 'g'),
    () => customName,
  );
}

function applyGreeting(text: string, greeting: string, isWelcome: boolean): string {
  if (!greeting || !isWelcome) return text;
  const firstDash = text.indexOf(' - ');
  if (firstDash > -1) {
    return `${greeting} - ${text.slice(firstDash + 3)}`;
  }
  return `${greeting} ${text}`;
}

function applySignoff(text: string, signoff: string): string {
  if (!signoff) return text;
  return `${text} ${signoff}`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function transformMessage(
  msg: ChatMessage,
  persona: AgentPersona,
  intent?: string,
  isWelcome = false,
): ChatMessage {
  let content = msg.content;
  const lang = persona.language;

  // Check for a full translated response
  const fullTranslation =
    lang !== 'en' && intent ? FULL_TRANSLATIONS[intent]?.[lang] : undefined;

  if (fullTranslation) {
    // Non-English path: use full translation, then apply translated tone
    content = fullTranslation;
    content = applyWarmth(content, persona.warmth, lang);
    content = applyEnergy(content, persona.energy, lang);
    content = applyHumor(content, persona.humor, lang);
  } else {
    // English path (or missing translation fallback)
    content = applyName(content, 'Vi', persona.name);
    content = applyGreeting(content, persona.greeting, isWelcome);
    content = applyWarmth(content, persona.warmth, 'en');
    content = applyFormality(content, persona.formality);
    content = applyEnergy(content, persona.energy, 'en');
    content = applyHumor(content, persona.humor, 'en');
  }

  if (persona.useEmoji) {
    content = applyEmoji(content, intent);
  }
  content = applySignoff(content, persona.signoff);

  return { ...msg, content };
}
