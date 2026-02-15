export async function fetchCountryInfo(code) {
  const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}