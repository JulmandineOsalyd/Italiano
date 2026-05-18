import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Users, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Award, RotateCcw, Home, MessageCircle } from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState({});
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState({});

  useEffect(() => {
    const loadProgress = async () => {
      const { data, error } = await supabase.from('progress').select('*');
      if (error) { console.error('Erreur chargement:', error); return; }
      const formatted = {};
      data.forEach(row => {
        if (!formatted[row.module_id]) formatted[row.module_id] = {};
        formatted[row.module_id][row.lesson_id] = {
          completed: row.completed,
          lastReviewed: row.last_reviewed,
          reviewCount: row.review_count
        };
      });
      setProgress(formatted);
    };
    loadProgress();
  }, []);

  const markLessonComplete = async (moduleId, lessonId) => {
    const current = progress[moduleId]?.[lessonId];
    const reviewCount = (current?.reviewCount || 0) + 1;
    const lastReviewed = new Date().toISOString();

    const { error } = await supabase.from('progress').upsert({
      module_id: moduleId,
      lesson_id: lessonId,
      completed: true,
      last_reviewed: lastReviewed,
      review_count: reviewCount
    }, { onConflict: 'module_id,lesson_id' });

    if (error) { console.error('Erreur sauvegarde:', error); return; }

    setProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [lessonId]: { completed: true, lastReviewed, reviewCount }
      }
    }));
  };

  const getModuleProgress = (moduleId, totalLessons) => {
    if (!progress[moduleId]) return 0;
    const completed = Object.values(progress[moduleId]).filter(l => l.completed).length;
    return Math.round((completed / totalLessons) * 100);
  };

  // ============ DONNÉES PÉDAGOGIQUES ============

  const modules = {
    pronouns: {
      title: 'Les pronoms personnels',
      icon: Users,
      color: 'bg-rose-100 border-rose-300 text-rose-900',
      colorAccent: 'bg-rose-500',
      colorLight: 'bg-rose-50',
      description: 'La base de toute phrase : qui fait l\'action',
      lessons: [
        {
          title: 'Les pronoms sujets',
          content: 'visual-pronouns',
          tip: 'En italien, les pronoms sujets sont souvent omis car la terminaison du verbe indique déjà qui parle. On les utilise surtout pour insister.',
          examples: [
            { it: 'Io vado al mercato, tu resti a casa.', fr: 'Moi je vais au marché, toi tu restes à la maison.' },
            { it: 'Noi mangiamo alle otto.', fr: 'Nous, nous mangeons à 20h.' },
            { it: 'Loro arrivano domani con i bambini.', fr: 'Ils arrivent demain avec les enfants.' }
          ],
          exercise: {
            question: 'Comment dit-on "nous" en italien ?',
            options: ['voi', 'noi', 'loro', 'lui'],
            answer: 'noi'
          }
        },
        {
          title: 'Tu vs Lei (tutoiement / vouvoiement)',
          content: 'visual-tu-lei',
          tip: 'Lei (avec majuscule) est le vouvoiement de politesse. Avec la famille, tu utiliseras tu sauf peut-être au tout début avec les grands-parents.',
          examples: [
            { it: 'Ciao nonna, come stai oggi?', fr: 'Salut mamie, comment vas-tu aujourd\'hui ?' },
            { it: 'Buongiorno signora, come sta?', fr: 'Bonjour madame, comment allez-vous ?' },
            { it: 'Tu cosa ne pensi, papà?', fr: 'Toi qu\'en penses-tu, papa ?' }
          ],
          exercise: {
            question: 'Pour vouvoyer quelqu\'un poliment, on utilise :',
            options: ['tu', 'voi', 'Lei', 'loro'],
            answer: 'Lei'
          }
        },
        {
          title: 'Les pronoms possessifs',
          content: 'visual-possessives',
          tip: 'Les possessifs s\'accordent avec l\'objet possédé, pas avec le possesseur. Et ils sont presque toujours précédés de l\'article !',
          examples: [
            { it: 'Mia madre arriva alle sei.', fr: 'Ma mère arrive à 18h.' },
            { it: 'La nostra casa è grande.', fr: 'Notre maison est grande.' },
            { it: 'I tuoi nonni sono molto gentili.', fr: 'Tes grands-parents sont très gentils.' }
          ],
          exercise: {
            question: '"Ma mère" se dit :',
            options: ['il mio madre', 'mia madre', 'la mia madre', 'mio madre'],
            answer: 'mia madre',
            explanation: 'Avec les membres de la famille au singulier, on omet l\'article ! Sauf avec loro (la loro madre).'
          }
        }
      ]
    },
    articles: {
      title: 'Articles et genres',
      icon: BookOpen,
      color: 'bg-amber-100 border-amber-300 text-amber-900',
      colorAccent: 'bg-amber-500',
      colorLight: 'bg-amber-50',
      description: 'Masculin, féminin, et quel article choisir',
      lessons: [
        {
          title: 'Articles définis (le, la, les)',
          content: 'visual-definite',
          tip: 'L\'italien a 7 formes pour "le/la/les" selon le genre, le nombre, et la lettre qui suit. C\'est moins compliqué qu\'il n\'y paraît une fois visualisé.',
          examples: [
            { it: 'Il bambino dorme nella culla.', fr: 'Le bébé dort dans le berceau.' },
            { it: 'Lo zio porta gli amici a cena.', fr: 'L\'oncle amène les amis à dîner.' },
            { it: 'La casa dei nonni è in campagna.', fr: 'La maison des grands-parents est à la campagne.' }
          ],
          exercise: {
            question: 'Quel article devant "zio" (oncle) ?',
            options: ['il', 'lo', 'l\'', 'la'],
            answer: 'lo',
            explanation: 'Devant les mots masculins commençant par z, s+consonne, gn, ps, x, y, on utilise lo.'
          }
        },
        {
          title: 'Articles indéfinis (un, une)',
          content: 'visual-indefinite',
          tip: 'Quatre formes seulement : un, uno, una, un\'. La logique suit celle des articles définis.',
          examples: [
            { it: 'Vorrei un caffè, per favore.', fr: 'Je voudrais un café, s\'il vous plaît.' },
            { it: 'Ho comprato una torta per il compleanno.', fr: 'J\'ai acheté un gâteau pour l\'anniversaire.' },
            { it: 'C\'è un\'ora di attesa al supermercato.', fr: 'Il y a une heure d\'attente au supermarché.' }
          ],
          exercise: {
            question: '"Une amie" se dit :',
            options: ['una amica', 'un\'amica', 'uno amica', 'un amica'],
            answer: 'un\'amica',
            explanation: 'Devant une voyelle au féminin, una devient un\' (avec apostrophe).'
          }
        },
        {
          title: 'Genre des noms : règles et exceptions',
          content: 'visual-gender',
          tip: 'Règle générale : -o = masculin, -a = féminin, -e = à apprendre. Mais attention aux pièges !',
          examples: [
            { it: 'Il problema è semplice da risolvere.', fr: 'Le problème est simple à résoudre.' },
            { it: 'La mano del bambino è piccolissima.', fr: 'La main du bébé est toute petite.' },
            { it: 'Il papà cucina la cena stasera.', fr: 'Papa cuisine le dîner ce soir.' }
          ],
          exercise: {
            question: '"Il problema" est :',
            options: ['féminin', 'masculin', 'neutre', 'les deux'],
            answer: 'masculin',
            explanation: 'Les mots d\'origine grecque en -ma sont masculins : il problema, il programma, il cinema, il tema.'
          }
        }
      ]
    },
    present: {
      title: 'Le présent des verbes',
      icon: Sparkles,
      color: 'bg-emerald-100 border-emerald-300 text-emerald-900',
      colorAccent: 'bg-emerald-500',
      colorLight: 'bg-emerald-50',
      description: 'Les trois groupes : -are, -ere, -ire',
      lessons: [
        {
          title: 'Verbes en -ARE (1er groupe)',
          content: 'visual-are',
          tip: 'Le plus grand groupe. Parlare (parler), mangiare (manger), giocare (jouer). Les terminaisons sont régulières et faciles à mémoriser.',
          examples: [
            { it: 'Parlo italiano con la famiglia.', fr: 'Je parle italien avec la famille.' },
            { it: 'Mangiamo insieme tutte le domeniche.', fr: 'Nous mangeons ensemble tous les dimanches.' },
            { it: 'I bambini giocano in giardino.', fr: 'Les enfants jouent dans le jardin.' }
          ],
          exercise: {
            question: '"Je parle" se dit :',
            options: ['parlo', 'parli', 'parla', 'parlamo'],
            answer: 'parlo'
          }
        },
        {
          title: 'Verbes en -ERE (2e groupe)',
          content: 'visual-ere',
          tip: 'Vedere (voir), prendere (prendre), leggere (lire). Attention : c\'est dans ce groupe qu\'on trouve le plus d\'irrégularités.',
          examples: [
            { it: 'Prendiamo il treno per andare dai nonni.', fr: 'Nous prenons le train pour aller chez les grands-parents.' },
            { it: 'Leggo una storia al bambino la sera.', fr: 'Je lis une histoire à l\'enfant le soir.' },
            { it: 'Vedi quel gatto sul muro?', fr: 'Tu vois ce chat sur le mur ?' }
          ],
          exercise: {
            question: '"Nous prenons" se dit :',
            options: ['prendiamo', 'prendono', 'prendete', 'prendi'],
            answer: 'prendiamo'
          }
        },
        {
          title: 'Verbes en -IRE (3e groupe)',
          content: 'visual-ire',
          tip: 'Deux sous-types ! Certains comme dormire (dormir) sont "simples". D\'autres comme capire (comprendre) ajoutent -isc- aux trois personnes du singulier et à la 3e du pluriel.',
          examples: [
            { it: 'Il piccolo dorme due ore al pomeriggio.', fr: 'Le petit dort deux heures l\'après-midi.' },
            { it: 'Capisco quasi tutto quando parlate piano.', fr: 'Je comprends presque tout quand vous parlez lentement.' },
            { it: 'Finiamo di mangiare e poi usciamo.', fr: 'On finit de manger et puis on sort.' }
          ],
          exercise: {
            question: '"Je comprends" se dit :',
            options: ['capo', 'capisco', 'capio', 'capi'],
            answer: 'capisco',
            explanation: 'Capire fait partie des verbes "en -isc". Idem pour finire, preferire, pulire...'
          }
        }
      ]
    },
    essereavere: {
      title: 'Essere et Avere',
      icon: Heart,
      color: 'bg-sky-100 border-sky-300 text-sky-900',
      colorAccent: 'bg-sky-500',
      colorLight: 'bg-sky-50',
      description: 'Les deux verbes piliers de l\'italien',
      lessons: [
        {
          title: 'Essere (être) au présent',
          content: 'visual-essere',
          tip: 'Verbe totalement irrégulier — à connaître par cœur. Sert aussi d\'auxiliaire pour de nombreux temps composés.',
          examples: [
            { it: 'Sono in cucina con la mamma.', fr: 'Je suis dans la cuisine avec maman.' },
            { it: 'I nonni sono già arrivati.', fr: 'Les grands-parents sont déjà arrivés.' },
            { it: 'Siamo tutti pronti per la cena.', fr: 'Nous sommes tous prêts pour le dîner.' }
          ],
          exercise: {
            question: '"Nous sommes en famille" se dit :',
            options: ['Sono in famiglia', 'Siamo in famiglia', 'Siete in famiglia', 'Sei in famiglia'],
            answer: 'Siamo in famiglia'
          }
        },
        {
          title: 'Avere (avoir) au présent',
          content: 'visual-avere',
          tip: 'Attention au H muet en début de plusieurs formes (ho, hai, ha, hanno). Il ne se prononce pas mais s\'écrit obligatoirement.',
          examples: [
            { it: 'Ho due fratelli e una sorella.', fr: 'J\'ai deux frères et une sœur.' },
            { it: 'Hai fame? Ti preparo qualcosa.', fr: 'Tu as faim ? Je te prépare quelque chose.' },
            { it: 'I bambini hanno sonno dopo pranzo.', fr: 'Les enfants ont sommeil après le déjeuner.' }
          ],
          exercise: {
            question: '"J\'ai faim" se dit :',
            options: ['Sono fame', 'Ho fame', 'Sono fama', 'Ho famo'],
            answer: 'Ho fame',
            explanation: 'En italien on "a" faim (avere fame), comme en français. Mais on "a" aussi froid, chaud, peur, soif, raison...'
          }
        },
        {
          title: 'Expressions avec essere et avere',
          content: 'visual-expressions-eb',
          tip: 'Beaucoup d\'expressions du quotidien utilisent ces deux verbes. Les mémoriser fait gagner énormément en fluidité.',
          examples: [
            { it: 'Ho trent\'anni, e tu?', fr: 'J\'ai 30 ans, et toi ?' },
            { it: 'Il bambino ha freddo, copriamolo.', fr: 'Le bébé a froid, couvrons-le.' },
            { it: 'Siamo in ritardo per la scuola!', fr: 'On est en retard pour l\'école !' }
          ],
          exercise: {
            question: '"J\'ai 30 ans" se dit :',
            options: ['Sono 30 anni', 'Ho 30 anni', 'Sono trent\'anni', 'Mi sono 30 anni'],
            answer: 'Ho 30 anni',
            explanation: 'En italien comme en français, on "a" des années. Différent de l\'anglais (I am 30).'
          }
        }
      ]
    },
    family: {
      title: 'Le vocabulaire de la famille',
      icon: Home,
      color: 'bg-purple-100 border-purple-300 text-purple-900',
      colorAccent: 'bg-purple-500',
      colorLight: 'bg-purple-50',
      description: 'Pour parler avec la famiglia',
      lessons: [
        {
          title: 'La famille proche',
          content: 'visual-family-close',
          tip: 'Le mot "famiglia" est central en Italie. Connaître ces termes te rendra immédiatement plus proche de la famille de ton compagnon.',
          examples: [
            { it: 'Mia suocera cucina benissimo.', fr: 'Ma belle-mère cuisine très bien.' },
            { it: 'Mio cognato lavora a Roma.', fr: 'Mon beau-frère travaille à Rome.' },
            { it: 'I miei genitori vengono questo weekend.', fr: 'Mes parents viennent ce week-end.' }
          ],
          exercise: {
            question: '"Ma belle-mère" se dit :',
            options: ['mia matrigna', 'mia suocera', 'mia cognata', 'mia nuora'],
            answer: 'mia suocera',
            explanation: 'Suocera = belle-mère (mère du conjoint). Matrigna = marâtre (nouvelle femme du père).'
          }
        },
        {
          title: 'La famille élargie',
          content: 'visual-family-extended',
          tip: 'Les Italiens utilisent souvent des diminutifs affectueux : nonnina (mamie chérie), zietta (tata)...',
          examples: [
            { it: 'I nonni abitano vicino a noi.', fr: 'Les grands-parents habitent près de chez nous.' },
            { it: 'Mia zia ha tre figli.', fr: 'Ma tante a trois enfants.' },
            { it: 'I miei cugini vengono d\'estate.', fr: 'Mes cousins viennent l\'été.' }
          ],
          exercise: {
            question: '"Mes cousins" (mixtes) se dit :',
            options: ['i miei cugini', 'le mie cugine', 'i mio cugini', 'miei cugini'],
            answer: 'i miei cugini',
            explanation: 'Au pluriel mixte ou masculin, on dit "i miei cugini". Au pluriel féminin uniquement : "le mie cugine".'
          }
        },
        {
          title: 'Parler de l\'enfant',
          content: 'visual-family-child',
          tip: 'Vocabulaire essentiel pour la parentalité : du nouveau-né à l\'enfant qui grandit.',
          examples: [
            { it: 'Il bambino ha bisogno del pannolino.', fr: 'Le bébé a besoin de la couche.' },
            { it: 'Metti il piccolo nel passeggino.', fr: 'Mets le petit dans la poussette.' },
            { it: 'Dov\'è il ciuccio del bebè?', fr: 'Où est la tétine du bébé ?' }
          ],
          exercise: {
            question: '"Notre bébé" se dit :',
            options: ['il nostro bambino', 'nostro bambino', 'il bambino nostro', 'la nostra bambina'],
            answer: 'il nostro bambino',
            explanation: 'Avec "nostro/nostra" + famille, on garde l\'article (contrairement à mio/tuo/suo au singulier).'
          }
        }
      ]
    },
    daily: {
      title: 'La vie quotidienne en famille',
      icon: MessageCircle,
      color: 'bg-teal-100 border-teal-300 text-teal-900',
      colorAccent: 'bg-teal-500',
      colorLight: 'bg-teal-50',
      description: 'Les phrases qui reviennent tous les jours',
      lessons: [
        {
          title: 'Le matin et le réveil',
          content: 'visual-morning',
          tip: 'Ces phrases reviennent chaque matin. Les avoir en automatique change tout dans la communication familiale.',
          examples: [
            { it: 'Sveglia! È ora di alzarsi.', fr: 'Réveil ! C\'est l\'heure de se lever.' },
            { it: 'Cosa vuoi per colazione?', fr: 'Que veux-tu pour le petit-déjeuner ?' },
            { it: 'Hai lavato i denti?', fr: 'Tu t\'es lavé les dents ?' }
          ],
          exercise: {
            question: '"As-tu bien dormi ?" se dit :',
            options: ['Hai dormito bene?', 'Sei dormito bene?', 'Dormi bene?', 'Hai bene dormito?'],
            answer: 'Hai dormito bene?'
          }
        },
        {
          title: 'Les repas en famille',
          content: 'visual-meals',
          tip: 'Le repas est un moment sacré en Italie. Ces expressions sont essentielles pour participer pleinement.',
          examples: [
            { it: 'A tavola! Il pranzo è pronto.', fr: 'À table ! Le déjeuner est prêt.' },
            { it: 'Vuoi ancora un po\' di pasta?', fr: 'Tu veux encore un peu de pâtes ?' },
            { it: 'Buon appetito a tutti!', fr: 'Bon appétit à tous !' }
          ],
          exercise: {
            question: '"À table !" se dit :',
            options: ['Al tavolo!', 'A tavola!', 'In tavola!', 'Sul tavolo!'],
            answer: 'A tavola!',
            explanation: '"A tavola" est l\'expression idiomatique pour appeler à manger. "Sul tavolo" voudrait dire "sur la table" (l\'objet).'
          }
        },
        {
          title: 'Le coucher et la nuit',
          content: 'visual-bedtime',
          tip: 'La routine du soir avec un enfant est rituelle. Ces phrases t\'aideront à accompagner tous les moments.',
          examples: [
            { it: 'È ora di andare a letto.', fr: 'C\'est l\'heure d\'aller au lit.' },
            { it: 'Ti racconto una storia?', fr: 'Je te raconte une histoire ?' },
            { it: 'Buonanotte, sogni d\'oro.', fr: 'Bonne nuit, fais de beaux rêves.' }
          ],
          exercise: {
            question: '"Fais de beaux rêves" se dit littéralement :',
            options: ['Sogni belli', 'Sogni d\'oro', 'Begli sogni', 'Buoni sogni'],
            answer: 'Sogni d\'oro',
            explanation: 'Littéralement "rêves d\'or" — expression idiomatique impossible à traduire mot à mot.'
          }
        },
        {
          title: 'Donner des consignes à un enfant',
          content: 'visual-instructions',
          tip: 'L\'impératif est très utilisé avec les enfants. À la 2e personne du singulier, il prend souvent la même forme que le présent (pour les verbes en -ere et -ire) ou l\'infinitif (pour -are).',
          examples: [
            { it: 'Vieni qui, per favore.', fr: 'Viens ici, s\'il te plaît.' },
            { it: 'Stai attento alle scale!', fr: 'Fais attention aux escaliers !' },
            { it: 'Aspetta un momento, arrivo.', fr: 'Attends un moment, j\'arrive.' }
          ],
          exercise: {
            question: '"Viens ici !" se dit :',
            options: ['Vieni qui!', 'Veni qui!', 'Vai qui!', 'Viene qui!'],
            answer: 'Vieni qui!'
          }
        }
      ]
    }
  };

  // ============ CONTENUS VISUELS ============

  const renderVisualContent = (contentKey) => {
    switch (contentKey) {
      case 'visual-pronouns':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border-2 border-rose-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-rose-700 mb-2 uppercase tracking-wide">Singulier</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><span className="font-bold text-rose-900 text-lg">io</span><span className="text-slate-600">je</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold text-rose-900 text-lg">tu</span><span className="text-slate-600">tu</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold text-rose-900 text-lg">lui / lei</span><span className="text-slate-600">il / elle</span></div>
                </div>
              </div>
              <div className="bg-white border-2 border-rose-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-rose-700 mb-2 uppercase tracking-wide">Pluriel</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><span className="font-bold text-rose-900 text-lg">noi</span><span className="text-slate-600">nous</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold text-rose-900 text-lg">voi</span><span className="text-slate-600">vous</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold text-rose-900 text-lg">loro</span><span className="text-slate-600">ils / elles</span></div>
                </div>
              </div>
            </div>
            <div className="bg-rose-50 border-l-4 border-rose-400 p-3 rounded">
              <div className="text-sm text-rose-900"><strong>Astuce visuelle :</strong> notez qu'il n'existe qu'un seul mot pour "ils" et "elles" → <strong>loro</strong>. Pratique !</div>
            </div>
          </div>
        );

      case 'visual-tu-lei':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border-2 border-rose-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Familier</div>
                <div className="text-3xl font-bold text-rose-900 mb-2">tu</div>
                <div className="text-sm text-slate-700 mb-2">Famille, amis, enfants, jeunes</div>
                <div className="bg-rose-50 p-2 rounded text-sm italic">"Come stai?" (Comment vas-tu ?)</div>
              </div>
              <div className="bg-white border-2 border-rose-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">Politesse</div>
                <div className="text-3xl font-bold text-rose-900 mb-2">Lei</div>
                <div className="text-sm text-slate-700 mb-2">Inconnus, contexte formel, respect</div>
                <div className="bg-rose-50 p-2 rounded text-sm italic">"Come sta?" (Comment allez-vous ?)</div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Important :</strong> avec Lei, le verbe se conjugue à la 3e personne du singulier (comme "il/elle"). C'est différent du "vous" français !</div>
            </div>
          </div>
        );

      case 'visual-possessives':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full bg-white border-2 border-rose-300 rounded-lg">
                <thead className="bg-rose-100">
                  <tr>
                    <th className="p-2 text-left text-sm">FR</th>
                    <th className="p-2 text-sm text-rose-900">masc. sing.</th>
                    <th className="p-2 text-sm text-pink-900">fém. sing.</th>
                    <th className="p-2 text-sm text-rose-900">masc. plur.</th>
                    <th className="p-2 text-sm text-pink-900">fém. plur.</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-t"><td className="p-2 font-semibold">mon/ma</td><td className="p-2 text-center font-bold text-rose-800">il mio</td><td className="p-2 text-center font-bold text-pink-800">la mia</td><td className="p-2 text-center font-bold text-rose-800">i miei</td><td className="p-2 text-center font-bold text-pink-800">le mie</td></tr>
                  <tr className="border-t bg-rose-50"><td className="p-2 font-semibold">ton/ta</td><td className="p-2 text-center font-bold text-rose-800">il tuo</td><td className="p-2 text-center font-bold text-pink-800">la tua</td><td className="p-2 text-center font-bold text-rose-800">i tuoi</td><td className="p-2 text-center font-bold text-pink-800">le tue</td></tr>
                  <tr className="border-t"><td className="p-2 font-semibold">son/sa</td><td className="p-2 text-center font-bold text-rose-800">il suo</td><td className="p-2 text-center font-bold text-pink-800">la sua</td><td className="p-2 text-center font-bold text-rose-800">i suoi</td><td className="p-2 text-center font-bold text-pink-800">le sue</td></tr>
                  <tr className="border-t bg-rose-50"><td className="p-2 font-semibold">notre</td><td className="p-2 text-center font-bold text-rose-800">il nostro</td><td className="p-2 text-center font-bold text-pink-800">la nostra</td><td className="p-2 text-center font-bold text-rose-800">i nostri</td><td className="p-2 text-center font-bold text-pink-800">le nostre</td></tr>
                  <tr className="border-t"><td className="p-2 font-semibold">votre</td><td className="p-2 text-center font-bold text-rose-800">il vostro</td><td className="p-2 text-center font-bold text-pink-800">la vostra</td><td className="p-2 text-center font-bold text-rose-800">i vostri</td><td className="p-2 text-center font-bold text-pink-800">le vostre</td></tr>
                  <tr className="border-t bg-rose-50"><td className="p-2 font-semibold">leur</td><td className="p-2 text-center font-bold text-rose-800">il loro</td><td className="p-2 text-center font-bold text-pink-800">la loro</td><td className="p-2 text-center font-bold text-rose-800">i loro</td><td className="p-2 text-center font-bold text-pink-800">le loro</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Règle d'or famille :</strong> avec un membre de la famille au <strong>singulier</strong>, on omet l'article. <em>mia madre, tuo padre, suo fratello</em>. Exception : avec <em>loro</em>, l'article reste toujours (<em>la loro madre</em>).</div>
            </div>
          </div>
        );

      case 'visual-definite':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border-2 border-amber-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wide">Masculin</div>
                <div className="space-y-3">
                  <div className="bg-amber-50 p-2 rounded">
                    <div className="font-bold text-amber-900 text-lg">il / i</div>
                    <div className="text-xs text-slate-600">devant consonne ordinaire</div>
                    <div className="text-sm italic mt-1">il bambino → i bambini</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded">
                    <div className="font-bold text-amber-900 text-lg">lo / gli</div>
                    <div className="text-xs text-slate-600">devant z, s+consonne, gn, ps, x, y</div>
                    <div className="text-sm italic mt-1">lo zio → gli zii</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded">
                    <div className="font-bold text-amber-900 text-lg">l' / gli</div>
                    <div className="text-xs text-slate-600">devant voyelle</div>
                    <div className="text-sm italic mt-1">l'amico → gli amici</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border-2 border-amber-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-pink-700 mb-3 uppercase tracking-wide">Féminin</div>
                <div className="space-y-3">
                  <div className="bg-pink-50 p-2 rounded">
                    <div className="font-bold text-pink-900 text-lg">la / le</div>
                    <div className="text-xs text-slate-600">devant consonne</div>
                    <div className="text-sm italic mt-1">la mamma → le mamme</div>
                  </div>
                  <div className="bg-pink-50 p-2 rounded">
                    <div className="font-bold text-pink-900 text-lg">l' / le</div>
                    <div className="text-xs text-slate-600">devant voyelle</div>
                    <div className="text-sm italic mt-1">l'amica → le amiche</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Mémo visuel :</strong> la lettre qui suit dicte l'article. Pense au "son" : si c'est dur à prononcer avec "il", on prend "lo". <em>Il zio</em> = imprononçable, donc <em>lo zio</em>.</div>
            </div>
          </div>
        );

      case 'visual-indefinite':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border-2 border-amber-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wide">Masculin</div>
                <div className="space-y-3">
                  <div className="bg-amber-50 p-3 rounded">
                    <div className="font-bold text-amber-900 text-2xl">un</div>
                    <div className="text-xs text-slate-600 mt-1">devant consonne ou voyelle</div>
                    <div className="text-sm italic mt-1">un bambino, un amico</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded">
                    <div className="font-bold text-amber-900 text-2xl">uno</div>
                    <div className="text-xs text-slate-600 mt-1">devant z, s+consonne, gn, ps</div>
                    <div className="text-sm italic mt-1">uno zio, uno studente</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border-2 border-amber-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-pink-700 mb-3 uppercase tracking-wide">Féminin</div>
                <div className="space-y-3">
                  <div className="bg-pink-50 p-3 rounded">
                    <div className="font-bold text-pink-900 text-2xl">una</div>
                    <div className="text-xs text-slate-600 mt-1">devant consonne</div>
                    <div className="text-sm italic mt-1">una mamma, una sorella</div>
                  </div>
                  <div className="bg-pink-50 p-3 rounded">
                    <div className="font-bold text-pink-900 text-2xl">un'</div>
                    <div className="text-xs text-slate-600 mt-1">devant voyelle (avec apostrophe!)</div>
                    <div className="text-sm italic mt-1">un'amica, un'ora</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded">
              <div className="text-sm text-emerald-900"><strong>Piège classique :</strong> <em>un amico</em> (sans apostrophe, masculin) vs <em>un'amica</em> (avec apostrophe, féminin). L'apostrophe est le seul indice du genre !</div>
            </div>
          </div>
        );

      case 'visual-gender':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border-2 border-amber-300 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-amber-800 mb-1">-o</div>
                <div className="text-xs font-semibold text-amber-700 mb-2">→ masculin</div>
                <div className="text-sm italic">bambino, gatto</div>
              </div>
              <div className="bg-white border-2 border-amber-300 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-pink-800 mb-1">-a</div>
                <div className="text-xs font-semibold text-pink-700 mb-2">→ féminin</div>
                <div className="text-sm italic">bambina, casa</div>
              </div>
              <div className="bg-white border-2 border-amber-300 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-slate-700 mb-1">-e</div>
                <div className="text-xs font-semibold text-slate-600 mb-2">→ les deux</div>
                <div className="text-sm italic">à apprendre</div>
              </div>
            </div>
            <div className="bg-white border-2 border-amber-300 rounded-lg p-4">
              <div className="font-semibold text-amber-900 mb-3">Exceptions importantes</div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2"><span className="font-bold text-amber-800 min-w-[80px]">-ma →</span><span><strong>masculin</strong> (mots grecs) : il problema, il programma, il cinema</span></div>
                <div className="flex gap-2"><span className="font-bold text-amber-800 min-w-[80px]">-ista →</span><span>masc. <strong>ou</strong> fém. selon la personne : l'artista, il/la giornalista</span></div>
                <div className="flex gap-2"><span className="font-bold text-amber-800 min-w-[80px]">la mano</span><span><strong>féminin</strong> malgré le -o final ! Pluriel : le mani</span></div>
                <div className="flex gap-2"><span className="font-bold text-amber-800 min-w-[80px]">il papà</span><span><strong>masculin</strong> avec un -à final accentué</span></div>
              </div>
            </div>
            <div className="bg-rose-50 border-l-4 border-rose-400 p-3 rounded">
              <div className="text-sm text-rose-900"><strong>Faux ami du genre :</strong> certains mots changent de genre entre français et italien. <em>il fiore</em> (masc.) = la fleur (fém.). <em>il sale</em> (masc.) = le sel ✓. <em>la frase</em> (fém.) = la phrase ✓.</div>
            </div>
          </div>
        );

      case 'visual-are':
        return (
          <div className="space-y-4">
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-4">
              <div className="text-center mb-3">
                <span className="text-2xl font-bold">parl</span><span className="text-2xl font-bold text-emerald-600">are</span>
                <span className="text-sm text-slate-500 ml-2">(parler)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">io</span> <span className="font-bold">parl</span><span className="font-bold text-emerald-600">o</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">noi</span> <span className="font-bold">parl</span><span className="font-bold text-emerald-600">iamo</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">tu</span> <span className="font-bold">parl</span><span className="font-bold text-emerald-600">i</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">voi</span> <span className="font-bold">parl</span><span className="font-bold text-emerald-600">ate</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">lui/lei</span> <span className="font-bold">parl</span><span className="font-bold text-emerald-600">a</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">loro</span> <span className="font-bold">parl</span><span className="font-bold text-emerald-600">ano</span></div>
              </div>
            </div>
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-4">
              <div className="font-semibold text-emerald-900 mb-2">Verbes utiles du 1er groupe</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>parlare <span className="text-slate-500">— parler</span></div>
                <div>guardare <span className="text-slate-500">— regarder</span></div>
                <div>mangiare <span className="text-slate-500">— manger</span></div>
                <div>giocare <span className="text-slate-500">— jouer</span></div>
                <div>lavorare <span className="text-slate-500">— travailler</span></div>
                <div>cucinare <span className="text-slate-500">— cuisiner</span></div>
                <div>comprare <span className="text-slate-500">— acheter</span></div>
                <div>ascoltare <span className="text-slate-500">— écouter</span></div>
              </div>
            </div>
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded">
              <div className="text-sm text-emerald-900"><strong>Astuce mémoire :</strong> les terminaisons <strong>-o, -i, -a, -iamo, -ate, -ano</strong>. Le rythme aide à les retenir.</div>
            </div>
          </div>
        );

      case 'visual-ere':
        return (
          <div className="space-y-4">
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-4">
              <div className="text-center mb-3">
                <span className="text-2xl font-bold">prend</span><span className="text-2xl font-bold text-emerald-600">ere</span>
                <span className="text-sm text-slate-500 ml-2">(prendre)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">io</span> <span className="font-bold">prend</span><span className="font-bold text-emerald-600">o</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">noi</span> <span className="font-bold">prend</span><span className="font-bold text-emerald-600">iamo</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">tu</span> <span className="font-bold">prend</span><span className="font-bold text-emerald-600">i</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">voi</span> <span className="font-bold">prend</span><span className="font-bold text-emerald-600">ete</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">lui/lei</span> <span className="font-bold">prend</span><span className="font-bold text-emerald-600">e</span></div>
                <div className="bg-emerald-50 p-2 rounded"><span className="text-slate-600">loro</span> <span className="font-bold">prend</span><span className="font-bold text-emerald-600">ono</span></div>
              </div>
            </div>
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-4">
              <div className="font-semibold text-emerald-900 mb-2">Verbes utiles du 2e groupe</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>vedere <span className="text-slate-500">— voir</span></div>
                <div>leggere <span className="text-slate-500">— lire</span></div>
                <div>scrivere <span className="text-slate-500">— écrire</span></div>
                <div>credere <span className="text-slate-500">— croire</span></div>
                <div>vivere <span className="text-slate-500">— vivre</span></div>
                <div>mettere <span className="text-slate-500">— mettre</span></div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Comparez avec -are :</strong> seules les terminaisons -a → -e changent à la 3e personne sing. et plur. (parl<strong>a</strong>/parl<strong>ano</strong> vs prend<strong>e</strong>/prend<strong>ono</strong>).</div>
            </div>
          </div>
        );

      case 'visual-ire':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white border-2 border-emerald-300 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-xs font-semibold text-emerald-700 uppercase mb-1">Type 1 : simple</div>
                  <span className="text-2xl font-bold">dorm</span><span className="text-2xl font-bold text-emerald-600">ire</span>
                  <div className="text-sm text-slate-500">(dormir)</div>
                </div>
                <div className="space-y-1 text-center text-sm">
                  <div className="bg-emerald-50 p-1.5 rounded"><span className="text-slate-600">io</span> dorm<span className="font-bold text-emerald-600">o</span></div>
                  <div className="bg-emerald-50 p-1.5 rounded"><span className="text-slate-600">tu</span> dorm<span className="font-bold text-emerald-600">i</span></div>
                  <div className="bg-emerald-50 p-1.5 rounded"><span className="text-slate-600">lui/lei</span> dorm<span className="font-bold text-emerald-600">e</span></div>
                  <div className="bg-emerald-50 p-1.5 rounded"><span className="text-slate-600">noi</span> dorm<span className="font-bold text-emerald-600">iamo</span></div>
                  <div className="bg-emerald-50 p-1.5 rounded"><span className="text-slate-600">voi</span> dorm<span className="font-bold text-emerald-600">ite</span></div>
                  <div className="bg-emerald-50 p-1.5 rounded"><span className="text-slate-600">loro</span> dorm<span className="font-bold text-emerald-600">ono</span></div>
                </div>
              </div>
              <div className="bg-white border-2 border-amber-400 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-xs font-semibold text-amber-700 uppercase mb-1">Type 2 : avec -isc-</div>
                  <span className="text-2xl font-bold">cap</span><span className="text-2xl font-bold text-amber-600">ire</span>
                  <div className="text-sm text-slate-500">(comprendre)</div>
                </div>
                <div className="space-y-1 text-center text-sm">
                  <div className="bg-amber-50 p-1.5 rounded"><span className="text-slate-600">io</span> cap<span className="font-bold text-amber-600">isco</span></div>
                  <div className="bg-amber-50 p-1.5 rounded"><span className="text-slate-600">tu</span> cap<span className="font-bold text-amber-600">isci</span></div>
                  <div className="bg-amber-50 p-1.5 rounded"><span className="text-slate-600">lui/lei</span> cap<span className="font-bold text-amber-600">isce</span></div>
                  <div className="bg-amber-50 p-1.5 rounded"><span className="text-slate-600">noi</span> cap<span className="font-bold text-amber-600">iamo</span></div>
                  <div className="bg-amber-50 p-1.5 rounded"><span className="text-slate-600">voi</span> cap<span className="font-bold text-amber-600">ite</span></div>
                  <div className="bg-amber-50 p-1.5 rounded"><span className="text-slate-600">loro</span> cap<span className="font-bold text-amber-600">iscono</span></div>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>À apprendre par cœur (verbes en -isc) :</strong> capire, finire, preferire, pulire, costruire, spedire, restituire. Le -isc- est inséré sauf à <em>noi</em> et <em>voi</em>.</div>
            </div>
          </div>
        );

      case 'visual-essere':
        return (
          <div className="space-y-4">
            <div className="bg-white border-2 border-sky-300 rounded-lg p-4">
              <div className="text-center mb-3">
                <span className="text-2xl font-bold text-sky-600">essere</span>
                <span className="text-sm text-slate-500 ml-2">(être)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">io</span> <span className="font-bold text-sky-700">sono</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">noi</span> <span className="font-bold text-sky-700">siamo</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">tu</span> <span className="font-bold text-sky-700">sei</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">voi</span> <span className="font-bold text-sky-700">siete</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">lui/lei</span> <span className="font-bold text-sky-700">è</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">loro</span> <span className="font-bold text-sky-700">sono</span></div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Attention à l'accent :</strong> <em>è</em> (avec accent grave) = "il/elle est". <em>e</em> (sans accent) = "et". Deux mots, deux sens !</div>
            </div>
          </div>
        );

      case 'visual-avere':
        return (
          <div className="space-y-4">
            <div className="bg-white border-2 border-sky-300 rounded-lg p-4">
              <div className="text-center mb-3">
                <span className="text-2xl font-bold text-sky-600">avere</span>
                <span className="text-sm text-slate-500 ml-2">(avoir)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">io</span> <span className="font-bold text-sky-700"><span className="text-slate-400">h</span>o</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">noi</span> <span className="font-bold text-sky-700">abbiamo</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">tu</span> <span className="font-bold text-sky-700"><span className="text-slate-400">h</span>ai</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">voi</span> <span className="font-bold text-sky-700">avete</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">lui/lei</span> <span className="font-bold text-sky-700"><span className="text-slate-400">h</span>a</span></div>
                <div className="bg-sky-50 p-2 rounded"><span className="text-slate-600">loro</span> <span className="font-bold text-sky-700"><span className="text-slate-400">h</span>anno</span></div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Le H muet :</strong> ho, hai, ha, hanno commencent par un H qui ne se prononce pas. Sert juste à distinguer <em>ho</em> (j'ai) de <em>o</em> (ou), <em>ha</em> (il a) de <em>a</em> (à), <em>hanno</em> (ils ont) de <em>anno</em> (année).</div>
            </div>
          </div>
        );

      case 'visual-expressions-eb':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-sky-300 rounded-lg p-4">
              <div className="font-semibold text-sky-900 mb-3">Expressions avec AVERE</div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere fame</strong></div><div className="p-2">avoir faim</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere sete</strong></div><div className="p-2">avoir soif</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere sonno</strong></div><div className="p-2">avoir sommeil</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere caldo / freddo</strong></div><div className="p-2">avoir chaud / froid</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere paura</strong></div><div className="p-2">avoir peur</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere ragione / torto</strong></div><div className="p-2">avoir raison / tort</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere voglia di</strong></div><div className="p-2">avoir envie de</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere ... anni</strong></div><div className="p-2">avoir ... ans</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere bisogno di</strong></div><div className="p-2">avoir besoin de</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>avere fretta</strong></div><div className="p-2">être pressé</div></div>
              </div>
            </div>
            <div className="bg-white border-2 border-sky-300 rounded-lg p-4">
              <div className="font-semibold text-sky-900 mb-3">Expressions avec ESSERE</div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>essere stanco/a</strong></div><div className="p-2">être fatigué(e)</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>essere in ritardo</strong></div><div className="p-2">être en retard</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>essere d'accordo</strong></div><div className="p-2">être d'accord</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>essere pronto/a</strong></div><div className="p-2">être prêt(e)</div></div>
                <div className="grid grid-cols-2 gap-2"><div className="bg-sky-50 p-2 rounded"><strong>essere contento/a</strong></div><div className="p-2">être content(e)</div></div>
              </div>
            </div>
          </div>
        );

      case 'visual-family-close':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-3">Famille directe</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il padre</strong> / papà — le père / papa</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la madre</strong> / mamma — la mère / maman</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il fratello</strong> — le frère</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la sorella</strong> — la sœur</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il figlio</strong> — le fils</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la figlia</strong> — la fille</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il marito</strong> — le mari</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la moglie</strong> — la femme</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il compagno</strong> — le compagnon</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la compagna</strong> — la compagne</div>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-3">Belle-famille</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il suocero</strong> — le beau-père</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la suocera</strong> — la belle-mère</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il cognato</strong> — le beau-frère</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la cognata</strong> — la belle-sœur</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il genero</strong> — le gendre</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la nuora</strong> — la belle-fille</div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Bon à savoir :</strong> <em>i genitori</em> = les parents (père et mère). <em>i parenti</em> = la famille élargie ! Faux ami à ne pas confondre.</div>
            </div>
          </div>
        );

      case 'visual-family-extended':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-3">Grands-parents et au-delà</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il nonno</strong> — le grand-père</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la nonna</strong> — la grand-mère</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">i nonni</strong> — les grands-parents</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">il bisnonno / la bisnonna</strong> — l'arrière-grand-parent</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il nipote</strong> — petit-fils / neveu</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la nipote</strong> — petite-fille / nièce</div>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-3">Oncles, tantes, cousins</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">lo zio</strong> — l'oncle</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la zia</strong> — la tante</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il cugino</strong> — le cousin</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la cugina</strong> — la cousine</div>
                <div className="bg-purple-50 p-2 rounded"><strong className="text-purple-800">il padrino</strong> — le parrain</div>
                <div className="bg-pink-50 p-2 rounded"><strong className="text-pink-800">la madrina</strong> — la marraine</div>
              </div>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded">
              <div className="text-sm text-purple-900"><strong>Diminutifs affectueux :</strong> <em>nonnino/nonnina</em> (papy/mamie chéris), <em>zietto/zietta</em> (tonton/tatie), <em>cuginetto</em> (petit cousin). Très utilisés au quotidien !</div>
            </div>
          </div>
        );

      case 'visual-family-child':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-3">Bébé et petite enfance</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-purple-50 p-2 rounded"><strong>il neonato / la neonata</strong> — le/la nouveau-né(e)</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il bebè</strong> — le bébé</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il bambino / la bambina</strong> — l'enfant</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il/la piccolino/a</strong> — le/la petit(e)</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il pannolino</strong> — la couche</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il biberon</strong> — le biberon</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il ciuccio</strong> — la tétine</div>
                <div className="bg-purple-50 p-2 rounded"><strong>la culla</strong> — le berceau</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il passeggino</strong> — la poussette</div>
                <div className="bg-purple-50 p-2 rounded"><strong>il pisolino</strong> — la sieste</div>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-3">Verbes liés à la parentalité</div>
              <div className="space-y-2 text-sm">
                <div className="bg-purple-50 p-2 rounded"><strong>crescere</strong> — grandir / élever</div>
                <div className="bg-purple-50 p-2 rounded"><strong>allattare</strong> — allaiter</div>
                <div className="bg-purple-50 p-2 rounded"><strong>cullare</strong> — bercer</div>
                <div className="bg-purple-50 p-2 rounded"><strong>insegnare</strong> — enseigner</div>
                <div className="bg-purple-50 p-2 rounded"><strong>aspettare un bambino</strong> — attendre un enfant</div>
                <div className="bg-purple-50 p-2 rounded"><strong>cambiare il pannolino</strong> — changer la couche</div>
              </div>
            </div>
          </div>
        );

      case 'visual-morning':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">Phrases du matin</div>
              <div className="space-y-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>Buongiorno!</strong> — Bonjour !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Hai dormito bene?</strong> — Tu as bien dormi ?</div>
                <div className="bg-teal-50 p-2 rounded"><strong>È ora di alzarsi.</strong> — C'est l'heure de se lever.</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Cosa vuoi per colazione?</strong> — Que veux-tu pour le petit-déj ?</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Hai lavato i denti?</strong> — Tu t'es lavé les dents ?</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Mettiti le scarpe.</strong> — Mets tes chaussures.</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Sbrigati, siamo in ritardo!</strong> — Dépêche-toi, on est en retard !</div>
              </div>
            </div>
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">Vocabulaire du petit-déjeuner</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>il caffè</strong> — le café</div>
                <div className="bg-teal-50 p-2 rounded"><strong>il latte</strong> — le lait</div>
                <div className="bg-teal-50 p-2 rounded"><strong>il pane</strong> — le pain</div>
                <div className="bg-teal-50 p-2 rounded"><strong>la marmellata</strong> — la confiture</div>
                <div className="bg-teal-50 p-2 rounded"><strong>i biscotti</strong> — les biscuits</div>
                <div className="bg-teal-50 p-2 rounded"><strong>la spremuta</strong> — le jus pressé</div>
              </div>
            </div>
          </div>
        );

      case 'visual-meals':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">Les repas</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>la colazione</strong> — le petit-déjeuner</div>
                <div className="bg-teal-50 p-2 rounded"><strong>il pranzo</strong> — le déjeuner</div>
                <div className="bg-teal-50 p-2 rounded"><strong>la merenda</strong> — le goûter</div>
                <div className="bg-teal-50 p-2 rounded"><strong>la cena</strong> — le dîner</div>
              </div>
            </div>
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">Phrases à table</div>
              <div className="space-y-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>A tavola!</strong> — À table !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Buon appetito!</strong> — Bon appétit !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Vuoi ancora?</strong> — Tu en veux encore ?</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Mi passi il pane?</strong> — Tu me passes le pain ?</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Com'è buono!</strong> — Comme c'est bon !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Mangia tutto, su!</strong> — Mange tout, allez !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Sono pieno/a.</strong> — Je suis plein(e) / rassasié(e).</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Apparecchiamo la tavola.</strong> — Mettons la table.</div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Astuce culturelle :</strong> en Italie, on dit <em>a tavola</em> (sans article) — c'est figé. Et <em>buon appetito</em> se dit aussi entre adultes, ce n'est pas réservé aux enfants !</div>
            </div>
          </div>
        );

      case 'visual-bedtime':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">La routine du soir</div>
              <div className="space-y-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>È ora di andare a letto.</strong> — C'est l'heure d'aller au lit.</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Mettiti il pigiama.</strong> — Mets ton pyjama.</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Lavati i denti.</strong> — Brosse-toi les dents.</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Ti racconto una storia?</strong> — Je te raconte une histoire ?</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Spengo la luce.</strong> — J'éteins la lumière.</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Buonanotte, sogni d'oro.</strong> — Bonne nuit, fais de beaux rêves.</div>
              </div>
            </div>
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">Vocabulaire de la nuit</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>il letto</strong> — le lit</div>
                <div className="bg-teal-50 p-2 rounded"><strong>il pigiama</strong> — le pyjama</div>
                <div className="bg-teal-50 p-2 rounded"><strong>la coperta</strong> — la couverture</div>
                <div className="bg-teal-50 p-2 rounded"><strong>il cuscino</strong> — l'oreiller</div>
                <div className="bg-teal-50 p-2 rounded"><strong>la favola</strong> — le conte</div>
                <div className="bg-teal-50 p-2 rounded"><strong>il sogno</strong> — le rêve</div>
              </div>
            </div>
          </div>
        );

      case 'visual-instructions':
        return (
          <div className="space-y-3">
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">L'impératif (tu) — les essentiels</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>Vieni!</strong> — Viens !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Vai!</strong> — Va ! / Vas-y !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Aspetta!</strong> — Attends !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Guarda!</strong> — Regarde !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Ascolta!</strong> — Écoute !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Mangia!</strong> — Mange !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Stai fermo!</strong> — Tiens-toi tranquille !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Smettila!</strong> — Arrête ça !</div>
              </div>
            </div>
            <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
              <div className="font-semibold text-teal-900 mb-3">Encouragements et félicitations</div>
              <div className="space-y-2 text-sm">
                <div className="bg-teal-50 p-2 rounded"><strong>Bravo / Brava!</strong> — Bravo !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Bravissimo / Bravissima!</strong> — Super bravo !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Hai fatto benissimo!</strong> — Tu as très bien fait !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Che bel disegno!</strong> — Quel beau dessin !</div>
                <div className="bg-teal-50 p-2 rounded"><strong>Sei stato/a bravo/a oggi.</strong> — Tu as été sage aujourd'hui.</div>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="text-sm text-amber-900"><strong>Règle de l'impératif (tu) :</strong> pour les verbes en <strong>-are</strong>, l'impératif est différent du présent : <em>parla!</em> (parle, pas <em>parli</em>). Pour <strong>-ere</strong> et <strong>-ire</strong>, c'est le même qu'au présent : <em>prendi!</em>, <em>dormi!</em>.</div>
            </div>
          </div>
        );

      default:
        return <div className="text-slate-500">Contenu en préparation...</div>;
    }
  };

  // ============ UI ============

  const totalLessons = Object.values(modules).reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = Object.values(progress).reduce((sum, m) => sum + Object.values(m).filter(l => l.completed).length, 0);
  const globalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const getReviewsNeeded = () => {
    const now = new Date();
    const reviews = [];
    Object.entries(progress).forEach(([moduleId, lessons]) => {
      Object.entries(lessons).forEach(([lessonId, data]) => {
        if (data.completed && data.lastReviewed) {
          const last = new Date(data.lastReviewed);
          const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));
          const intervals = [1, 3, 7, 14, 30];
          const targetInterval = intervals[Math.min(data.reviewCount - 1, intervals.length - 1)];
          if (daysSince >= targetInterval) {
            reviews.push({ moduleId, lessonId: parseInt(lessonId), daysSince });
          }
        }
      });
    });
    return reviews;
  };

  const reviewsNeeded = getReviewsNeeded();

  // VUE ACCUEIL
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Impariamo l'italiano</h1>
            <p className="text-slate-600">Pour la famille et la vie quotidienne</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-slate-800">Progression globale</span>
              </div>
              <span className="text-2xl font-bold text-slate-800">{globalProgress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 transition-all" style={{ width: `${globalProgress}%` }}></div>
            </div>
            <div className="text-xs text-slate-500 mt-2">{completedLessons} / {totalLessons} leçons complétées</div>
          </div>

          {reviewsNeeded.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="w-5 h-5 text-amber-700" />
                <span className="font-semibold text-amber-900">À réviser aujourd'hui</span>
              </div>
              <div className="text-sm text-amber-800">{reviewsNeeded.length} leçon{reviewsNeeded.length > 1 ? 's' : ''} méritent une révision (révision espacée).</div>
              <button
                onClick={() => {
                  const first = reviewsNeeded[0];
                  setCurrentModule(first.moduleId);
                  setCurrentLesson(first.lessonId);
                  setCurrentView('lesson');
                }}
                className="mt-3 text-sm bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"
              >
                Commencer la révision
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(modules).map(([id, mod]) => {
              const Icon = mod.icon;
              const progressPct = getModuleProgress(id, mod.lessons.length);
              return (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentModule(id);
                    setCurrentLesson(0);
                    setCurrentView('lesson');
                  }}
                  className={`text-left ${mod.color} border-2 rounded-xl p-5 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="w-7 h-7" />
                    <span className="text-sm font-semibold">{progressPct}%</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{mod.title}</h3>
                  <p className="text-sm opacity-80 mb-3">{mod.description}</p>
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full ${mod.colorAccent}`} style={{ width: `${progressPct}%` }}></div>
                  </div>
                  <div className="text-xs opacity-70 mt-2">{mod.lessons.length} leçons</div>
                </button>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-400 mt-8">
            Progression sauvegardée automatiquement
          </div>
        </div>
      </div>
    );
  }

  // VUE LEÇON
  const mod = modules[currentModule];
  const lesson = mod.lessons[currentLesson];
  const lessonKey = `${currentModule}-${currentLesson}`;
  const isCompleted = progress[currentModule]?.[currentLesson]?.completed;
  const userAnswer = exerciseAnswers[lessonKey];
  const isCorrect = userAnswer === lesson.exercise.answer;
  const hasAnswered = showAnswer[lessonKey];

  return (
    <div className={`min-h-screen ${mod.colorLight} p-4`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm"
          >
            <Home className="w-4 h-4" /> Accueil
          </button>
          <div className="text-sm text-slate-600">
            Leçon {currentLesson + 1} / {mod.lessons.length}
          </div>
        </div>

        <div className={`${mod.color} border-2 rounded-xl p-4 mb-4`}>
          <div className="flex items-center gap-2 mb-1">
            <mod.icon className="w-5 h-5" />
            <span className="text-sm font-semibold opacity-80">{mod.title}</span>
          </div>
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
        </div>

        <div className="mb-4">
          {renderVisualContent(lesson.content)}
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800 text-sm mb-1">À retenir</div>
              <div className="text-sm text-slate-700">{lesson.tip}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className={`w-5 h-5 ${mod.colorAccent.replace('bg-', 'text-')}`} />
            <div className="font-semibold text-slate-800">Exemples en contexte</div>
          </div>
          <div className="space-y-3">
            {lesson.examples.map((ex, idx) => (
              <div key={idx} className={`${mod.colorLight} border-l-4 ${mod.colorAccent.replace('bg-', 'border-')} p-3 rounded`}>
                <div className="font-semibold text-slate-900 italic mb-1">{ex.it}</div>
                <div className="text-sm text-slate-600">→ {ex.fr}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-4">
          <div className="font-semibold text-slate-800 mb-3">✏️ Petit test</div>
          <div className="text-slate-700 mb-3">{lesson.exercise.question}</div>
          <div className="grid grid-cols-2 gap-2">
            {lesson.exercise.options.map((opt) => {
              const selected = userAnswer === opt;
              const correct = hasAnswered && opt === lesson.exercise.answer;
              const wrong = hasAnswered && selected && opt !== lesson.exercise.answer;
              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (!hasAnswered) {
                      setExerciseAnswers({ ...exerciseAnswers, [lessonKey]: opt });
                      setShowAnswer({ ...showAnswer, [lessonKey]: true });
                    }
                  }}
                  disabled={hasAnswered}
                  className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                    correct ? 'bg-emerald-50 border-emerald-400 text-emerald-900' :
                    wrong ? 'bg-rose-50 border-rose-400 text-rose-900' :
                    selected ? `${mod.color} border-current` :
                    'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {hasAnswered && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
              <div className="font-semibold mb-1">{isCorrect ? '✓ Bravissima !' : '✗ Pas tout à fait'}</div>
              {!isCorrect && <div>La bonne réponse est : <strong>{lesson.exercise.answer}</strong></div>}
              {lesson.exercise.explanation && <div className="mt-1">{lesson.exercise.explanation}</div>}
            </div>
          )}
        </div>

        {hasAnswered && !isCompleted && (
          <button
            onClick={() => markLessonComplete(currentModule, currentLesson)}
            className={`w-full ${mod.colorAccent} text-white font-semibold py-3 rounded-xl hover:opacity-90 mb-3 flex items-center justify-center gap-2`}
          >
            <CheckCircle2 className="w-5 h-5" />
            Marquer comme complétée
          </button>
        )}

        {isCompleted && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 mb-3 flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Leçon complétée ✓</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (currentLesson > 0) {
                setCurrentLesson(currentLesson - 1);
              }
            }}
            disabled={currentLesson === 0}
            className="flex-1 bg-white border-2 border-slate-200 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Précédente
          </button>
          <button
            onClick={() => {
              if (currentLesson < mod.lessons.length - 1) {
                setCurrentLesson(currentLesson + 1);
              } else {
                setCurrentView('home');
              }
            }}
            className={`flex-1 ${mod.colorAccent} text-white py-2.5 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-1`}
          >
            {currentLesson < mod.lessons.length - 1 ? <>Suivante <ChevronRight className="w-4 h-4" /></> : 'Retour à l\'accueil'}
          </button>
        </div>
      </div>
    </div>
  );
}
