import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:8080/api/clipboard'); // Needs auth, but we can't do it easily without browser cookies
    console.log(res.status);
  } catch(e) { console.log(e.response ? e.response.status : e.message); }
}
test();
