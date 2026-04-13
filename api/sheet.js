export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const url = 'https://docs.google.com/spreadsheets/d/1KyFC5Xp1tiLITL_5D1VA_UXxS0oErTi86094A4fkZSc/pub?gid=0&single=true&output=csv'
    const response = await fetch(url)
    const csv = await response.text()
    res.status(200).send(csv)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
