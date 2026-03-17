import React from 'react';
import { HealthAnalysis } from '@/src/types';
import { Trash2, Loader2 } from 'lucide-react';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HealthAnalysis | null;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

// Bază de date cu recomandări alimentare
const healthRecommendations: { [key: string]: { low?: string; high?: string } } = {
  'vitamina d': {
    low: "Consumă pește gras (somon, macrou), ciuperci expuse la soare, ouă și lactate fortificate. Expune-te la soare 15-20 de minute pe zi, în siguranță.",
    high: "Redu suplimentele de Vitamina D și evită alimentele excesiv fortificate. Este rar să ai un nivel prea mare doar din alimentație sau soare; consultă un medic."
  },
  'glicemie': {
    low: "Consumă o sursă rapidă de carbohidrați (suc de fructe, miere), urmată de o masă echilibrată. Nu sări peste mese.",
    high: "Alege carbohidrați complecși (pâine integrală, orez brun), legume fără amidon (broccoli, spanac), proteine slabe. Bea multă apă și fă mișcare regulat."
  },
  'glucoza': {
    low: "Nivel scăzut de glucoză. Consumă o mică sursă de carbohidrați simpli (un fruct, puțină miere) urmată de o masă completă pentru stabilizare.",
    high: "Alege carbohidrați complecși (cereale integrale), crește aportul de fibre (legume) și fă mișcare. Evită complet dulciurile și sucurile zahărate."
  },
  'fier': {
    low: "Mănâncă carne roșie slabă, spanac, linte, fasole, tofu și semințe de dovleac. Asociază cu Vitamina C (citrice, ardei) pentru o mai bună absorbție.",
    high: "Limitează carnea roșie și organele. Evită suplimentele cu fier și alcoolul în exces. Donează sânge, dacă ești eligibil."
  },
  'sideremie': {
    low: "Mănâncă carne roșie slabă, ficat, spanac și linte. Consumă aceste alimente împreună cu surse de Vitamina C (citrice, roșii) pentru a ajuta absorbția.",
    high: "Evită suplimentele cu fier, consumul excesiv de carne roșie, fructe de mare crude și alcoolul. Discută cu medicul despre posibilitatea donării de sânge."
  },
  'trigliceride': {
      low: "Nivelul scăzut este de obicei inofensiv. Menține o dietă echilibrată și sănătoasă.",
      high: "Limitează zahărul, făina albă și alcoolul. Consumă pește gras bogat în Omega-3 (somon, sardine), nuci și semințe. Fă mișcare aerobică."
  },
  'hdl': {
    low: "Colesterolul HDL ('bun') e prea mic. Fă mișcare! Consumă grăsimi sănătoase: ulei de măsline, avocado, nuci, semințe și pește gras. Renunță la fumat.",
    high: "Nivelul ridicat de HDL este excelent și protector pentru inimă! Continuă stilul de viață activ și dieta bogată în Omega-3."
  },
  'ldl': {
    low: "Nivelul scăzut de LDL este benefic pentru sănătatea inimii și arterelor tale.",
    high: "Colesterolul LDL ('rău') e mare. Crește aportul de fibre solubile (ovăz, mere, fasole). Limitează grăsimile saturate (unt, carne grasă) și evită prăjelile."
  },
  'colesterol': {
    low: "Un nivel prea scăzut este extrem de rar. Asigură-te că ai o dietă echilibrată cu grăsimi sănătoase.",
    high: "Mănâncă ovăz, fasole, nuci, avocado și mere. Limitează drastic grăsimile saturate (prăjeli, patiserie, carne procesată, fast-food)."
  },
  'hemoglobina': {
    low: "Crește aportul de fier, vitamina B12 și acid folic. Consumă carne roșie slabă, ficat, spanac, linte și citrice (ajută absorbția fierului).",
    high: "Hidratează-te corespunzător. Evită fumatul și expunerea prelungită la medii toxice. Consultă un medic dacă valoarea este extrem de mare."
  },
  'leucocite': {
    low: "Sprijină imunitatea: dormi 7-8 ore, consumă alimente bogate în Vitamina C (citrice, ardei), zinc (semințe de dovleac), usturoi și iaurt cu probiotice.",
    high: "Poate indica o infecție sau o inflamație. Hidratează-te foarte bine, odihnește-te și consumă alimente ușoare și supe calde."
  },
  'tgo': {
    low: "Valori scăzute ale transaminazelor sunt în general un semn de ficat sănătos.",
    high: "Protejează-ți ficatul! Evită complet alcoolul, medicamentele neesențiale, zahărul rafinat și mezelurile. Consumă legume crucifere (broccoli) și ceai verde."
  },
  'tgp': {
    low: "Valori scăzute ale transaminazelor sunt în general un semn de ficat sănătos.",
    high: "Semn de stres hepatic. Renunță la alcool, prăjeli, fast-food și sucuri dulci. Bea multă apă și axează-te pe o dietă curată, mediteraneană."
  },
  'creatinina': {
    low: "Poate indica o masă musculară scăzută. Asigură-te că ai un aport adecvat de proteine (ouă, carne, lactate) și ia în calcul antrenamentele de forță.",
    high: "Protejează rinichii: hidratează-te optim, redu consumul excesiv de carne roșie, evită suplimentele cu creatină și controlează tensiunea arterială."
  },
  'uree': {
    low: "Apare în diete sărace în proteine sau consum excesiv de lichide. Consumă proteine de bună calitate la fiecare masă principală.",
    high: "Hidratează-te mai bine! Reduce ușor aportul de proteine animale (carne) pentru câteva zile și evită deshidratarea prin cafea/alcool în exces."
  },
  'acid uric': {
    low: "Nivelul scăzut este rar și de obicei inofensiv. Menține o dietă echilibrată și normală.",
    high: "Risc de gută. Evită carnea roșie, organele (ficat), fructele de mare, alcoolul (mai ales berea) și băuturile cu fructoză. Bea 2-3 litri de apă zilnic!"
  },
  'bilirubina': {
    low: "Valorile scăzute sunt de cele mai multe ori normale și nu reprezintă un motiv de îngrijorare.",
    high: "Poate indica o suprasolicitare hepatică sau biliară. Evită alcoolul, prăjelile și grăsimile procesate. Hidratează-te bine și consumă legume cu frunze verzi."
  },
  'trombocite': {
    low: "Risc de sângerare ușoară. Evită alcoolul în exces și alimentele care subțiază sângele. Asigură-te că ai un aport adecvat de Vitamina K (legume verzi) și B12.",
    high: "Risc de cheaguri. Hidratează-te excelent, consumă alimente antiinflamatoare (usturoi, ghimbir, ulei de măsline) și evită stilul de viață sedentar."
  },
  'sodiu': {
    low: "Consumă cantități moderate de sare iodată, măsline, brânzeturi și supe clare. Nu exagera cu apa dacă ești deja diagnosticat cu hiponatremie.",
    high: "Reduce drastic sarea adăugată, mezelurile, telemeaua, conservele și mâncarea de tip fast-food. Crește aportul de apă și alimente bogate în potasiu."
  },
  'zinc': {
    low: "Susține imunitatea! Integrează în dietă semințe de dovleac, carne de vită slabă, stridii, linte, năut și caju.",
    high: "Evită suplimentele cu zinc pe termen lung (pot interfera negativ cu absorbția altor minerale, cum ar fi cuprul)."
  },
  'calciu': {
    low: "Consumă lactate, migdale, semințe de chia, broccoli și tofu. Asigură-te că ai un nivel bun de Vitamina D pentru a putea absorbi calciul!",
    high: "Redu consumul de suplimente cu calciu/antiacide și evită deshidratarea pentru a preveni pietrele la rinichi. Consultă un endocrinolog."
  },
  'magneziu': {
    low: "Integrează în dietă nuci, semințe de dovleac, spanac, ciocolată neagră (peste 70% cacao), avocado și fasole neagră.",
    high: "Nivelurile ridicate din alimentație sunt foarte rare. Evită suplimentele alimentare și laxativele care conțin magneziu."
  },
  'potasiu': {
    low: "Esențial pentru mușchi. Consumă banane, cartofi (la cuptor), avocado, spanac, ciuperci și pepene roșu.",
    high: "Evită înlocuitorii de sare pe bază de potasiu și limitează fructele foarte bogate în potasiu dacă ai probleme cunoscute de rinichi."
  },
  'tsh': {
    low: "(Posibilă Hipertiroidie) Evită excesul de iod (alge, prea multă sare iodată). Consumă legume crucifere crude (varză, broccoli) și odihnește-te.",
    high: "(Posibilă Hipotiroidie) Asigură-te că ai suficient iod, seleniu și zinc (nuci braziliene, pește, ouă, carne slabă). Evită soia în exces."
  },
  'vsh': {
    low: "Un nivel scăzut de VSH este ideal și indică o absență a inflamației sistemice în corp. Continuă la fel!",
    high: "Marker de inflamație. Adoptă o dietă antiinflamatoare: fructe de pădure, pește gras (Omega-3), turmeric, legume verzi. Evită zahărul și alimentele ultraprocesate."
  },
  'proteina c': {
    low: "Nivelul scăzut de PCR (CRP) este ideal, indicând lipsa inflamației în corp. Felicitări!",
    high: "Corp inflamat. Urmează o dietă antiinflamatoare: pește gras (Omega-3), fructe de pădure, turmeric, ulei de măsline. Elimină zahărul și alimentele ultra-procesate."
  },
  'vitamina b12': {
    low: "Consumă produse de origine animală (ouă, lactate, pește, carne curată). Dacă ești vegan, consumă drojdie inactivă și suplimentează obligatoriu!",
    high: "Adesea cauzat de suplimentare excesivă sau băuturi energizante. Redu temporar doza de multivitamine/suplimente cu complex B."
  }
};

