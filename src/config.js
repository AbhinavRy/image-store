const prod = true;

const DEV_URL = "http://localhost:5000";
const PROD_URL = "https://image-store.onrender.com";

const BASE_URL = prod ? PROD_URL : DEV_URL;

export { BASE_URL };