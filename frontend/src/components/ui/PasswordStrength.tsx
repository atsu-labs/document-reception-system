interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

function calculatePasswordStrength(password: string): StrengthResult {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'bg-slate-200',
      suggestions: [],
    };
  }

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  else if (password.length < 8) suggestions.push('8文字以上にしてください');

  // Character variety checks
  if (/[a-z]/.test(password)) score += 0.5;
  else suggestions.push('小文字を含めてください');

  if (/[A-Z]/.test(password)) score += 0.5;
  else suggestions.push('大文字を含めてください');

  if (/[0-9]/.test(password)) score += 0.5;
  else suggestions.push('数字を含めてください');

  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
  else suggestions.push('記号を含めてください');

  // Common patterns check (weak if detected)
  const commonPatterns = [
    /^password/i,
    /^12345/,
    /^qwerty/i,
    /(.)\1{2,}/, // repeated characters
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 1);
    suggestions.push('よくあるパターンは避けてください');
  }

  // Map score to strength levels
  const finalScore = Math.min(4, Math.floor(score));
  
  const levels = [
    { label: '非常に弱い', color: 'bg-red-500' },
    { label: '弱い', color: 'bg-orange-500' },
    { label: '普通', color: 'bg-yellow-500' },
    { label: '強い', color: 'bg-green-500' },
    { label: '非常に強い', color: 'bg-green-600' },
  ];

  return {
    score: finalScore,
    label: levels[finalScore].label,
    color: levels[finalScore].color,
    suggestions: suggestions.slice(0, 3), // Show max 3 suggestions
  };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index <= strength.score ? strength.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          強度: {strength.label}
        </span>
      </div>

      {/* Suggestions */}
      {strength.suggestions.length > 0 && strength.score < 3 && (
        <ul className="text-xs text-slate-600 space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-1">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
