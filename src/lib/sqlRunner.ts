export async function runSql(query: string, userId: string) {
  const response = await fetch("http://localhost:5000/api/sql/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, userId }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "SQL execution failed.");
  }

  return data.result;
}