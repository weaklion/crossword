export const getWord = async () => {
  const baseUrl = "https://stdict.korean.go.kr/api/search.do";

  const key = process.env.KEY ?? "";

  const params = {
    key: key,
    q: "사랑",
    req_type: "json",
    num: "10",
    advanced: "y",
    method: "include",
  };

  const paramsQueryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}?${paramsQueryString}`;

  const res = await fetch(url);

  const data = await res.json();

  console.log(data, "data");
};
