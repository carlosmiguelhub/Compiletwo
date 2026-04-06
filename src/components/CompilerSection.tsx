import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";

const LANGUAGES = ["python", "javascript", "cpp"] as const;

const DEFAULT_CODE: Record<string, string> = {
  python: `# Quick sort implementation
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + mid + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))`,
  javascript: `// Fibonacci sequence generator
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const gen = fibonacci();
const result = [];
for (let i = 0; i < 10; i++) {
  result.push(gen.next().value);
}
console.log(result);`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {5, 2, 8, 1, 9};
    
    // Bubble sort
    for (int i = 0; i < nums.size(); i++)
        for (int j = 0; j < nums.size()-i-1; j++)
            if (nums[j] > nums[j+1])
                swap(nums[j], nums[j+1]);
    
    for (int n : nums) cout << n << " ";
    return 0;
}`,
};

const OUTPUTS: Record<string, string> = {
  python: "[1, 1, 2, 3, 6, 8, 10]",
  javascript: "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]",
  cpp: "1 2 5 8 9",
};

const CompilerSection = () => {
  const [lang, setLang] = useState<string>("python");
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setOutput(OUTPUTS[lang]);
      setRunning(false);
    }, 800);
  };

  return (
    <section id="compiler" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <p className="font-mono text-sm text-primary mb-2">{'> compiler'}</p>
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground">
            Try the <span className="text-primary">compiler</span>
          </h2>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden max-w-4xl mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setOutput(null); }}
                  className={`font-mono text-xs px-3 py-1 rounded transition-all ${
                    lang === l
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setOutput(null)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="font-mono text-xs bg-primary text-primary-foreground px-4 py-1.5 rounded flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Play className="h-3 w-3" />
                {running ? "Running..." : "Run"}
              </button>
            </div>
          </div>

          {/* Code area */}
          <pre className="p-4 font-mono text-sm leading-relaxed overflow-x-auto min-h-[200px] bg-surface-code">
            <code className="text-foreground">{DEFAULT_CODE[lang]}</code>
          </pre>

          {/* Output */}
          <div className="border-t border-border px-4 py-3 bg-card min-h-[60px]">
            <p className="font-mono text-xs text-muted-foreground mb-1">
              <span className="text-primary">$</span> output
            </p>
            {running && (
              <p className="font-mono text-sm text-primary animate-pulse-glow">Compiling...</p>
            )}
            {output && (
              <p className="font-mono text-sm text-foreground">{output}</p>
            )}
            {!running && !output && (
              <p className="font-mono text-xs text-muted-foreground">Click "Run" to execute</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompilerSection;
