import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,          // 50 concurrent users
  duration: '30s',  // run for 30 seconds
};

export default function () {
  // rotate users between 1–100
  const userId = (__VU % 100) + 1;

  const payload = JSON.stringify({
    email: `user${userId}@test.com`,
    password: "123456",
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // LOGIN REQUEST
  const res = http.post(
    'http://localhost:5000/api/auth/login',
    payload,
    params
  );

  // DEBUG (very important)
  console.log(`USER: user${userId}`, "STATUS:", res.status, "BODY:", res.body);

  // CHECK
  check(res, {
    'login success': (r) => r.status === 200,
  });

  sleep(1);
}