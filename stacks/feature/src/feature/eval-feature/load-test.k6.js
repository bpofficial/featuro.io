import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 10 }, // below normal load
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 }, // normal load
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 }, // around the breaking point
        { duration: '5m', target: 300 },
        { duration: '2m', target: 400 }, // beyond the breaking point
        { duration: '5m', target: 400 },
        { duration: '10m', target: 0 }, // scale down. Recovery stage.
    ],
    thresholds: {
        // the rate of successful checks should be higher than 95%
        checks: ['rate>0.95'],
        http_req_duration: ['avg<80', 'p(95)<200']
    },
};

export default function () {
    const projectId = __ENV.PROJECT_ID;
    const featureId = __ENV.FEATURE_ID;
    const URL = `http://localhost:9000/api/v1/projects/${projectId}/features/${featureId}/evaluate?context=`;

    const res = http.get(URL, {
        headers: {
            'x-api-key': 'D8HjTAgIRheYKPclug12XszpBctA57sludFg'
        },
    });
    check(res, {
        "response code was 200": res => res.status === 200,
    })

    sleep(1)
}