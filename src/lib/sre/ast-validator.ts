import ts from 'typescript';

export interface ASTValidationResult {
  valid: boolean;
  errors: string[];
  repairedCode?: string;
  wasRepaired: boolean;
}

/**
 * Validates TypeScript/TSX code using the TypeScript compiler AST parser.
 * Returns parse errors and diagnostic messages.
 */
export function validateTsxSyntax(filePath: string, code: string): { valid: boolean; errors: string[] } {
  try {
    const isTsx = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true,
      isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const diagnostics = (sourceFile as any).parseDiagnostics || [];
    if (diagnostics.length === 0) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = diagnostics.map((d: any) => {
      const msg = typeof d.messageText === 'string' ? d.messageText : d.messageText?.messageText || 'Syntax error';
      const pos = sourceFile.getLineAndCharacterOfPosition(d.start || 0);
      return `Line ${pos.line + 1}:${pos.character + 1}: ${msg}`;
    });

    return { valid: false, errors };
  } catch (err: any) {
    return { valid: false, errors: [err.message] };
  }
}

/**
 * Common self-repair heuristics for AI-generated code patches:
 * - Detects and strips redundant duplicate closing delimiters (e.g., repeated </Switch>, );, })
 * - Normalizes mismatched brace endings
 */
export function attemptAutoRepair(filePath: string, code: string): { repaired: boolean; cleanCode: string } {
  // Check if original code has syntax errors
  const initial = validateTsxSyntax(filePath, code);
  if (initial.valid) {
    return { repaired: false, cleanCode: code };
  }

  // Heuristic 1: Duplicate closing tag/block repetitions
  // (e.g. </Switch>\n  );\n}\n    </Switch>\n  );\n})
  let candidate = code;
  const duplicatePatterns = [
    /(\s*<\/Switch>\s*\);\s*}\s*){2,}/g,
    /(\s*\);\s*}\s*){2,}/g,
    /(\s*<\/Routes>\s*\);\s*}\s*){2,}/g
  ];

  for (const pattern of duplicatePatterns) {
    if (pattern.test(candidate)) {
      candidate = candidate.replace(pattern, (match) => {
        // Return only the first occurrence
        const single = match.trim().split(/<\/Switch>|\);\s*}/)[0];
        return '\n    </Switch>\n  );\n}\n';
      });
    }
  }

  // Check if candidate is now valid
  const test1 = validateTsxSyntax(filePath, candidate);
  if (test1.valid) {
    return { repaired: true, cleanCode: candidate };
  }

  // Heuristic 2: Line-by-line syntax trim for stray closing lines
  const lines = code.split('\n');
  const cleanedLines: string[] = [];
  let openBraces = 0;
  let openParens = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for obvious stray closing lines after root level is already balanced
    if (openBraces <= 0 && openParens <= 0) {
      if (trimmed === '</Switch>' || trimmed === '</Routes>' || trimmed === ');' || trimmed === '}' || trimmed === '); }') {
        // Skip stray line
        continue;
      }
    }

    // Track delimiters
    for (const char of line) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces--;
      else if (char === '(') openParens++;
      else if (char === ')') openParens--;
    }

    cleanedLines.push(line);
  }

  const candidate2 = cleanedLines.join('\n');
  const test2 = validateTsxSyntax(filePath, candidate2);
  if (test2.valid) {
    return { repaired: true, cleanCode: candidate2 };
  }

  return { repaired: false, cleanCode: code };
}

/**
 * Pre-Flight AST validation gate:
 * Validates proposed patch before committing or opening a PR.
 * If errors are detected, attempts auto-repair.
 */
export function validateAndSanitizePatch({
  filePath,
  fullNewContent
}: {
  filePath: string;
  fullNewContent: string;
}): ASTValidationResult {
  const initialCheck = validateTsxSyntax(filePath, fullNewContent);
  if (initialCheck.valid) {
    return {
      valid: true,
      errors: [],
      repairedCode: fullNewContent,
      wasRepaired: false
    };
  }

  // Attempt auto-repair
  const repairResult = attemptAutoRepair(filePath, fullNewContent);
  if (repairResult.repaired) {
    console.log(`[Bastion SRE AST Guardrail] Successfully auto-repaired syntax in ${filePath}`);
    return {
      valid: true,
      errors: [],
      repairedCode: repairResult.cleanCode,
      wasRepaired: true
    };
  }

  return {
    valid: false,
    errors: initialCheck.errors,
    repairedCode: fullNewContent,
    wasRepaired: false
  };
}
