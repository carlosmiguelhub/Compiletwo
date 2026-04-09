export type Judge0LanguageKey =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "c"
  | "cpp"
  | "csharp";

export type RunCodeParams = {
  sourceCode: string;
  language: Judge0LanguageKey;
  stdin?: string;
};

export type RunCodeResult = {
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: string;
};

const languageIdMap: Record<Judge0LanguageKey, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  csharp: 51,
};

const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";

export async function runCode({
  sourceCode,
  language,
  stdin = "",
}: RunCodeParams): Promise<RunCodeResult> {
  const languageId = languageIdMap[language];

  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const rapidApiHost = import.meta.env.VITE_RAPIDAPI_HOST;

  if (!rapidApiKey) {
    throw new Error("Missing VITE_RAPIDAPI_KEY in your .env file.");
  }

  if (!rapidApiHost) {
    throw new Error("Missing VITE_RAPIDAPI_HOST in your .env file.");
  }

  const submissionResponse = await fetch(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": rapidApiHost,
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin,
      }),
    }
  );

  if (!submissionResponse.ok) {
    let errorDetails = "";

    try {
      const errorData = await submissionResponse.json();
      errorDetails =
        errorData?.message ||
        errorData?.error ||
        JSON.stringify(errorData);
    } catch {
      try {
        errorDetails = await submissionResponse.text();
      } catch {
        errorDetails = "";
      }
    }

    throw new Error(
      errorDetails
        ? `Judge0 request failed (${submissionResponse.status}): ${errorDetails}`
        : `Judge0 request failed with status ${submissionResponse.status}.`
    );
  }

  const data = await submissionResponse.json();

  return {
    stdout: data.stdout ?? "",
    stderr: data.stderr ?? "",
    compileOutput: data.compile_output ?? "",
    message: data.message ?? "",
    status: data.status?.description ?? "Unknown status",
  };
}