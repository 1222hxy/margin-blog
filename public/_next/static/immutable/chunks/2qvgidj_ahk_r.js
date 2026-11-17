(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,142423,e=>{"use strict";e.s(["S",()=>v,"d",()=>b,"k",()=>h,"e",()=>x,"Q",()=>y,"c",()=>k],142423);var t=e.i(22074),r=e.i(385814);let o=["openai_business","openai_solutions","openai_team","openai_enterprise","openai_homepage","openai_contact_sales","openai_stories","openai_api"],n={formattedMessage:{defaultMessage:"",description:""},buttonProps:{external:!1,href:"",variant:"primary-button",analyticsAction:""}},a=(0,t.U)({id:"7d+RgX",defaultMessage:[{type:0,value:"Try now"}]}),l=(0,t.U)({id:"7d+RgX",defaultMessage:[{type:0,value:"Try now"}]}),i=(0,t.U)({id:"Elh+hw",defaultMessage:[{type:0,value:"Try ChatGPT Business"}]}),c=(0,t.U)({id:"Elh+hw",defaultMessage:[{type:0,value:"Try ChatGPT Business"}]}),s=(0,t.U)({id:"Xo90TH",defaultMessage:[{type:0,value:"Get started"}]}),d=((0,t.U)({id:"9y4OLN",defaultMessage:[{type:0,value:"Try for free"}]}),(0,t.U)({id:"9y4OLN",defaultMessage:[{type:0,value:"Try for free"}]}),(0,t.U)({id:"W+nL1A",defaultMessage:[{type:0,value:"Contact sales"}]})),u=(0,t.U)({id:"gcnU8f",defaultMessage:[{type:0,value:"Try ChatGPT"}]}),f=(0,t.U)({id:"6KH6S3",defaultMessage:[{type:0,value:"Start building"}]}),m="2161643487",p={api_dashboard:({conversionLink:{analyticsAction:e,variant:t,utmInternalSource:r}})=>({formattedMessage:f,buttonProps:{href:v({utmInternalSource:r}),external:!0,analyticsAction:e,variant:t}}),enterprise:({conversionLink:{analyticsAction:e,variant:t},effectiveLocale:o})=>({formattedMessage:d,buttonProps:{href:(0,r.m)({slug:"contact-sales",effectiveLocale:o}),external:!1,analyticsAction:e,variant:t}}),consumer:({conversionLink:{analyticsAction:e,variant:t}})=>({formattedMessage:u,buttonProps:{href:"https://chatgpt.com/",external:!0,analyticsAction:e,variant:t}}),team:({country:e,conversionLink:{analyticsAction:t,variant:r,utmInternalSource:o},experimentVariants:n})=>({formattedMessage:1===n[m]?l:a,buttonProps:{href:b({utmInternalSource:o,country:e}),external:!0,analyticsAction:t,variant:r}}),team_explicit:({country:e,conversionLink:{analyticsAction:t,variant:r,utmInternalSource:o},experimentVariants:n})=>({formattedMessage:1===n[m]?c:i,buttonProps:{href:b({utmInternalSource:o,country:e}),external:!0,analyticsAction:t,variant:r}}),team_get_started:({country:e,conversionLink:{analyticsAction:t,variant:r,utmInternalSource:o}})=>({formattedMessage:s,buttonProps:{href:b({utmInternalSource:o,country:e}),external:!0,analyticsAction:t,variant:r}})};var g=e.i(485638);let h=e=>{let{conversionLink:t}=e,o=p[t.purpose]?.(e);return o?{...o,buttonProps:((e,{utmCampaign:t,utmContent:o})=>{if(!t&&!o)return e;let n=new URL(e.href,(0,g.R)());t&&n.searchParams.set("utm_campaign",t),o&&n.searchParams.set("utm_content",o);let a=(0,r.A)(e.href)?`${n.pathname}${n.search}${n.hash}`:n.href;return{...e,href:a}})(o.buttonProps,t)}:n},b=({utmInternalSource:e,country:t})=>new URL("https://chatgpt.com/team-sign-up").toString(),v=({utmInternalSource:e})=>{let t=new URL("https://platform.openai.com/");return e&&t.searchParams.set("utm_internal_source",e),t.toString()},y=e=>"conversionLink"===e.__typename,k=e=>!!e&&o.includes(e),x=e=>"team"===e||"team_explicit"===e||"team_get_started"===e},600822,e=>{"use strict";var t=e.i(101372),r=e.i(610963),o=e.i(142423),n=e.i(114641),a=e.i(855384),l=e.i(113444),i=e.i(517172);e.s(["default",0,e=>{let c=(0,i.f)(),{country:s}=(0,l.f)(),d=(0,n.f)(),{variant:u}=(0,a.f)({hashedExperimentName:"2161643487",skipAutoExpose:!(0,o.e)(e.purpose)}),{formattedMessage:f,buttonProps:m}=(0,o.k)({conversionLink:e,country:s,effectiveLocale:d,experimentVariants:{0x80d80fdf:u}});return(0,t.jsx)(r.default,{...m,className:e.className,onClick:e.onClick,children:c.formatMessage(f)})}])},148527,e=>{"use strict";e.s(["g",0,"z-55","P",0,"z-54","Z",0,"z-53","s",0,"z-51","o",0,"z-51","a",0,"z-56","c",0,"z-57","J",0,"z-52","h",0,"z-49"])},117599,e=>{"use strict";var t=e.i(101372),r=e.i(901962);let o={country:"US"},n=r.createContext(o);e.s(["CountryContext",0,n,"CountryProvider",0,function({children:e,country:r}){return(0,t.jsx)(n.Provider,{value:{country:r},children:e})},"countryContextDefaultValues",0,o,"useCountryContext",0,function(){return r.useContext(n)}])},980017,e=>{"use strict";var t=e.i(101372),r=e.i(901962);let o={hashedExperimentAssignments:{},enableExposureLogging:!1,exposedExperimentHashes:[],setExperimentExposed:()=>{},resetExposedExperimentHashes:()=>{}},n=(0,r.createContext)(o);e.s(["ExperimentAssignmentProvider",0,function({hashedExperimentAssignments:e,enableExposureLogging:o,children:a}){let l=(0,r.useRef)([]),i=(0,r.useCallback)(()=>{l.current=[]},[]);return(0,t.jsx)(n.Provider,{value:{hashedExperimentAssignments:e,enableExposureLogging:o,exposedExperimentHashes:l.current,setExperimentExposed:e=>{l.current.push(e)},resetExposedExperimentHashes:i},children:a})},"defaultValue",0,o,"useExperimentAssignmentContext",0,()=>(0,r.useContext)(n)])},168039,e=>{"use strict";var t=e.i(101372),r=e.i(901962);let o=(0,r.createContext)({banner:null});e.s(["NavigationContentContextProvider",0,({children:e,banner:r=null,footerBanner:n})=>(0,t.jsx)(o.Provider,{value:{banner:r,footerBanner:n},children:e}),"useNavigationContentContext",0,()=>(0,r.useContext)(o)])},511993,e=>{"use strict";var t=e.i(703214),r=e.i(117599);let[o,n]=(0,t.f)(r.countryContextDefaultValues);e.s(["getCountryContext",0,o,"setCountryContext",0,n])},351627,e=>{"use strict";var t=e.i(703214),r=e.i(980017);let[o,n]=(0,t.f)(r.defaultValue);e.s(["getExperimentAssignmentContext",0,o,"setExperimentAssignmentContext",0,n])},855384,e=>{"use strict";var t=e.i(901962),r=e.i(299180);e.i(724377);var o=e.i(138231);let n=({hashedExperimentName:e,variant:t})=>{(0,o.r)({type:"experiment.exposure",hashedExperimentName:e,variant:t,origin:window.location.origin,pathname:window.location.pathname,timestamp:Date.now()})};e.s(["f",0,({hashedExperimentName:e,skipAutoExpose:o})=>{let{hashedExperimentAssignments:a,enableExposureLogging:l,exposedExperimentHashes:i,setExperimentExposed:c}=(0,r.f)(),s=a[e],d=(0,t.useCallback)(()=>{l&&n({hashedExperimentName:e,variant:s??0})},[l,e,s]);return(0,t.useEffect)(()=>{o||!l||i.includes(e)||(c(e),n({hashedExperimentName:e,variant:s??0}))},[o,l,e,i,c,s]),{variant:s,expose:d}}],855384)},113444,e=>{"use strict";let t=e.i(126046).f?()=>{let{getCountryContext:t}=e.r(511993);return t()}:()=>{let{useCountryContext:t}=e.r(117599);return t()};e.s(["f",0,t])},299180,e=>{"use strict";let t=e.i(126046).f?()=>{let{getExperimentAssignmentContext:t}=e.r(351627);return t()}:()=>{let{useExperimentAssignmentContext:t}=e.r(980017);return t()};e.s(["f",0,t])},493348,e=>{"use strict";e.i(22074),e.S([646092,"useIntl,S"])},158753,(e,t,r)=>{var o;e.e,t.exports=(o=function(){var e=JSON.parse('{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ō":"O","ō":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","Ə":"E","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","ə":"e","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","Ա":"A","Բ":"B","Գ":"G","Դ":"D","Ե":"E","Զ":"Z","Է":"E\'","Ը":"Y\'","Թ":"T\'","Ժ":"JH","Ի":"I","Լ":"L","Խ":"X","Ծ":"C\'","Կ":"K","Հ":"H","Ձ":"D\'","Ղ":"GH","Ճ":"TW","Մ":"M","Յ":"Y","Ն":"N","Շ":"SH","Չ":"CH","Պ":"P","Ջ":"J","Ռ":"R\'","Ս":"S","Վ":"V","Տ":"T","Ր":"R","Ց":"C","Փ":"P\'","Ք":"Q\'","Օ":"O\'\'","Ֆ":"F","և":"EV","ء":"a","آ":"aa","أ":"a","ؤ":"u","إ":"i","ئ":"e","ا":"a","ب":"b","ة":"h","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"th","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"dh","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ى":"a","ي":"y","ً":"an","ٌ":"on","ٍ":"en","َ":"a","ُ":"u","ِ":"e","ْ":"","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","پ":"p","چ":"ch","ژ":"zh","ک":"k","گ":"g","ی":"y","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ṣ":"S","ṣ":"s","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","–":"-","‘":"\'","’":"\'","“":"\\"","”":"\\"","„":"\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₺":"turkish lira","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial","ﻵ":"laa","ﻷ":"laa","ﻹ":"lai","ﻻ":"la"}'),t=JSON.parse('{"bg":{"Й":"Y","Ц":"Ts","Щ":"Sht","Ъ":"A","Ь":"Y","й":"y","ц":"ts","щ":"sht","ъ":"a","ь":"y"},"de":{"Ä":"AE","ä":"ae","Ö":"OE","ö":"oe","Ü":"UE","ü":"ue","ß":"ss","%":"prozent","&":"und","|":"oder","∑":"summe","∞":"unendlich","♥":"liebe"},"es":{"%":"por ciento","&":"y","<":"menor que",">":"mayor que","|":"o","¢":"centavos","£":"libras","¤":"moneda","₣":"francos","∑":"suma","∞":"infinito","♥":"amor"},"fr":{"%":"pourcent","&":"et","<":"plus petit",">":"plus grand","|":"ou","¢":"centime","£":"livre","¤":"devise","₣":"franc","∑":"somme","∞":"infini","♥":"amour"},"pt":{"%":"porcento","&":"e","<":"menor",">":"maior","|":"ou","¢":"centavo","∑":"soma","£":"libra","∞":"infinito","♥":"amor"},"uk":{"И":"Y","и":"y","Й":"Y","й":"y","Ц":"Ts","ц":"ts","Х":"Kh","х":"kh","Щ":"Shch","щ":"shch","Г":"H","г":"h"},"vi":{"Đ":"D","đ":"d"},"da":{"Ø":"OE","ø":"oe","Å":"AA","å":"aa","%":"procent","&":"og","|":"eller","$":"dollar","<":"mindre end",">":"større end"},"nb":{"&":"og","Å":"AA","Æ":"AE","Ø":"OE","å":"aa","æ":"ae","ø":"oe"},"it":{"&":"e"},"nl":{"&":"en"},"sv":{"&":"och","Å":"AA","Ä":"AE","Ö":"OE","å":"aa","ä":"ae","ö":"oe"}}');function r(r,o){if("string"!=typeof r)throw Error("slugify: string argument expected");var n=t[(o="string"==typeof o?{replacement:o}:o||{}).locale]||{},a=void 0===o.replacement?"-":o.replacement,l=void 0===o.trim||o.trim,i=r.normalize().split("").reduce(function(t,r){var l=n[r];return void 0===l&&(l=e[r]),void 0===l&&(l=r),l===a&&(l=" "),t+l.replace(o.remove||/[^\w\s$*_+~.()'"!\-:@]+/g,"")},"");return o.strict&&(i=i.replace(/[^A-Za-z0-9\s]/g,"")),l&&(i=i.trim()),i=i.replace(/\s+/g,a),o.lower&&(i=i.toLowerCase()),i}return r.extend=function(t){Object.assign(e,t)},r})(),t.exports.default=o()},490661,114592,944788,29648,726822,917029,e=>{"use strict";let t={colors:{light:{background:"#ffffff",foreground:"#000000",mutedForeground:"#666666",secondaryForeground:"#e0e0e0",controlBorder:"#0000001f",controlBorderHover:"#00000070",popoverBackground:"#f1f1f1cc",menuItemFocusBackground:"#0000000a"},dark:{background:"#000000",foreground:"#ffffff",mutedForeground:"#999999",secondaryForeground:"#333333",controlBorder:"#ffffff33",controlBorderHover:"#ffffff70",popoverBackground:"#333333cc",menuItemFocusBackground:"#ffffff1f"}},fontFamily:{sans:"OpenAI Sans, sans-serif",mono:"'SF Mono', Consolas, 'Liberation Mono', ui-monospace, monospace"},title:{fontSize:"17px",fontWeight:700,letterSpacing:"-0.01em",lineHeight:"22px"},subtitle:{fontSize:"14px",fontWeight:500,letterSpacing:"0em",lineHeight:"19.6px"},menu:{enterDuration:"400ms",exitDuration:"200ms",fontSize:"15px",fontWeight:500,letterSpacing:"0em",lineHeight:"21px",slideDistance:"0.5rem",timingFunction:"cubic-bezier(0.17, 0.17, 0.3, 1)"},spacing:{titleSubtitleGap:2,headerGap:12,headerMarginBottom:12,filterGap:16,filterMarginBottom:12,compactFilterTitleGap:8,compactFilterGap:8}},r={colors:{},fontFamily:t.fontFamily,title:t.title,subtitle:t.subtitle,menu:t.menu,spacing:t.spacing};function o(e,t){let r={...e};for(let e of Object.keys(t??{})){let o=t?.[e];("string"==typeof o&&o.trim().length>0||"number"==typeof o&&Number.isFinite(o))&&(r[e]=o)}return r}function n(...e){return e.reduce((e,t)=>o(e,t),{})}function a(...e){return e.reduce((e,t)=>({colors:n(e.colors,t?.colors),fontFamily:o(e.fontFamily,t?.fontFamily),title:o(e.title,t?.title),subtitle:o(e.subtitle,t?.subtitle),menu:o(e.menu,t?.menu),spacing:o(e.spacing,t?.spacing)}),r)}e.s(["a",0,a,"i",0,n,"n",0,r,"r",0,function(e){return Object.keys(n(e?.colors)).length>0},"t",0,t],114592);let l=["blue","purple","green","yellow","orange","pink","red","gray"],i=["blue","green","purple","orange","pink","yellow"],c=["red","gray"],s=[...l,"multi"],d={blue:{25:"#f6fafe",50:"#e8f3fe",75:"#d1e5fd",100:"#a4cdfb",200:"#63a8f8",300:"#539af8",400:"#3a83f7",500:"#2c67c5",600:"#1f4e94",700:"#173e76",800:"#133463",900:"#0c274a",1e3:"#020d18"},purple:{25:"#f8f5fd",50:"#ede5fc",75:"#ddcffa",100:"#c9b1f6",200:"#b897f4",300:"#a67df2",400:"#8952ee",500:"#7849d1",600:"#643cae",700:"#4e2f88",800:"#3b2366",900:"#291947",1e3:"#0f0a18"},pink:{25:"#fef8fb",50:"#fdedf4",75:"#fcd8e7",100:"#fbbfd7",200:"#f8a6c8",300:"#f68ebc",400:"#f077af",500:"#cf6194",600:"#ab4f7a",700:"#873e60",800:"#663049",900:"#462132",1e3:"#1d0f15"},orange:{25:"#fdf5f1",50:"#fbe8db",75:"#f7d1b8",100:"#f4ba96",200:"#f1a275",300:"#ef8b57",400:"#ee7c37",500:"#d25e28",600:"#ac4f23",700:"#87401d",800:"#653218",900:"#45240d",1e3:"#1f1209"},yellow:{25:"#fefbee",50:"#fdf6dc",75:"#fcefbe",100:"#fae598",200:"#f9dc78",300:"#f8d45d",400:"#f6c543",500:"#d9a337",600:"#b8802b",700:"#95611f",800:"#734615",900:"#51300c",1e3:"#221403"},green:{25:"#effaf3",50:"#def3e5",75:"#c2eace",100:"#9fddb1",200:"#83d197",300:"#6bc67f",400:"#53b559",500:"#48a04c",600:"#3a843f",700:"#2c6732",800:"#1f4e25",900:"#14361a",1e3:"#041208"},red:{25:"#fff4f3",50:"#ffe5e0",75:"#ffc9c0",100:"#ffaa9c",200:"#ff8583",300:"#ff6764",400:"#fa423e",500:"#de282f",600:"#ba2623",700:"#92201d",800:"#6d1b18",900:"#4a130d",1e3:"#1f0a07"},gray:{0:"#ffffff",50:"#f9f9f9",75:"#f3f3f3",100:"#e8e8e8",200:"#cdcdcd",300:"#afafaf",400:"#8f8f8f",500:"#5d5d5d",600:"#414141",700:"#303030",800:"#212121",900:"#181818",1e3:"#000000"}};function u(e,t){let r=d[e];return t.map(e=>r[e])}let f={blue:{light:[800,600,500,300,100,50],dark:[50,100,200,400,500,600]},purple:{light:[800,700,500,300,100,50],dark:[50,75,200,300,500,600]},green:{light:[900,700,600,400,200,75],dark:[50,100,300,500,600,700]},yellow:{light:[800,700,600,500,400,100],dark:[50,100,400,500,600,800]},orange:{light:[900,700,500,300,100,50],dark:[50,100,300,500,600,700]},pink:{light:[900,700,600,400,200,75],dark:[50,100,300,500,600,700]},red:{light:[800,700,500,300,100,50],dark:[50,100,300,400,600,700]},gray:{light:[700,600,500,400,300,200],dark:[50,200,300,400,500,600]}};function m(e,t){return u(e,f[e][t])}let p={blue:{light:[700,500,300,100,50,25],dark:[50,100,300,500,700,900]},purple:{light:[700,500,300,100,50,25],dark:[50,100,300,500,700,900]},green:{light:[800,600,400,100,50,25],dark:[50,100,400,600,800,900]},yellow:{light:[800,600,400,100,50,25],dark:[50,100,400,600,800,900]},orange:{light:[800,600,400,100,50,25],dark:[50,100,400,600,800,900]},pink:{light:[800,600,400,100,50,25],dark:[50,200,500,700,900,1e3]},red:{light:[700,500,300,100,50,25],dark:[50,100,300,500,700,900]},gray:{light:[700,500,400,200,75,50],dark:[75,200,400,500,700,800]}};function g(e,t){return u(e,p[e][t])}function h(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function b(e){return h(e)&&"string"==typeof e.keyline&&e.keyline.length>0&&Array.isArray(e.fill)&&e.fill.length>0&&e.fill.every(e=>"string"==typeof e&&e.length>0)}function v(e){return h(e)&&b(e.light)&&(void 0===e.dark||b(e.dark))}e.s(["a",0,i,"i",0,s,"n",0,m,"o",0,c,"r",0,l,"t",0,g],944788),e.s(["s",0,v,"Y",0,function(e){if(!e||"object"!=typeof e)return!1;let t=e.vegaLiteSpec;return"object"==typeof t&&null!==t&&!Array.isArray(t)}],29648);let y=Object.fromEntries(l.map(e=>{let t,r,o,n;return[e,(t=m(e,"light"),r=m(e,"dark"),o=g(e,"light"),n=g(e,"dark"),{name:e,slots:t.map((e,a)=>({token:`theme${a+1}`,light:{ink:e,boundedFill:o[a],keyline:t[0]},dark:{ink:r[a],boundedFill:n[a],keyline:r[0]}})),categoryTokens:["theme3","theme2","theme4","theme1","theme5"],defaultToken:"theme3"})]})),k=[{prefix:"",paletteIndex:2},{prefix:"dark_",paletteIndex:1},{prefix:"light_",paletteIndex:3}];function x(e,{prefix:t,paletteIndex:r}){return{...y[e].slots[r],token:`${t}${e}`}}let w=k.flatMap(e=>i.map(t=>x(t,e))),$=[...w,...c.flatMap(e=>k.map(t=>x(e,t)))],A=w.map(({token:e})=>e),E=$.map(({token:e})=>e),C={...y,multi:{name:"multi",slots:$,categoryTokens:A}};function S(e){return e.slots.find(({token:t})=>t===e.defaultToken)??e.slots[0]}function M(e){return{name:"custom",slots:e,defaultToken:e[Math.floor(e.length/2)].token}}let O={background:"--dotcom-chart-color-background",foreground:"--dotcom-chart-color-foreground",mutedForeground:"--dotcom-chart-color-muted-foreground",secondaryForeground:"--dotcom-chart-color-secondary-foreground",controlBorder:"--dotcom-chart-color-control-border",controlBorderHover:"--dotcom-chart-color-control-border-hover",popoverBackground:"--dotcom-chart-color-popover-background",menuItemFocusBackground:"--dotcom-chart-color-menu-item-focus-background"};function U(e,t){return`--dotcom-chart-theme-${e}-${t}-ink`}function L(e,t){return`--dotcom-chart-theme-${e}-${t}-bounded-fill`}function P(e,t){return`--dotcom-chart-theme-${e}-${t}-keyline`}function T(e){let{name:t,slots:r}=e,o=S(e);return{name:t,keyline:`var(${"custom"===t?z:P(t,r.indexOf(o)+1)})`,fill:r.map((e,r)=>"custom"===t?`var(${j}${r})`:`var(${L(t,r+1)})`)}}let G=s.reduce((e,t)=>(e[t]=T(C[t]),e),{}),z="--custom-chart-theme-keyline",j="--custom-chart-theme-fill-";e.s(["_",0,S,"a",0,"var(--dotcom-chart-render-scale, 1)","c",0,j,"d",0,T,"f",0,G,"g",0,function(e){return e.categoryTokens??e.slots.map(({token:e})=>e)},"i",0,O,"l",0,z,"m",0,function(e){return v(e)?M(Array.from({length:Math.max(e.light.fill.length,e.dark?.fill.length??0)},(t,r)=>{let o=e.light.fill[r]??"";return{token:`theme${r+1}`,light:{ink:o,boundedFill:o,keyline:e.light.keyline},dark:{ink:e.dark?.fill[r]??o,boundedFill:e.dark?.fill[r]??o,keyline:e.dark?.keyline??e.light.keyline}}})):null},"n",0,U,"p",0,C,"r",0,P,"s",0,[1,2,3,4,5,6],"t",0,L,"v",0,function(e){return"custom"!==e.name?C[e.name]:M(e.fill.map((t,r)=>({token:`theme${r+1}`,light:{ink:t,boundedFill:t,keyline:e.keyline},dark:{ink:t,boundedFill:t,keyline:e.keyline}})))},"y",0,E],726822);let I={fontSize:14,lineHeight:20,symbolGap:6,inactiveOpacity:.35,fadeDuration:240,fadeEasing:"cubic-bezier(0.33, 1, 0.67, 1)",columnGap:20,rowGap:6,groupColumnGap:32,groupGap:20,titleGap:8,plotGap:12,minimumAlignedWidth:160,tapDuration:1500,tapMovementTolerance:10,tapTimeLimit:750};function B(e,t,r="row"){let o=Math.max(1,Math.min(e,t));if("column"===r){let t=Math.floor(e/o),r=e%o;return Array.from({length:o},(e,o)=>Array.from({length:t+ +(o<r)},(e,t)=>({column:o,row:t}))).flat()}return Array.from({length:e},(e,t)=>({column:t%o,row:Math.floor(t/o)}))}let F=`
[data-legend-entry-id] {
  display: flex;
  min-width: 0;
}
[data-legend-content] {
  padding-inline-start: 0;
}
[data-legend-layout] {
  --legend-columns: 1;
  --legend-cell-before: var(--legend-group-before);
  display: grid;
  grid-template-columns: repeat(var(--legend-columns), minmax(0, max-content));
  justify-content: start;
}
[data-dotcom-chart-legend] [data-legend-label] {
  text-wrap: balance;
}
[data-legend-layout="items"] {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}
[data-legend-layout="items"] > [data-legend-entry-id] {
  flex: 0 0 auto;
  width: max-content;
  max-width: 100%;
}
[data-legend-column] {
  --legend-cell-column: var(--legend-column-1);
  --legend-native-band: var(--legend-band-1);
  --legend-native-group-before: clamp(0px, calc((1 - var(--legend-native-band)) * var(--legend-group-before)), var(--legend-group-before));
  --legend-native-band-before: clamp(0px, calc((var(--legend-columns) - 1) * var(--legend-native-band) * ${I.columnGap-I.rowGap}px), ${I.columnGap-I.rowGap}px);
  --legend-cell-before: max(var(--legend-native-group-before), var(--legend-native-band-before));
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span var(--legend-native-rows);
  min-width: 0;
}
[data-legend-column] > [data-legend-entry-id] {
  grid-row: var(--legend-cell-row);
}
[data-legend-flow-cell] {
  --legend-cell-column: var(--legend-column-1);
  --legend-cell-row: var(--legend-row-1);
  grid-column: var(--legend-cell-column);
  grid-row: var(--legend-cell-row);
}
`;e.s(["a",0,F,"c",0,I,"i",0,function(e){let t=[],r=0,o=0;return{indices:e.map(e=>{let n=e.filter(e=>null!==e).length,a=1===n?r:0;return n>0&&(r=1===n?r+1:0),o=Math.max(o,a+n),e.map(e=>{if(null!==e)return t.push({index:a,width:e}),a++})}),requirements:Array.from({length:o},(e,r)=>{let o=r+1,n=Array(o).fill(0);for(let e of t){let t=e.index%o;n[t]=Math.max(n[t],e.width)}return n.reduce((e,t)=>e+t,0)+r*I.columnGap})}},"n",0,function(e,t,r="row"){let o=Array.from({length:e},()=>({}));for(let n=1;n<=t;n++)B(e,n,r).forEach(({column:e,row:t},r)=>{o[r][`--legend-column-${n}`]=e+1,o[r][`--legend-row-${n}`]=t+1});return o},"o",0,function(e){let t=Array.from({length:e},()=>({}));for(let r=1;r<=e;r++)t.forEach((e,t)=>{e[`--legend-column-${r}`]=t%r+1,e[`--legend-band-${r}`]=Math.floor(t/r)});return t},"r",0,function(e){if(e.layout?.direction==="vertical"&&e.layout.columns>0&&e.entries.length){let t=new Set;if(e.entries.every(({row:e,column:r})=>{if(!Number.isSafeInteger(e)||!Number.isSafeInteger(r)||e<0||r<0)return!1;let o=`${r}:${e}`;return!t.has(o)&&(t.add(o),!0)})){let t=[...new Set(e.entries.map(e=>e.column))].sort((e,t)=>e-t),r=[...new Set(e.entries.map(e=>e.row))].sort((e,t)=>e-t);return{mode:"columns",rows:r.length,columns:t.map((t,o)=>e.entries.filter(e=>e.column===t).sort((e,t)=>e.row-t.row).map(e=>({entry:e,column:o,row:r.indexOf(e.row)})))}}}return{mode:e.layout?.direction==="horizontal"?0===e.layout.columns?"items":"row":e.layout?.columns===0?"row":"wrap",rows:e.entries.length,columns:[e.entries.map((e,t)=>({entry:e,row:t,column:0}))]}},"s",0,function(e,t,r,o){let n=r.slice(1).map((r,o)=>{let n=o+2;return"guides"===t?`@container dotcom-chart-legend-content (min-width: ${r}px) {
  ${e} { --legend-guide-columns: ${n}; }
}`:`@container dotcom-chart-legend-content (min-width: ${r}px) {
  ${e} { --legend-columns: ${n}; }
  ${e} > ${"columns"===t?"[data-legend-column]":"[data-legend-flow-cell]"} {
    --legend-cell-column: var(--legend-column-${n});
    ${"columns"===t?`--legend-native-band: var(--legend-band-${n});`:`--legend-cell-row: var(--legend-row-${n});`}
  }
}`}).join("\n");if(!o)return n;let a=r[r.length-1];return`${n}
@container dotcom-chart-legend-content (width < ${a}px) {
  ${e} {
    --legend-columns: 1;
    padding-block-start: var(--legend-group-before);
  }
  ${e} > [data-legend-column] {
    display: contents;
  }
  ${e} [data-legend-entry-id] {
    --legend-cell-before: 0px;
    --legend-cell-column: calc(1 + mod(var(--legend-group-index), var(--legend-columns)));
    grid-column: var(--legend-cell-column);
    grid-row: auto;
  }
  ${e} [data-legend-spacer] {
    display: none;
  }
}
${o.slice(1).map((t,r)=>t<a?`@container dotcom-chart-legend-content (${t}px <= width < ${a}px) {
  ${e} { --legend-columns: ${r+2}; }
}`:"").join("\n")}`},"t",0,function({widths:e,flow:t,maxColumns:r=e.length},o=I.columnGap){return e.slice(0,Math.max(1,r)).map((r,n)=>{let a=n+1,l=Array(a).fill(0);return B(e.length,a,t).forEach(({column:t},r)=>{l[t]=Math.max(l[t],e[r])}),l.reduce((e,t)=>e+t,0)+(a-1)*o})}],917029);var N=e.i(901962),H=e.i(101372);let R="dotcom-chart-theme-scope";function _(e){return e.map(([e,t])=>`${e}: ${t};`).join("\n  ")}function D(e,t,r){return`
${e} {
  ${_(t)}
}
${e}:where(.dark, .dark *):not(:where(.dark .light, .dark .light *)) {
  ${_(r)}
}
@media (prefers-color-scheme: dark) {
  ${e}:not(:where(.light, .light *)) {
    ${_(r)}
  }
}`}function Y(e){return`.${R}[data-dotcom-chart-theme-provider-scope="${e}"]`}function W(e,r){return Object.entries(O).map(([o,n])=>[n,r?.[o]??t.colors[e][o]])}function J(e){return Object.entries(n(e)).flatMap(([e,t])=>{let r=O[e];return r&&t?[[r,t]]:[]})}function K(e){return s.flatMap(t=>C[t].slots.flatMap((r,o)=>[[U(t,o+1),r[e].ink],[L(t,o+1),r[e].boundedFill],[P(t,o+1),r[e].keyline]]))}function V(e,t){if(!v(e))return[];let r=e[t];return r?[[z,r.keyline],...r.fill.map((e,t)=>[`${j}${t}`,e])]:[]}let Z=`
${F}
[data-dotcom-chart-filter-control],
[data-dotcom-chart-back] {
  border: 1px solid var(--dotcom-chart-color-control-border);
  box-shadow: inset 0 0 0 999px transparent;
}
[data-dotcom-chart-filter-segmented] {
  border: 1px solid transparent;
  box-shadow: inset 0 0 0 999px transparent;
}
[data-dotcom-chart-filter-control]:is(:hover, :focus-visible, [data-state='open']),
[data-dotcom-chart-back]:hover {
  border-color: color-mix(in srgb, var(--dotcom-chart-color-control-border) 85%, var(--dotcom-chart-color-control-border-hover) 15%);
  box-shadow: inset 0 0 0 999px var(--dotcom-chart-color-menu-item-focus-background);
}
[data-dotcom-chart-filter-control]:focus-visible {
  border-color: var(--dotcom-chart-color-control-border-hover);
}
/* Keep ordinary hover rules available when relational selectors are unsupported. */
@supports selector(:has(*)) {
  [data-dotcom-chart-filter-checkbox]:has(input:focus-visible),
  [data-dotcom-chart-filter-segmented]:has([data-dotcom-chart-filter-segment]:focus-visible) {
    border-color: var(--dotcom-chart-color-control-border-hover);
    box-shadow: inset 0 0 0 999px var(--dotcom-chart-color-menu-item-focus-background);
  }
}
[data-dotcom-chart-navigation-input] [data-dotcom-chart-back]:focus,
[data-dotcom-chart-navigation-unit] :focus {
  outline: none;
}
[data-dotcom-chart-navigation-input="keyboard"] [data-dotcom-chart-back]:focus {
  outline: none;
  border-color: var(${O.foreground}) !important;
  outline: 1px solid var(${O.foreground});
  outline-offset: -2px;
}
[data-dotcom-chart-navigation-input="keyboard"] [data-dotcom-chart-mark-id]:focus {
  outline: 2px solid var(${O.foreground});
  outline-offset: 2px;
}
[data-dotcom-chart-navigation-input="keyboard"] path[data-dotcom-chart-mark-id]:focus {
  outline: none;
  stroke: var(${O.foreground});
  stroke-width: 2px;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
@media (forced-colors: active) {
  [data-dotcom-chart-navigation-input="keyboard"] [data-dotcom-chart-back]:focus {
    border-color: ButtonText !important;
  }
  [data-dotcom-chart-navigation-input="keyboard"] path[data-dotcom-chart-mark-id]:focus {
    stroke: CanvasText;
  }
}
[data-dotcom-chart-legend-highlight]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
[data-dotcom-chart-scroll-container]::-webkit-scrollbar {
  display: none;
}
[data-dotcom-chart-scroll-control]::before {
  background: linear-gradient(var(--dotcom-chart-overflow-fade-direction), var(${O.background}) 0%, color-mix(in srgb, var(${O.background}) 92%, transparent) 9%, color-mix(in srgb, var(${O.background}) 78%, transparent) 18%, color-mix(in srgb, var(${O.background}) 62%, transparent) 27%, color-mix(in srgb, var(${O.background}) 45%, transparent) 36%, color-mix(in srgb, var(${O.background}) 32%, transparent) 45%, color-mix(in srgb, var(${O.background}) 21%, transparent) 54%, color-mix(in srgb, var(${O.background}) 13%, transparent) 63%, color-mix(in srgb, var(${O.background}) 6%, transparent) 72%, color-mix(in srgb, var(${O.background}) 2%, transparent) 81%, transparent 90%);
  content: "";
  inset: 0;
  pointer-events: none;
  position: absolute;
}
[data-dotcom-chart-scroll-control="start"]::before {
  --dotcom-chart-overflow-fade-direction: 90deg;
  transform: scaleX(var(--dotcom-chart-overflow-start-fade-scale, 0));
  transform-origin: left center;
}
[data-dotcom-chart-scroll-control="end"]::before {
  --dotcom-chart-overflow-fade-direction: 270deg;
  transform: scaleX(var(--dotcom-chart-overflow-end-fade-scale, 0));
  transform-origin: right center;
}
[data-dotcom-chart-scroll-control]::after {
  background: linear-gradient(var(${O.popoverBackground}), var(${O.popoverBackground})), var(${O.background});
  border: 1px solid var(${O.controlBorder});
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%), inset 0 0 0 999px transparent;
  box-sizing: border-box;
  content: "";
  height: 24px;
  opacity: var(--dotcom-chart-overflow-control-opacity, 0);
  pointer-events: none;
  position: absolute;
  top: var(--dotcom-chart-overflow-marks-center, 50%);
  transform: translateY(-50%);
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;
  width: 24px;
}
[data-dotcom-chart-scroll-control="start"]::after {
  left: max(var(--dotcom-chart-edge-gutter, 0px), 8px);
}
[data-dotcom-chart-scroll-control="end"]::after {
  right: max(var(--dotcom-chart-edge-gutter, 0px), 8px);
}
[data-dotcom-chart-scroll-control] svg {
  opacity: calc(0.64 * var(--dotcom-chart-overflow-control-opacity, 0));
  pointer-events: none;
  position: absolute;
  top: var(--dotcom-chart-overflow-marks-center, 50%);
  transform: translateY(-50%);
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}
[data-dotcom-chart-scroll-control="start"] svg {
  left: calc(max(var(--dotcom-chart-edge-gutter, 0px), 8px) + 6px);
}
[data-dotcom-chart-scroll-control="end"] svg {
  right: calc(max(var(--dotcom-chart-edge-gutter, 0px), 8px) + 6px);
}
[data-dotcom-chart-scroll-control]:is(:hover, :focus-visible, :active, [data-dotcom-chart-touch-pressed])::after {
  border-color: color-mix(in srgb, var(${O.controlBorder}) 85%, var(${O.controlBorderHover}) 15%);
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%), inset 0 0 0 999px var(${O.menuItemFocusBackground});
}
[data-dotcom-chart-scroll-control]:focus-visible {
  outline: none;
}
[data-dotcom-chart-scroll-control]:focus-visible::after {
  border-color: var(${O.controlBorderHover});
}
@media (prefers-reduced-motion: reduce) {
  [data-dotcom-chart-back],
  [data-dotcom-chart-filter-control],
  [data-dotcom-chart-scroll-control],
  [data-dotcom-chart-scroll-control]::after,
  [data-dotcom-chart-scroll-control] svg {
    transition: none !important;
  }
}`,X=({colors:e,includeChartChrome:t=!1,selector:r})=>{let o=[...W("light",e),...K("light")],n=[...W("dark",e),...K("dark")];return(0,H.jsx)("style",{"data-dotcom-chart-theme-styles":"shared",children:`${D(r,o,n)}${t?Z:""}`})},q=(0,N.createContext)(null);e.s(["a",0,({colors:e,wrapperId:t})=>(0,H.jsx)("style",{"data-dotcom-chart-theme-styles":"colors",children:D(`#${t}`,J(e),J(e))}),"c",0,R,"i",0,function(){return(0,N.useContext)(q)?.style},"n",0,function({children:e,className:t,...r}){let o=(0,N.useContext)(q),n=(0,N.useId)(),a=o?.scopeId??n;return(0,H.jsxs)("div",{...r,className:`${R} ${t??""}`,"data-dotcom-chart-theme-provider-scope":a,children:[!o&&(0,H.jsx)(X,{selector:Y(a)}),e]})},"o",0,({customTheme:e,wrapperId:t})=>{let r=V(e,"light"),o=V(e,"dark");return 0===r.length&&0===o.length?null:(0,H.jsx)("style",{"data-dotcom-chart-theme-styles":"custom",children:D(`#${t}`,r,o)})},"r",0,function(){return(0,N.useContext)(q)?.scopeId??null},"s",0,X,"t",0,({children:e,style:t})=>{let r=(0,N.useId)(),o=a(t);return(0,H.jsxs)(q.Provider,{value:{scopeId:r,style:t},children:[(0,H.jsx)(X,{colors:o.colors,includeChartChrome:!0,selector:Y(r)}),e]})}],490661)},215453,e=>{"use strict";var t=e.i(101372),r=e.i(901962),o=e.i(536925);let n="openai.gpuPerformance.v1",a="openai.gpuPerformance.override.v1",l=new Map;function i(e){return e<=0?0:1===e||2===e||3===e?e:1}function c(e){try{return window.localStorage.getItem(e)}catch{return null}}function s(e,t){try{window.localStorage.setItem(e,t)}catch{}}function d(e){try{window.localStorage.removeItem(e)}catch{}}function u(e){return"0"===e||"1"===e||"2"===e||"3"===e?Number(e):null}function f(){return window.matchMedia?.("(hover: none) and (pointer: coarse)").matches||navigator.maxTouchPoints>0}function m(e){null===e?d(a):s(a,String(e))}function p(e,t=Date.now()){return{createdAt:t,isMobile:f(),source:"override",supportsWebGL:e>0,tier:e}}function g(e,t){return{createdAt:e.createdAt,device:e.device,error:e.error,fps:e.fps,isMobile:e.isMobile,renderer:e.renderer,source:t,supportsWebGL:e.supportsWebGL,tier:e.tier}}function h({error:e,now:t,source:r="fallback"}){return{createdAt:t,error:e,isMobile:f(),source:r,supportsWebGL:!0,tier:1}}async function b(){return(await e.A(523651)).getGPUTier}async function v({benchmarksURL:e,cachedProfile:t,getGPUTier:r,now:o}){if(!e&&!r)return t?g(t,"stale-cache"):h({error:"GPU benchmark CDN URL is not configured",now:o,source:"benchmark-fetch-failed"});try{var a;let l,c,d=r??await b(),u=(a=await d({benchmarksURL:e??"",failIfMajorPerformanceCaveat:!1}),l=function(e){switch(e){case"BENCHMARK":return"benchmark";case"BENCHMARK_FETCH_FAILED":return"benchmark-fetch-failed";case"BLOCKLISTED":return"blocklisted";case"FALLBACK":return"fallback";case"SSR":return"ssr";case"WEBGL_UNSUPPORTED":return"unsupported"}}(a.type),c="WEBGL_UNSUPPORTED"!==a.type&&"BLOCKLISTED"!==a.type&&"SSR"!==a.type,{createdAt:o,device:a.device,fps:a.fps,isMobile:a.isMobile??f(),renderer:a.gpu,source:l,supportsWebGL:c,tier:c?i(a.tier):0});if("benchmark-fetch-failed"===u.source){if(t)return g(t,"stale-cache");return h({now:o,source:"benchmark-fetch-failed"})}return"override"!==u.source&&s(n,JSON.stringify({...u,expiresAt:o+6048e5})),u}catch(e){if(t)return g(t,"stale-cache");return h({error:e instanceof Error?e.message:String(e),now:o,source:"error"})}}async function y({benchmarksURL:e,forceRefresh:t=!1,getGPUTier:r,ignoreOverride:o=!1,mode:s="passive",now:d}={}){let f=d??Date.now(),m=o?null:u(new URLSearchParams(window.location.search).get("gpuTier"))??u(c(a));if(null!==m)return p(m,f);let h=function(){let e=c(n);if(!e)return null;try{let t=JSON.parse(e);if(t&&"number"==typeof t.createdAt&&"boolean"==typeof t.isMobile&&"boolean"==typeof t.supportsWebGL)return{...t,tier:i(t.tier)}}catch{}return null}(),b=h?.expiresAt!==void 0&&h.expiresAt>f;if(!t&&"passive"===s&&h&&b)return g(h,"cache");let k=(e??"/__cdn_openai_com_____/webgl/detect-gpu").trim()||null,x=!t&&!r&&!o&&"passive"===s&&void 0===d&&null!==k;if(x&&k){let e=l.get(k);if(e)return e}let w=v({benchmarksURL:k,cachedProfile:h,getGPUTier:r,now:f});if(!x||!k)return w;let $=w.finally(()=>{l.get(k)===$&&l.delete(k)});return l.set(k,$),$}var k=e.i(72010);let x=(0,r.createContext)(null);function w(){let e=(0,r.useContext)(x);if(!e)throw Error("useGpuPerformance must be used within GpuPerformanceProvider");return e}e.s(["g",0,function({children:e,detector:a=y,reducedMotion:l}){let i=(0,o.T)("(prefers-reduced-motion: reduce)",{defaultValue:!0,initializeWithValue:!1}),c=l??i,[s,u]=(0,r.useState)(null),[f,g]=(0,r.useState)("idle"),h=(0,r.useRef)(null),b=(0,r.useCallback)(async(e={})=>{let t,r,o=(t=e.mode??"passive",r=e.benchmarksURL?.trim(),e.forceRefresh||e.getGPUTier||e.ignoreOverride||"passive"!==t||void 0!==e.now||""===r?null:r??"default");if(o&&h.current?.key===o)return h.current.promise;g("loading");let n=a(e).then(e=>(u(e),g("ready"),e)).catch(e=>{throw g("error"),e}).finally(()=>{h.current?.promise===n&&(h.current=null)});return o&&(h.current={key:o,promise:n}),n},[a]),v=(0,r.useCallback)(()=>b({forceRefresh:!0,mode:"benchmark"}),[b]),k=(0,r.useCallback)(()=>{d(n)},[]),w=(0,r.useCallback)(e=>{m(e);let t=p(e);return u(t),g("ready"),Promise.resolve(t)},[]),$=(0,r.useCallback)(async()=>(m(null),b({forceRefresh:!0,mode:"benchmark"})),[b]),A=(0,r.useMemo)(()=>({clearCache:k,clearOverride:$,profile:s,reducedMotion:c,refresh:v,requestProfile:b,setOverride:w,status:f}),[k,$,s,c,v,b,w,f]);return(0,t.jsx)(x.Provider,{value:A,children:e})},"v",0,w,"h",0,function(){let{reducedMotion:e}=w(),t=function(){let{profile:e,requestProfile:t,status:o}=w();return(0,r.useEffect)(()=>{e||"loading"===o||"error"===o||t().catch(()=>{})},[e,t,o]),e}();return(0,r.useMemo)(()=>(0,k.f)(t,{reducedMotion:e}),[t,e])}],215453)},72010,e=>{"use strict";e.s(["f",0,function(e,t={}){var r;let o=0===(r=e?.tier)||1===r||2===r||3===r?r:1,n=o>0&&(e?.supportsWebGL??!0),a=t.reducedMotion??!1;return{canUseWebGL:()=>n,getAntialias:(e=!1)=>e&&n&&o>=2,getDpr:()=>(function(e){switch(e){case 0:case 1:return[1,1];case 2:return[1,1.5];case 3:return[1,2]}})(o),getMaxParticleCount:()=>(function(e){switch(e){case 0:return 0;case 1:return 12e3;case 2:return 28e3;case 3:return 4e4}})(o),getMaxShaderSamples:()=>(function(e){switch(e){case 0:return 0;case 1:return 4;case 2:return 8;case 3:return 16}})(o),getPostprocessing:()=>{let e=function(e){switch(e){case 0:case 1:return"none";case 2:return"selective";case 3:return"full"}}(o);return a&&"full"===e?"selective":e},getShaderQuality:()=>(function(e){switch(e){case 0:return"none";case 1:return"low";case 2:return"medium";case 3:return"high"}})(o),getShaderQualityLevel:()=>o,shouldUseContinuousMotion:()=>n&&!a,tier:o}}])}]);