/**
 * ============================================================================
 * STRAIN RESEARCH KOMPONENTE
 * ============================================================================
 * 
 * Diese Komponente bietet eine Benutzeroberfläche für die automatische
 * Deep Research von Cannabis-Strains.
 * 
 * FUNKTIONEN:
 * - Eingabe des Strain-Namens
 * - Optionale Angabe von Hersteller und THC-Gehalt
 * - Automatische Recherche per API-Call
 * - Anzeige der Ergebnisse mit allen Details
 * - Speichern des Strains in die Datenbank
 * 
 * BENUTZUNG:
 * <StrainResearch onSave={(strain) => console.log('Gespeichert:', strain)} />
 * ============================================================================
 */

'use client'; // Wichtig! Diese Komponente läuft im Browser

// React Hooks für Zustandsmanagement und Effekte
import { useState } from 'react';

// Icons für die Benutzeroberfläche
// Wir verwenden lucide-react für konsistente, schöne Icons
import {
  Search,           // Lupen-Icon für den Research-Button
  Loader2,          // Lade-Animation
  Save,             // Speichern-Icon
  Leaf,             // Cannabis-Blatt
  Dna,              // Genetik-Icon
  Flame,            // Aroma/Geschmack
  Users,            // Community
  AlertCircle,      // Fehler-Anzeige
  CheckCircle,      // Erfolg-Anzeige
  Sparkles,         // Besonderheit/Hervorhebung
  Beaker,           // THC/Chemie
  MapPin,           // Herkunft
  Zap,              // Wirkungen
  Heart,            // Medizinische Anwendungen
  TrendingUp,       // Häufigkeit/Statistik
} from 'lucide-react';

// Unsere TypeScript-Typen für die Datenstruktur
import { Strain, Effect, MedicalUse, Terpene } from '@/app/types/strain';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Props (Eigenschaften) der StrainResearch Komponente
 */
interface StrainResearchProps {
  /**
   * Callback-Funktion, die aufgerufen wird, wenn der Benutzer
   * den recherchierten Strain speichern möchte.
   * @param strain - Das vollständige Strain-Objekt mit allen Daten
   */
  onSave: (strain: Strain) => void;
  
  /**
   * Optionale Callback-Funktion, die aufgerufen wird,
   * wenn der Benutzer den Vorgang abbrechen möchte.
   */
  onCancel?: () => void;
}

/**
 * Status der Research-Anfrage
 */
type ResearchStatus = 'idle' | 'loading' | 'success' | 'error';

// =============================================================================
// HAUPTKOMPONENTE
// =============================================================================

/**
 * StrainResearch Komponente
 * 
 * Diese Komponente zeigt ein Formular für die Strain-Recherche und
 * die Ergebnis-Anzeige. Sie verwaltet den gesamten Research-Prozess.
 */
