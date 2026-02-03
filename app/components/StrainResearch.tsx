/**
 * ============================================================================
 * STRAIN RESEARCH KOMPONENTE - MIT BATCH SUPPORT
 * ============================================================================
 * 
 * Diese Komponente bietet eine Benutzeroberfläche für die automatische
 * Deep Research von Cannabis-Strains.
 * 
 * FUNKTIONEN:
 * - Einzelner Strain: Eingabe des Strain-Namens
 * - Batch Modus: Mehrere Strains auf einmal recherchieren
 * - Automatische Recherche per API-Call
 * - Anzeige der Ergebnisse mit allen Details
 * - Speichern des Strains (einzeln oder mehrere) in die Datenbank
 * 
 * BENUTZUNG:
 * <StrainResearch onSave={(strain) => console.log('Gespeichert:', strain)} />
 * <StrainResearch onSaveBatch={(strains) => console.log('Gespeichert:', strains)} />
 * ============================================================================
 */

'use client'; // Wichtig! Diese Komponente läuft im Browser

// React Hooks für Zustandsmanagement und Effekte
import { useState, useCallback } from 'react';

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
  List,             // Listen-Icon für Batch
  User,             // Einzelner Strain
  Trash2,           // Löschen
  X,                // Schließen/X
  CheckSquare,      // Checkbox ausgewählt
  Square,           // Checkbox nicht ausgewählt
  ChevronDown,      // Ausklappen
  ChevronUp,        // Einklappen
  FileText,         // Text/Notizen
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
   * den recherchierten Strain speichern möchte (Einzelmodus).
   * @param strain - Das vollständige Strain-Objekt mit allen Daten
   */
  onSave?: (strain: Strain) => void;
  
  /**
   * Callback-Funktion, die aufgerufen wird, wenn der Benutzer
   * mehrere recherchierte Strains speichern möchte (Batch-Modus).
   * @param strains - Array von Strain-Objekten
   */
  onSaveBatch?: (strains: Strain[]) => void;
  
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

/**
 * Research-Modus: Einzelner Strain oder Batch (mehrere)
 */
type ResearchMode = 'single' | 'batch';

/**
 * Ein Batch-Item mit seinem aktuellen Status
 */
interface BatchItem {
  /** Eindeutige ID für dieses Item */
  id: string;
  /** Der Name des Strains */
  name: string;
  /** Aktueller Verarbeitungsstatus */
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  /** Das recherchierte Ergebnis (nur bei completed) */
  result?: Strain;
  /** Fehlermeldung (nur bei error) */
  error?: string;
  /** Ob dieses Item zum Speichern ausgewählt ist */
  selected: boolean;
  /** Ob die Details ausgeklappt sind */
  expanded: boolean;
}

// =============================================================================
// HAUPTKOMPONENTE
// =============================================================================

/**
 * StrainResearch Komponente
 * 
 * Diese Komponente zeigt ein Formular für die Strain-Recherche und
 * die Ergebnis-Anzeige. Sie unterstützt sowohl Einzel- als auch Batch-Modus.
 */
