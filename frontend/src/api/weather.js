import api from "./api";

export async function getWeather(city) {
  const res = await api.get("/weather/", {
    params: { city },
  });
  return res.data;
}

