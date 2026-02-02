import { Strain, Effect, MedicalUse } from '@/app/types/strain';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parst einen einzelnen Strain aus Text-Format:
 * Alien Mints Huala (27 % THC, Kanada)
 * A) Wirkungen
 * Basierend auf 127 analysierten Reviews
 * • Entspannend: 47 ×
 * B) Medizinische Anwendungen
 * ...
 */
export function parseStrainText(text: string): Partial<Strain> | null {
  const lines = text.trim().split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length === 0) return null;

  // Parse first line: "Strain Name (27% THC, Country)" or "Strain Name (27 % THC, Country)"
  const firstLine = lines[0];
  const nameMatch = firstLine.match(/^(.+?)\s*\(([^)]+)\)/);
  
  if (!nameMatch) {
    // Try simpler format: just the name
    return {
      id: uuidv4(),
      name: firstLine,
      thcContent: '',
      origin: '',
      effects: [],
      medicalUses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const name = nameMatch[1].trim();
  const details = nameMatch[2];

  // Parse THC and Origin from details
  const thcMatch = details.match(/(\d+(?:\s*%?\s*(?:-\s*\d+)?%?)\s*THC)/i);
  const thcContent = thcMatch ? thcMatch[1].replace(/\s+/g, '') : '';
  
  // Origin is typically after THC
  const originMatch = details.match(/(?:THC,?\s*)(.+)/i) || details.match(/,\s*([^,]+)$/);
  const origin = originMatch ? originMatch[1].trim() : '';

  const effects: Effect[] = [];
  const medicalUses: MedicalUse[] = [];
  let effectDescription = '';
  let medicalFocus = '';

  let currentSection: 'effects' | 'medical' | 'none' = 'none';
  let characteristicLine = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Section headers
    if (line.match(/^A\)\.?\s*Wirkung/i)) {
      currentSection = 'effects';
      continue;
    }
    if (line.match(/^B\)\.?\s*Medizin/i)) {
      currentSection = 'medical';
      continue;
    }

    // Skip review count lines
    if (line.match(/Basierend auf \d+ analysierten Reviews/i)) {
      continue;
    }

    // Parse bullet points: "• Effect: 47×" or "• Effect: 47 ×"
    const bulletMatch = line.match(/^[•\-\*]\s*(.+?)\s*:\s*(\d+)\s*[×x]?/i);
    if (bulletMatch) {
      const itemName = bulletMatch[1].trim();
      const frequency = parseInt(bulletMatch[2], 10);

      if (currentSection === 'effects') {
        effects.push({
          name: itemName,
          frequency,
          category: categorizeEffect(itemName),
        });
      } else if (currentSection === 'medical') {
        medicalUses.push({
          condition: itemName,
          frequency,
          isHighlighted: frequency > 30,
        });
      }
      continue;
    }

    // Characteristic description (line starting with description after bullet points)
    if (line.length > 20 && !line.startsWith('•') && !line.startsWith('-')) {
      if (currentSection === 'effects' && !effectDescription) {
        effectDescription = line;
      } else if (currentSection === 'medical' && !medicalFocus) {
        medicalFocus = line;
      }
    }
  }

  return {
    id: uuidv4(),
    name,
    thcContent: thcContent || extractTHC(details),
    origin: origin || extractOrigin(details),
    effects,
    medicalUses,
    effectDescription: effectDescription || undefined,
    medicalFocus: medicalFocus || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Parst mehrere Strains aus einem Text (getrennt durch Leerzeilen oder "---")
 */
export function parseMultipleStrains(text: string): Partial<Strain>[] {
  // Split by multiple newlines or "---" separator
  const strainBlocks = text.split(/(?:\n\s*\n|\n---\n)/);
  
  const strains: Partial<Strain>[] = [];
  
  for (const block of strainBlocks) {
    const trimmed = block.trim();
    if (trimmed) {
      const strain = parseStrainText(trimmed);
      if (strain && strain.name) {
        strains.push(strain);
      }
    }
  }

  return strains;
}

/**
 * Kategorisiert eine Wirkung als positiv, medizinisch oder negativ
 */
function categorizeEffect(effectName: string): 'positive' | 'medical' | 'negative' {
  const positiveEffects = [
    'glücklich', 'euphorisch', 'energisch', 'entspannt', 'entspannend',
    'kreativ', 'fokussiert', 'gesprächig', 'lustig', 'aufgestellt',
    'happy', 'euphoric', 'energetic', 'relaxed', 'creative', 'focused'
  ];
  
  const negativeEffects = [
    'trockener mund', 'rote augen', 'paranoid', 'anxious', 'schwindel',
    'dry mouth', 'red eyes', 'paranoia', 'anxiety', 'dizzy'
  ];

  const lower = effectName.toLowerCase();
  
  if (positiveEffects.some(e => lower.includes(e))) return 'positive';
  if (negativeEffects.some(e => lower.includes(e))) return 'negative';
  return 'medical';
}

/**
 * Extrahiert THC-Gehalt aus Details-String
 */
function extractTHC(details: string): string {
  const match = details.match(/(\d+(?:\s*-\s*\d+)?\s*%)/);
  return match ? match[1].replace(/\s+/g, '') : '';
}

/**
 * Extrahiert Herkunft aus Details-String
 */
function extractOrigin(details: string): string {
  // Remove THC part and clean up
  const withoutTHC = details.replace(/\d+\s*%?\s*THC,?\s*/i, '');
  return withoutTHC.trim();
}

/**
 * Validiert geparste Strain-Daten
 */
export function validateStrain(strain: Partial<Strain>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!strain.name || strain.name.trim().length < 2) {
    errors.push('Name muss mindestens 2 Zeichen haben');
  }

  // THC content is optional but should be valid if provided
  if (strain.thcContent && !strain.thcContent.match(/^\d+/)) {
    errors.push('THC-Gehalt sollte mit einer Zahl beginnen');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Konvertiert geparste Daten in vollständiges Strain-Objekt
 */
export function createStrainFromParsed(parsed: Partial<Strain>): Strain {
  return {
    id: parsed.id || uuidv4(),
    name: parsed.name || 'Unbenannter Strain',
    thcContent: parsed.thcContent || '',
    origin: parsed.origin || '',
    effects: parsed.effects || [],
    medicalUses: parsed.medicalUses || [],
    images: parsed.images,
    image: parsed.image,
    effectDescription: parsed.effectDescription,
    medicalFocus: parsed.medicalFocus,
    createdAt: parsed.createdAt || new Date(),
    updatedAt: parsed.updatedAt || new Date(),
  };
}