export function StrainResearch({ onSave, onSaveBatch, onCancel }: StrainResearchProps) {
  
  // ==========================================================================
  // ZUSTAND (State) - Einzelmodus
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
  // ZUSTAND (State) - Batch-Modus
  // ==========================================================================
  
  // Aktueller Modus (single oder batch)
  const [mode, setMode] = useState<ResearchMode>('single');
  
  // Textarea-Inhalt für Batch (mehrere Zeilen)
  const [batchInput, setBatchInput] = useState('');
  
  // Liste aller Batch-Items
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  
  // Batch-Fortschritt
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    currentName: '',
  });
  
  // ==========================================================================
  // EVENT HANDLER - Einzelmodus
  // ==========================================================================
  
  /**
   * Startet die Research-Anfrage für einen einzelnen Strain
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
          'Content-Type': 'application/json',
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
   */
  const handleSave = () => {
    if (result && onSave) {
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
  // EVENT HANDLER - Batch-Modus
  // ==========================================================================
  
  /**
   * Parst den Batch-Input und erstellt die Batch-Items
   */
  const parseBatchInput = useCallback((): string[] => {
    if (!batchInput.trim()) return [];
    
    // Teile den Text in Zeilen auf und bereinige
    const lines = batchInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Entferne Duplikate (Case-Insensitive)
    const seen = new Set<string>();
    const unique: string[] = [];
    
    for (const name of lines) {
      const lowerName = name.toLowerCase();
      if (!seen.has(lowerName)) {
        seen.add(lowerName);
        unique.push(name);
      }
    }
    
    return unique;
  }, [batchInput]);
  
  /**
   * Startet die Batch-Research für alle eingegebenen Strains
   */
  const handleBatchResearch = async () => {
    const names = parseBatchInput();
    
    if (names.length === 0) {
      setError('Bitte gib mindestens einen Strain-Namen ein.');
      return;
    }
    
    if (names.length > 20) {
      setError('Maximum 20 Strains pro Batch. Bitte reduziere die Anzahl.');
      return;
    }
    
    // Initialisiere Batch-Items
    const items: BatchItem[] = names.map((name, index) => ({
      id: `batch-${Date.now()}-${index}`,
      name,
      status: 'pending',
      selected: true, // Standardmäßig ausgewählt
      expanded: false,
    }));
    
    setBatchItems(items);
    setStatus('loading');
    setError(null);
    setBatchProgress({ current: 0, total: names.length, currentName: '' });
    
    try {
      // Sende Batch-Request an die API
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strains: names.map(name => ({ name })),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Batch-Research.');
      }
      
      // Verarbeite die Ergebnisse
      const results = data.data as Array<{
        success: boolean;
        requestedName: string;
        strain?: Strain;
        error?: string;
      }>;
      
      // Aktualisiere die Batch-Items mit den Ergebnissen
      const updatedItems = items.map((item, index) => {
        const result = results[index];
        if (!result) return item;
        
        if (result.success && result.strain) {
          return {
            ...item,
            status: 'completed' as const,
            result: result.strain,
          };
        } else {
          return {
            ...item,
            status: 'error' as const,
            error: result.error || 'Unbekannter Fehler',
            selected: false, // Fehlerhafte Items nicht auswählen
          };
        }
      });
      
      setBatchItems(updatedItems);
      setStatus('success');
      setBatchProgress({ current: names.length, total: names.length, currentName: '' });
      
    } catch (err) {
      console.error('Batch-Research-Fehler:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Batch-Research');
      
      // Markiere alle als Fehler
      setBatchItems(items.map(item => ({
        ...item,
        status: 'error' as const,
        error: 'Request fehlgeschlagen',
      })));
      
      setStatus('error');
    }
  };
  
  /**
   * Setzt den Batch-Modus zurück
   */
  const handleBatchReset = () => {
    setBatchInput('');
    setBatchItems([]);
    setStatus('idle');
    setError(null);
    setBatchProgress({ current: 0, total: 0, currentName: '' });
  };
  
  /**
   * Speichert alle ausgewählten Batch-Items
   */
  const handleSaveBatch = () => {
    if (!onSaveBatch) return;
    
    const selectedStrains = batchItems
      .filter(item => item.selected && item.status === 'completed' && item.result)
      .map(item => item.result!);
    
    if (selectedStrains.length > 0) {
      onSaveBatch(selectedStrains);
    }
  };
  
  /**
   * Toggle für die Auswahl eines Batch-Items
   */
  const toggleItemSelection = (id: string) => {
    setBatchItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };
  
  /**
   * Toggle für das Ausklappen eines Batch-Items
   */
  const toggleItemExpanded = (id: string) => {
    setBatchItems(items =>
      items.map(item =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };
  
  /**
   * Löscht ein Batch-Item aus der Liste
   */
  const removeBatchItem = (id: string) => {
    setBatchItems(items => items.filter(item => item.id !== id));
  };
  
  /**
   * Wählt alle erfolgreichen Items aus
   */
  const selectAllCompleted = () => {
    setBatchItems(items =>
      items.map(item =>
        item.status === 'completed'
          ? { ...item, selected: true }
          : item
      )
    );
  };
  
  /**
   * Hebt die Auswahl aller Items auf
   */
  const deselectAll = () => {
    setBatchItems(items =>
      items.map(item => ({ ...item, selected: false }))
    );
  };
  
  // Anzahl der ausgewählten Items
  const selectedCount = batchItems.filter(item => item.selected).length;
  const completedCount = batchItems.filter(item => item.status === 'completed').length;
  
  // ==========================================================================
  // RENDER (Anzeige)
  // ==========================================================================
  
  return (
    <div className="space-y-6">
      
      {/* ================================================================
          ABSCHNITT 1: MODUS-AUSWAHL (Toggle zwischen Single und Batch)
      ================================================================= */}
      <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
        <button
          onClick={() => {
            setMode('single');
            handleBatchReset();
          }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === 'single'
              ? 'bg-green-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Einzelner Strain
        </button>
        <button
          onClick={() => {
            setMode('batch');
            handleReset();
          }}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === 'batch'
              ? 'bg-green-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          Mehrere Strains
        </button>
      </div>
      
      {mode === 'single' ? (
        /* ================================================================
            EINZELMODUS: Eingabeformular für einen Strain
        ================================================================= */
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
      ) : (
        /* ================================================================
            BATCH-MODUS: Eingabeformular für mehrere Strains
        ================================================================= */
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-green-400" />
            Mehrere Strains recherchieren
          </h3>
          
          {/* Textarea für Batch-Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Strain-Namen <span className="text-red-400">*</span>
            </label>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder={`Gib mehrere Strain-Namen ein, einer pro Zeile:

Alien Mints Huala
OG Kush
Blue Dream
Gelato
...`}
              rows={6}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 resize-none font-mono text-sm"
              disabled={status === 'loading'}
            />
            <p className="text-xs text-zinc-500 mt-1 flex justify-between">
              <span>Ein Strain pro Zeile. Duplikate werden automatisch entfernt.</span>
              <span className={parseBatchInput().length > 20 ? 'text-red-400' : ''}>
                {parseBatchInput().length} / 20 Strains
              </span>
            </p>
          </div>
          
          {/* Button: Batch-Research starten */}
          <button
            onClick={handleBatchResearch}
            disabled={status === 'loading' || parseBatchInput().length === 0 || parseBatchInput().length > 20}
            className="w-full py-3 bg-green-500 text-black font-medium rounded-xl hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Batch-Research läuft...
              </>
            ) : (
              <>
                <List className="w-5 h-5" />
                {parseBatchInput().length > 0 
                  ? `${parseBatchInput().length} Strains recherchieren`
                  : 'Research starten'}
              </>
            )}
          </button>
        </div>
      )}
      
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
          ABSCHNITT 3: BATCH-FORTSCHRITT
          Während des Batch-Research läuft
      ================================================================= */}
      {mode === 'batch' && status === 'loading' && batchProgress.total > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Batch-Research läuft...</span>
          </div>
          
          {/* Fortschrittsbalken */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${(batchProgress.current / batchProgress.total) * 100}%` 
              }}
            />
          </div>
          
          {/* Fortschrittstext */}
          <p className="mt-2 text-sm text-zinc-400">
            {batchProgress.current} von {batchProgress.total} Strains verarbeitet...
          </p>
          
          {/* Hinweis */}
          <p className="mt-1 text-xs text-zinc-500">
            Bitte warte, die API hat Rate-Limits zwischen den Requests.
          </p>
        </div>
      )}
      
      {/* ================================================================
          ABSCHNITT 4: BATCH-ERGEBNISSE
          Liste aller recherchierten Strains mit Auswahl
      ================================================================= */}
      {mode === 'batch' && batchItems.length > 0 && status !== 'loading' && (
        <div className="space-y-4">
          {/* Header mit Zusammenfassung */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Ergebnisse ({completedCount} erfolgreich)
            </h3>
            
            {/* Auswahl-Buttons */}
            <div className="flex gap-2">
              <button
                onClick={selectAllCompleted}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
              >
                Alle auswählen
              </button>
              <button
                onClick={deselectAll}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
              >
                Auswahl aufheben
              </button>
            </div>
          </div>
          
          {/* Batch-Items Liste */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {batchItems.map((item) => (
              <BatchItemCard
                key={item.id}
                item={item}
                onToggleSelect={() => toggleItemSelection(item.id)}
                onToggleExpand={() => toggleItemExpanded(item.id)}
                onRemove={() => removeBatchItem(item.id)}
              />
            ))}
          </div>
          
          {/* Speichern-Buttons */}
          {completedCount > 0 && (
            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={handleSaveBatch}
                disabled={selectedCount === 0 || !onSaveBatch}
                className="flex-1 py-3 bg-green-500 text-black font-medium rounded-xl hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {selectedCount > 0 
                  ? `${selectedCount} Strains speichern`
                  : 'Speichern'}
              </button>
              <button
                onClick={handleBatchReset}
                className="px-6 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Neuer Batch
              </button>
            </div>
          )}
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
 * Props für die BatchItemCard Komponente
 */
interface BatchItemCardProps {
  item: BatchItem;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onRemove: () => void;
}

/**
 * Zeigt ein einzelnes Batch-Item mit Status und Details an
 */
function BatchItemCard({ item, onToggleSelect, onToggleExpand, onRemove }: BatchItemCardProps) {
  // Bestimme die Status-Farbe und das Icon
  const statusConfig = {
    pending: { color: 'text-zinc-500', bg: 'bg-zinc-900', icon: null },
    processing: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
    completed: { color: 'text-green-400', bg: 'bg-green-500/10', icon: <CheckCircle className="w-4 h-4" /> },
    error: { color: 'text-red-400', bg: 'bg-red-500/10', icon: <AlertCircle className="w-4 h-4" /> },
    skipped: { color: 'text-zinc-500', bg: 'bg-zinc-900', icon: <X className="w-4 h-4" /> },
  };
  
  const config = statusConfig[item.status];
  
  return (
    <div className={`border rounded-xl overflow-hidden ${
      item.selected && item.status === 'completed' 
        ? 'border-green-500/30 bg-green-500/5' 
        : 'border-zinc-800 bg-zinc-950'
    }`}>
      {/* Header mit Checkbox und Name */}
      <div className="flex items-center gap-3 p-3">
        {/* Checkbox (nur bei completed) */}
        {item.status === 'completed' ? (
          <button
            onClick={onToggleSelect}
            className={`flex-shrink-0 ${item.selected ? 'text-green-400' : 'text-zinc-600'}`}
          >
            {item.selected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
          </button>
        ) : (
          <div className="w-5 flex-shrink-0" />
        )}
        
        {/* Status-Icon */}
        <div className={`flex-shrink-0 ${config.color}`}>
          {config.icon}
        </div>
        
        {/* Name */}
        <span className={`flex-1 font-medium ${
          item.status === 'completed' ? 'text-white' : 'text-zinc-400'
        }`}>
          {item.name}
        </span>
        
        {/* Status-Badge */}
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
          {item.status === 'completed' && 'Fertig'}
          {item.status === 'error' && 'Fehler'}
          {item.status === 'pending' && 'Wartend'}
          {item.status === 'processing' && 'Läuft...'}
          {item.status === 'skipped' && 'Übersprungen'}
        </span>
        
        {/* Expand/Collapse (nur bei completed) */}
        {item.status === 'completed' && item.result && (
          <button
            onClick={onToggleExpand}
            className="text-zinc-400 hover:text-white p-1"
          >
            {item.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
        
        {/* Löschen-Button */}
        <button
          onClick={onRemove}
          className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
          title="Aus Liste entfernen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Fehler-Anzeige */}
      {item.status === 'error' && item.error && (
        <div className="px-3 pb-3">
          <p className="text-xs text-red-400 pl-14">{item.error}</p>
        </div>
      )}
      
      {/* Details (ausgeklappt) */}
      {item.expanded && item.status === 'completed' && item.result && (
        <div className="px-3 pb-3 border-t border-zinc-800/50 pt-3">
          <div className="pl-14 space-y-2">
            {/* Kurz-Info */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-zinc-400">
                Typ: <span className="text-white">{item.result.researchData?.genetics?.type || 'Unbekannt'}</span>
              </span>
              <span className="text-zinc-400">
                THC: <span className="text-white">{item.result.thcContent}</span>
              </span>
            </div>
            
            {/* Wirkungen */}
            {item.result.effects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.result.effects.slice(0, 4).map((effect, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs"
                  >
                    {effect.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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