// Funcție pentru a găsi recomandarea
const getRecommendation = (paramName: string, status: string) => {
  if (!paramName || !status) return undefined;
  const key = paramName.toLowerCase();
  const cleanStatus = status.toLowerCase().trim();
  
  if (cleanStatus === 'normal') return undefined;

  const recommendationKey = Object.keys(healthRecommendations).find(recKey => key.includes(recKey));
  if (!recommendationKey) return undefined;
  
  const recs = healthRecommendations[recommendationKey];
  if (cleanStatus === 'scazut' || cleanStatus === 'scăzut') return recs.low || recs.high;
  return recs.high || recs.low;
};

export default function HealthModal({ isOpen, onClose, data, onDelete, isDeleting }: HealthModalProps) {
  if (!isOpen || !data) return null;

  // Funcție de protecție în caz că AI-ul a trimis o dată calendaristică invalidă
  const safeDate = !isNaN(Date.parse(data.analysis_date)) ? new Date(data.analysis_date).toLocaleDateString('ro-RO') : data.analysis_date;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 flex items-center justify-center rounded-full transition-all"
        >
          ✕
        </button>
        
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Detalii Analize Medicale</h2>
        <p className="text-fuchsia-400 font-medium mb-8 text-sm uppercase tracking-widest">
          Extras pe: {safeDate}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Scor General</span>
            <span className="text-4xl font-black text-white">{data.general_score} <span className="text-xl text-gray-500 font-medium">/ 100</span></span>
          </div>
          
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Evoluție față de Trecut</span>
            <span className={`text-2xl font-black capitalize tracking-wide
              ${data.evolution_status === 'imbunatatire' ? 'text-emerald-400' : ''}
              ${data.evolution_status === 'inrautatire' ? 'text-red-400' : ''}
              ${data.evolution_status === 'stagnare' ? 'text-yellow-400' : ''}
            `}>
              {data.evolution_status}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-fuchsia-500 inline-block"></span> 
           Parametri Măsurați
        </h3>
        
        <div className="space-y-4">
          {Array.isArray(data.parameters_details) && data.parameters_details.length > 0 ? data.parameters_details.map((param, index) => {
            const recommendation = getRecommendation(param.nume, param.status);
            
            return (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 gap-4">
              <div className="flex-1">
                <div tabIndex={0} className={`relative inline-block group ${recommendation ? 'cursor-pointer focus:outline-none' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-200 text-lg">{param.nume}</span>
                    {recommendation && (
                      <span className="shrink-0 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center transition-colors group-hover:bg-emerald-500/20">
                        ℹ Sfaturi
                      </span>
                    )}
                  </div>
                  
                  {recommendation && (
                    <div className="absolute top-full left-0 sm:top-0 sm:left-full mt-2 sm:mt-0 sm:ml-4 w-64 p-4 bg-[#111] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[150] opacity-0 invisible group-hover:opacity-100 group-focus:opacity-100 group-hover:visible group-focus:visible translate-y-2 sm:translate-y-0 sm:-translate-x-2 group-hover:translate-y-0 sm:group-hover:translate-x-0 group-focus:translate-y-0 sm:group-focus:translate-x-0 transition-all duration-300 pointer-events-none">
                      {/* Săgeată indicatoare Desktop */}
                      <div className="hidden sm:block absolute top-4 -left-[6px] w-3 h-3 bg-[#111] border-l border-t border-white/10 -rotate-45" />
                      {/* Săgeată indicatoare Mobil */}
                      <div className="sm:hidden absolute -top-[6px] left-6 w-3 h-3 bg-[#111] border-l border-t border-white/10 rotate-45" />

                      <h4 className="font-black text-[10px] text-emerald-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Recomandare AI
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-medium whitespace-normal">
                        {recommendation}
                      </p>
                    </div>
                  )}
                </div>

                <span className="text-xs font-medium text-gray-400 bg-black/50 px-2 py-1 rounded-md block w-max mt-1">Referință: {param.interval_referinta}</span>
                
                {param.evolutie && param.evolutie !== 'necunoscut' && (
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-1 w-max
                    ${param.evolutie === 'inrautatire' ? 'text-red-400' : ''}
                    ${param.evolutie === 'imbunatatire' ? 'text-emerald-400' : ''}
                    ${param.evolutie === 'stagnare' ? 'text-gray-400' : ''}
                  `}>
                    {param.evolutie === 'inrautatire' ? '⚠️ Înrăutățire' : param.evolutie === 'imbunatatire' ? '✅ Îmbunătățire' : '➖ Stagnare'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <span className="text-2xl font-black text-white text-right">
                  {param.valoare} <span className="text-sm font-medium text-gray-500 ml-1">{param.unitate}</span>
                </span>
                
                <span className={`block px-4 py-1.5 rounded-xl text-xs font-bold w-24 text-center tracking-wide uppercase
                  ${param.status === 'normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                  ${param.status === 'scazut' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                  ${param.status === 'ridicat' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                `}>
                  {param.status}
                </span>
              </div>
            </div>
          )}) : (
            <div className="text-gray-400 text-sm font-medium italic bg-white/5 p-4 rounded-xl">Nu au putut fi extrași parametri specifici pentru acest document. (Format AI atipic)</div>
          )}
        </div>

        {onDelete && (
          <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={() => onDelete(data.id)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all disabled:opacity-50 tracking-wide uppercase text-sm"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              {isDeleting ? 'Se șterge...' : 'Șterge Analiza'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}