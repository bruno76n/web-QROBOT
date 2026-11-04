// NEGATIVE FIXTURE: src/lib must not import React or Astro (docs/07 §6, rule 3).
import { useState } from 'react';

export const bad = useState;