export function StrainResearch({ onSave, onCancel }: StrainResearchProps) {
  
  // ==========================================================================
  // ZUSTAND (State)
  // Wir verwenden useState um Daten zu speichern, die sich ändern
  // ==========================================================================
  
  // Eingabefelder
  const [strainName, setStrainName] = useState('');
  const [producer, setProducer] = useState('');
  const [thcContent, setThcContent] = useState('');
  
  // Status der Anfrage
  const [status, setStatus] = useState<ResearchStatus>('idle');
  
  // Fehlermeldung (falls ein Fehler auftritt)
  const [error, setError] = useState<string | null>(null);
  
  // Die recherchierten Daten (wenn die Anfrage erfolgreich war)
  const [result, setResult] = useState<Strain | null>(null);
  
  // ==========================================================================
  // EVENT HANDLER
  // Funktionen, die auf Benutzer-Aktionen reagieren
  // ==========================================================================
  
  /**
   * Startet die Research-Anfrage
   * Diese Funktion wird aufgerufen, wenn der Benutzer auf "Research starten" klickt
   */
  const handleResearch = async () => {
    // Prüfe, ob ein Name eingegeben wurde
    if (!strainName.trim()) {
      setError('Bitte gib einen Strain-Namen ein.');
      return;
    }
    
    // Setze den Status auf "loading" (zeigt Lade-Anzeige)
    setStatus('loading');
    setError(null);
    setResult(null);
    
    try {
      // Sende POST-Request an unsere API
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Wir senden JSON-Daten
        },
        body: JSON.stringify({
          name: strainName.trim(),
          producer: producer.trim() || undefined,
          thcContent: thcContent.trim() || undefined,
        }),
      });
      
      // Parsen der JSON-Antwort
      const data = await response.json();
      
      // Prüfe, ob die Anfrage erfolgreich war
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ein Fehler ist aufgetreten.');
      }
      
      // Speichere das Ergebnis
      setResult(data.data);
      setStatus('success');
      
    } catch (err) {
      // Fehlerbehandlung
      console.error('Research-Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setStatus('error');
    }
  };
  
  /**
   * Speichert den recherchierten Strain
   * Wird aufgerufen, wenn der Benutzer auf "In Datenbank speichern" klickt
   */
  const handleSave = () => {
    if (result) {
      onSave(result);
    }
  };
  
  /**
   * Setzt alle Eingaben zurück
   */
  const handleReset = () => {
    setStrainName('');
    setProducer('');
    setThcContent('');
    setStatus('idle');
    setError(null);
    setResult(null);
  };
  
  // ==========================================================================
  // RENDER (Anzeige)
  // Wir beschreiben, wie die Komponente aussehen soll
  // ==========================================================================
  
  return (
    <div className="space-y-6">
      
      {/* ================================================================
          ABSCHNITT 1: EINGABEFORMULAR
          Hier gibt der Benutzer den Strain-Namen ein
      ================================================================= */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-400" />
          Strain recherchieren
        </h3>
        
        {/* Eingabefeld: Strain-Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Strain-Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={strainName}
            onChange={(e) => setStrainName(e.target.value)}
            placeholder="z.B. Alien Mints Huala"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
            disabled={status === 'loading'}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Gib den Namen des Strains ein. Wir analysieren ihn und erstellen ein Profil.
          </p>
        </div>
        
        {/* Optionale Felder in einer Reihe */}
        <div className="grid grid-cols-2 gap-4">
          {/* Eingabefeld: Hersteller */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Hersteller <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="text"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="z.B. Seed Junky"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
              disabled={status === 'loading'}
            />
          </div>
          
          {/* Eingabefeld: THC-Gehalt */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              THC-Gehalt <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="text"
              value={thcContent}
              onChange={(e) => setThcContent(e.target.value)}
              placeholder="z.B. 27%"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
              disabled={status === 'loading'}
            />
          </div>
        </div>
        
        {/* Button: Research starten */}
        <button
          onClick={handleResearch}
          disabled={status === 'loading' || !strainName.trim()}
          className="w-full py-3 bg-green-500 text-black font-medium rounded-xl hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Recherche läuft...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Research starten
            </>
          )}
        </button>
      </div>
      
      {/* ================================================================
          ABSCHNITT 2: FEHLERANZEIGE
          Wenn ein Fehler aufgetreten ist
      ================================================================= */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Fehler</span>
          </div>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
          >
            Erneut versuchen
          </button>
        </div>
      )}
      
      {/* ================================================================
          ABSCHNITT 3: ERGEBNISANZEIGE
          Wenn die Recherche erfolgreich war
      ================================================================= */}
      {result && status === 'success' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Erfolgsmeldung */}
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Research abgeschlossen!</span>
          </div>
          
          {/* Ergebnis-Karte */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            
            {/* Header mit Name und THC */}
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Beaker className="w-4 h-4" />
                      {result.thcContent}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {result.origin}
                    </span>
                  </div>
                </div>
                
                {/* Genetik-Badge */}
                {result.researchData?.genetics && (
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    {result.researchData.genetics.type}
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {result.tags.slice(0, 5).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Hauptinhalt */}
            <div className="p-6 space-y-6">
              
              {/* Wirkungen */}
              <section>
                <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Wirkungen
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.effects.slice(0, 8).map((effect, i) => (
                    <EffectBadge key={i} effect={effect} />
                  ))}
                </div>
                {result.effectDescription && (
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {result.effectDescription}
                  </p>
                )}
              </section>

              {/* Detaillierte Analyse */}
              {result.detailedAnalysis && (
                <section>
                  <DetailedAnalysisDisplay analysis={result.detailedAnalysis} />
                </section>
              )}

              {/* Medizinische Anwendungen */}
              <section>
                <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                  <Heart className="w-4 h-4 text-red-400" />
                  Medizinische Anwendungen
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.medicalUses.slice(0, 6).map((use, i) => (
                    <MedicalBadge key={i} use={use} />
                  ))}
                </div>
                {result.medicalFocus && (
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {result.medicalFocus}
                  </p>
                )}
              </section>
              
              {/* Genetik */}
              {result.researchData?.genetics && (
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <Dna className="w-4 h-4 text-blue-400" />
                    Genetik
                  </h4>
                  <GeneticsDisplay genetics={result.researchData.genetics} />
                </section>
              )}
              
              {/* Terpene */}
              {result.researchData?.terpenes && (
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <Leaf className="w-4 h-4 text-green-400" />
                    Terpene
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {result.researchData.terpenes.map((terpene, i) => (
                      <TerpeneCard key={i} terpene={terpene} index={i} />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Aroma & Geschmack */}
              {result.researchData?.flavorProfile && (
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Aroma & Geschmack
                  </h4>
                  <FlavorDisplay flavor={result.researchData.flavorProfile} />
                </section>
              )}
              
              {/* Community Stats */}
              {result.researchData?.communityStats && (
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <Users className="w-4 h-4 text-purple-400" />
                    Community
                  </h4>
                  <CommunityStatsDisplay stats={result.researchData.communityStats} />
                </section>
              )}
            </div>
          </div>
          
          {/* Aktions-Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-green-500 text-black font-medium rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              In Datenbank speichern
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Neuer Strain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HILFSKOMPONENTEN
// Kleine Komponenten für spezifische Anzeige-Elemente
// =============================================================================

/**
 * Zeigt einen einzelnen Effekt als Badge an
 */
function EffectBadge({ effect }: { effect: Effect }) {
  // Bestimme die Farbe basierend auf der Kategorie
  const colors = {
    positive: 'bg-green-500/20 text-green-400 border-green-500/30',
    medical: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    negative: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  return (
    <div className={`px-3 py-1.5 rounded-lg border ${colors[effect.category || 'positive']} text-sm`}>
      <span className="font-medium">{effect.name}</span>
      <span className="ml-1.5 text-xs opacity-75">{effect.frequency}×</span>
    </div>
  );
}

/**
 * Zeigt eine medizinische Anwendung als Badge an
 */
function MedicalBadge({ use }: { use: MedicalUse }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-sm ${
      use.isHighlighted 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
    }`}>
      <span className="font-medium">{use.condition}</span>
      <span className="ml-1.5 text-xs opacity-75">{use.frequency}×</span>
    </div>
  );
}

/**
 * Zeigt Genetik-Informationen an
 */
function GeneticsDisplay({ genetics }: { genetics: NonNullable<Strain['researchData']>['genetics'] }) {
  if (!genetics) return null;
  
  return (
    <div className="bg-zinc-950 rounded-lg p-4 space-y-3">
      {/* Indica/Sativa Balken */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-purple-400">Indica</span>
          <span className="text-amber-400">Sativa</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full"
            style={{ width: `${genetics.indicaPercentage}%` }}
          />
        </div>
        <div className="text-center text-xs text-zinc-500 mt-1">
          {genetics.indicaPercentage}% Indica / {genetics.sativaPercentage}% Sativa
        </div>
      </div>
      
      {/* Eltern */}
      {genetics.parents && (
        <div className="pt-2 border-t border-zinc-800">
          <span className="text-sm text-zinc-400">Eltern:</span>
          <span className="ml-2 text-sm text-white">{genetics.parents.join(' × ')}</span>
        </div>
      )}
      
      {/* Züchter */}
      {genetics.breeder && (
        <div>
          <span className="text-sm text-zinc-400">Züchter:</span>
          <span className="ml-2 text-sm text-white">{genetics.breeder}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Zeigt ein Terpen als Karte an
 */
function TerpeneCard({ terpene, index }: { terpene: Terpene; index: number }) {
  // Rang-Emojis
  const medals = ['🥇', '🥈', '🥉'];
  
  return (
    <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{medals[index]}</span>
        <span className="font-medium text-white">{terpene.name}</span>
      </div>
      <p className="text-xs text-zinc-400 capitalize">
        {terpene.aromas?.join(', ')}
      </p>
      {terpene.effect && (
        <p className="text-xs text-green-400 mt-1">
          {terpene.effect}
        </p>
      )}
    </div>
  );
}

/**
 * Zeigt das Aroma/Geschmacks-Profil an
 */
function FlavorDisplay({ flavor }: { flavor: NonNullable<Strain['researchData']>['flavorProfile'] }) {
  if (!flavor) return null;
  
  return (
    <div className="bg-zinc-950 rounded-lg p-4 space-y-3">
      {/* Hauptaromen */}
      <div className="flex flex-wrap gap-2">
        {flavor.primary.map((aroma, i) => (
          <span 
            key={i}
            className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm"
          >
            {aroma}
          </span>
        ))}
      </div>
      
      {/* Sekundäre Aromen */}
      {flavor.secondary && flavor.secondary.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {flavor.secondary.map((aroma, i) => (
            <span 
              key={i}
              className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs"
            >
              {aroma}
            </span>
          ))}
        </div>
      )}
      
      {/* Beschreibung */}
      {flavor.description && (
        <p className="text-sm text-zinc-400 leading-relaxed">
          {flavor.description}
        </p>
      )}
    </div>
  );
}

/**
 * Zeigt Community-Statistiken an
 */
function CommunityStatsDisplay({ stats }: { stats: NonNullable<Strain['researchData']>['communityStats'] }) {
  if (!stats) return null;
  
  return (
    <div className="bg-zinc-950 rounded-lg p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        {/* Anzahl Reviews */}
        <div>
          <div className="text-2xl font-bold text-white">{stats.reviewCount}</div>
          <div className="text-xs text-zinc-500">Reviews analysiert</div>
        </div>
        
        {/* Durchschnittsbewertung */}
        <div>
          <div className="text-2xl font-bold text-yellow-400">
            {stats.averageRating?.toFixed(1) || '-'}
          </div>
          <div className="text-xs text-zinc-500">Ø Bewertung</div>
        </div>
        
        {/* Popularität */}
        <div>
          <div className="text-2xl font-bold text-purple-400">
            {stats.popularity ? `${(stats.popularity / 1000).toFixed(1)}k` : '-'}
          </div>
          <div className="text-xs text-zinc-500">Popularität</div>
        </div>
      </div>
      
      {/* Datenquellen */}
      {stats.sources && stats.sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">Quellen:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {stats.sources.map((source, i) => (
              <span 
                key={i}
                className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ============================================================================
 * DETAILED ANALYSIS DISPLAY KOMPONENTE
 * ============================================================================
 *
 * Diese Komponente zeigt die detaillierte Review-Analyse an.
 * Sie unterstützt Markdown-ähnliche Formatierung und bietet
 * einen "Mehr anzeigen"/"Weniger anzeigen" Button für lange Texte.
 */

/**
 * Props für die DetailedAnalysisDisplay Komponente
 */
interface DetailedAnalysisDisplayProps {
  /** Der ausführliche Analyse-Text im Markdown-Format */
  analysis: string;
}

/**
 * Formatiert Markdown-ähnliche Syntax zu JSX
 * Unterstützt: **fett**, *kursiv*, Zeilenumbrüche
 */
function formatMarkdown(text: string): React.ReactNode {
  // Teile den Text an Zeilenumbrüchen
  const lines = text.split('\n');

  return lines.map((line, index) => {
    // Überspringe leere Zeilen, aber füge einen Abstand hinzu
    if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    }

    // Ersetze **fett** mit <strong>
    let formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Ersetze *kursiv* mit <em> (aber nicht die Sterne in Listen)
    formattedLine = formattedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Erkenne Überschriften (Zeilen, die mit ** beginnen und enden)
    const isHeading = line.startsWith('**') && line.endsWith('**');

    return (
      <p
        key={index}
        className={`mb-2 ${isHeading ? 'font-semibold text-white mt-4 first:mt-0' : 'text-zinc-300'}`}
        dangerouslySetInnerHTML={{ __html: formattedLine }}
      />
    );
  });
}

/**
 * Zeigt die detaillierte Analyse mit Expand/Collapse Funktionalität
 */
function DetailedAnalysisDisplay({ analysis }: DetailedAnalysisDisplayProps) {
  // State für Expand/Collapse
  // true = Text ist ausgeklappt, false = Text ist eingeklappt
  const [isExpanded, setIsExpanded] = useState(false);

  // Konstanten für die Text-Längen
  const MAX_PREVIEW_LENGTH = 300; // Zeichen, die im eingeklappten Zustand angezeigt werden
  const MIN_LENGTH_FOR_COLLAPSE = 400; // Mindestlänge für den Collapse-Button

  // Prüfe, ob der Text lang genug ist für den Collapse-Button
  const shouldShowCollapseButton = analysis.length > MIN_LENGTH_FOR_COLLAPSE;

  // Bestimme den anzuzeigenden Text
  const displayText = isExpanded || !shouldShowCollapseButton
    ? analysis
    : analysis.substring(0, MAX_PREVIEW_LENGTH) + '...';

  return (
    <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-lg p-4 border border-zinc-800/50">
      {/* Header mit Icon und Titel */}
      <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
        <Search className="w-4 h-4 text-cyan-400" />
        Detaillierte Review-Analyse
      </h4>

      {/* Analyse-Text mit Formatierung */}
      <div className="text-sm leading-relaxed">
        {formatMarkdown(displayText)}
      </div>

      {/* Mehr/Weniger anzeigen Button */}
      {shouldShowCollapseButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Weniger anzeigen</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Mehr anzeigen</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}