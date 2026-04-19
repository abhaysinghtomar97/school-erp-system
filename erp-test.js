import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 5 },    // very light
    { duration: '20s', target: 10 },   // light
    { duration: '20s', target: 20 },   // moderate
    { duration: '20s', target: 30 },   // push a bit
  ],
};

const BASE_URL = 'https://gvs-erp.onrender.com';

export default function () {

  let res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      identifier: "A_26001",
      password: "123456"
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  console.log(res.status);
console.log(res.body);
  check(res, {
    'login success': (r) => r.status === 200,
  });

  sleep(Math.random() * 2); // simulate real users
}